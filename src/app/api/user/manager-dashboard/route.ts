import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get UserManager with plan
    const userManager = await prisma.usermanager.findUnique({
      where: { user_id: session.user.id },
      include: { plan: true },
    })
    if (!userManager) {
      return NextResponse.json({ error: "UserManager not found" }, { status: 404 })
    }

    // Get all businesses for this manager
    const businesses = await prisma.business.findMany({
      where: { manager_id: session.user.id },
      select: {
        business_id: true,
        business_name: true,
        business_urlname: true,
        business_country: true,
        business_region: true,
        business_address: true,
        business_email: true,
        business_phone: true,
        business_descr: true,
        business_img_profile: true,
        business_img_cover: true,
        date_created: true,
      },
    })

    return NextResponse.json({
      userManager: {
        id: userManager.user_id,
        name_first: userManager.name_first,
        name_last: userManager.name_last,
        email: userManager.email,
        plan: userManager.plan,
      },
      businesses,
    })
  } catch (error) {
    console.error("Error in manager-dashboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
