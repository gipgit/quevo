import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"


export async function PUT(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const business_id = params.business_id
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 })

    // Fetch business and check ownership
    const business = await prisma.business.findUnique({ where: { business_id: business_id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (business.manager_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()

    // Build updates object with only provided fields
    const updates: any = {}
    
    // Basic fields
    if (body.business_name !== undefined) updates.business_name = body.business_name
    if (body.business_descr !== undefined) updates.business_descr = body.business_descr
    if (body.business_address !== undefined) updates.business_address = body.business_address
    if (body.business_country !== undefined) updates.business_country = body.business_country
    if (body.business_region !== undefined) updates.business_region = body.business_region
    if (body.business_city !== undefined) updates.business_city = body.business_city
    
    // Emails/phones as JSON (accept arrays, serialize here)
    if (body.business_emails !== undefined) {
      let emails = body.business_emails
      if (typeof emails === "string") {
        try { emails = JSON.parse(emails) } catch {}
      }
      if (!Array.isArray(emails) || emails.length > 3)
        return NextResponse.json({ error: "Invalid emails" }, { status: 400 })
      const emailArr = emails.map((e: any) => typeof e === "object" ? e.value : e)
      updates.business_email = JSON.stringify(emailArr)
    }
    
    if (body.business_phones !== undefined) {
      let phones = body.business_phones
      if (typeof phones === "string") {
        try { phones = JSON.parse(phones) } catch {}
      }
      if (!Array.isArray(phones) || phones.length > 3)
        return NextResponse.json({ error: "Invalid phones" }, { status: 400 })
      const phoneArr = phones.map((p: any) => typeof p === "object" ? p.value : p)
      updates.business_phone = JSON.stringify(phoneArr)
    }
    
    // business_urlname change (max once every 7 days)
    if (body.business_urlname !== undefined && body.business_urlname !== business.business_urlname) {
      const lastEdit = business.business_urlname_last_edited
      const URLNAME_CHANGE_DAYS = 7
      if (lastEdit && (Date.now() - new Date(lastEdit).getTime()) < URLNAME_CHANGE_DAYS * 86400000) {
        return NextResponse.json({ error: `You can change your URL name only once every ${URLNAME_CHANGE_DAYS} days.` }, { status: 400 })
      }
      // Check availability
      const exists = await prisma.business.findFirst({ where: { business_urlname: body.business_urlname } })
      if (exists) return NextResponse.json({ error: "URL name already taken" }, { status: 400 })
      updates.business_urlname = body.business_urlname
      updates.business_urlname_last_edited = new Date()
    }
    
    // Images (just update path, actual upload handled elsewhere)
    if (body.business_img_profile !== undefined) updates.business_img_profile = body.business_img_profile
    if (body.business_img_cover !== undefined) updates.business_img_cover = body.business_img_cover
    
    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: true, message: "No changes to save" })
    }
    
    // Save business
    await prisma.business.update({ where: { business_id: business_id }, data: updates })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /profile/info:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 