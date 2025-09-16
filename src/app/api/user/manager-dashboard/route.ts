import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get UserManager
    const userManager = await prisma.usermanager.findUnique({
      where: { user_id: session.user.id },
    })
    if (!userManager) {
      return NextResponse.json({ error: "UserManager not found" }, { status: 404 })
    }

    // Get all businesses for this manager with their plans
    const businesses = await prisma.business.findMany({
      where: { manager_id: session.user.id },
      include: {
        plan: true, // Include the plan for each business
      },
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
        business_public_uuid: true,
        date_created: true,
        plan: true, // Include plan data
        ai_credits_used: true,
        ai_credits_reset_date: true,
      },
    })

    // For backward compatibility, use the first business's plan as the "user plan"
    // In the future, this could be removed as each business will have its own plan
    const userPlan = businesses.length > 0 ? businesses[0].plan : null

    return NextResponse.json({
      userManager: {
        id: userManager.user_id,
        name_first: userManager.name_first,
        name_last: userManager.name_last,
        email: userManager.email,
        plan: userPlan, // For backward compatibility
      },
      businesses,
    })
  } catch (error) {
    console.error("Error in manager-dashboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
