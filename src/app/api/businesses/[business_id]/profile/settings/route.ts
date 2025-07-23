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
    
    const body = await request.json()
    
    // Fetch business and check ownership
    const business = await prisma.business.findUnique({ where: { business_id: business_id } })
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })
    if (business.manager_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // Get current settings to compare
    const currentSettings = await prisma.businessprofilesettings.findUnique({ 
      where: { business_id: business_id } 
    })
    
    if (!currentSettings) {
      return NextResponse.json({ error: "Profile settings not found" }, { status: 404 })
    }

    // Only update if there are changes
    if (body.settings && Object.keys(body.settings).length > 0) {
      await prisma.businessprofilesettings.update({
        where: { business_id: business_id },
        data: body.settings,
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PUT /profile/settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 