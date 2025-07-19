import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

console.log("[api/businesses/route.tsx] API route file loaded");

export async function GET(request: Request) {
  const t = await getTranslations("ApiErrors")
  try {
    const session = await auth()
    const now = new Date().toISOString()
    const userId = session?.user?.id || "unknown"
    const userRole = session?.user?.role || "unknown"

    if (!session?.user?.id) {
      console.error(`[${now}] [businesses API] Unauthorized access attempt. User: ${userId}`)
      return NextResponse.json({ message: t("unauthorized") }, { status: 401 })
    }
    if (userRole !== "manager") {
      console.error(`[${now}] [businesses API] Forbidden: User is not a manager. User: ${userId}`)
      return NextResponse.json({ message: t("forbidden") }, { status: 403 })
    }

    const businesses = await prisma.business.findMany({
      where: {
        manager_id: session.user.id,
      },
      select: {
        business_id: true,
        business_name: true,
        business_city: true,
        business_img_profile: true,
        business_urlname: true,
        business_country: true,
        business_region: true,
        business_address: true,
        business_phone: true,
        business_email: true,
        business_descr: true,
        date_created: true,
        sponsored: true,
        sponsored_level: true,
      },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    const now = new Date().toISOString()
    const userId = (error && typeof error === 'object' && 'session' in error && (error as any).session?.user?.id)
      ? (error as any).session.user.id
      : "unknown"
    console.error(`[${now}] [businesses API] Error:`, error, `User: ${userId}`)
    return NextResponse.json({ message: t("internalServerError") }, { status: 500 })
  }
}
