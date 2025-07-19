import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { business_id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const business_id = params.business_id

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    const categories = await prisma.servicecategory.findMany({
      where: {
        business_id: business_id,
      },
      select: {
        category_id: true,
        category_name: true,
      },
      orderBy: {
        category_name: "asc",
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
