import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const business_id = params.business_id
    if (!business_id) return NextResponse.json({ error: "Missing business_id" }, { status: 400 })
    // Fetch all profile data in one go
    const [business, settings, links, payments] = await Promise.all([
      prisma.business.findUnique({ where: { business_id: business_id } }),
      prisma.businessprofilesettings.findUnique({ where: { business_id: business_id } }),
      prisma.businesslink.findMany({ where: { business_id: business_id } }),
      prisma.businesspaymentmethod.findMany({
        where: { business_id: business_id },
        include: { paymentmethod: true },
      }),
    ])
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // --- Patch image paths for frontend ---
    let patchedProfileData = { ...business }
    if (business.business_public_uuid) {
      patchedProfileData.business_img_profile = `/uploads/business/${business.business_public_uuid}/profile.webp`
      patchedProfileData.business_img_cover = `/uploads/business/${business.business_public_uuid}/cover.webp`
    } else {
      patchedProfileData.business_img_profile = null
      patchedProfileData.business_img_cover = null
    }

    // Format response for frontend
    return NextResponse.json({
      profileData: patchedProfileData,
      profileSettings: settings,
      socialLinks: Object.fromEntries(
        links.map(l => [l.link_type, { url: l.link_url, visible: l.visible }])
      ),
      paymentMethods: payments.map(pm => ({
        type: pm.paymentmethod?.method_name || pm.payment_method_id,
        visible: pm.visible,
        details: pm.method_details_json || {},
      })),
    })
  } catch (error) {
    console.error("Error fetching business profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
