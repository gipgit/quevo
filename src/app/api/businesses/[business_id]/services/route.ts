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
    const services = await prisma.service.findMany({
      where: {
        business_id: business_id,
        is_active: true,
      },
      include: {
        servicecategory: {
          select: {
            category_name: true,
          },
        },
        servicequestion: {
          where: {
            is_active: true,
          },
          select: {
            question_id: true,
            question_text: true,
            question_type: true,
            is_required: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
        servicerequirementblock: {
          where: {
            is_active: true,
          },
          select: {
            requirement_block_id: true,
            title: true,
            requirements_text: true,
          },
        },
        serviceitem: {
          where: {
            is_active: true,
          },
          select: {
            service_item_id: true,
            item_name: true,
            item_description: true,
            price_base: true,
            price_type: true,
            price_unit: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
        serviceextra: {
          where: {
            is_active: true,
          },
          select: {
            service_extra_id: true,
            extra_name: true,
            extra_description: true,
            price_base: true,
            price_type: true,
            price_unit: true,
          },
          orderBy: {
            display_order: "asc",
          },
        },
      },
      orderBy: [{ display_order: "asc" }, { service_name: "asc" }],
    })
    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
