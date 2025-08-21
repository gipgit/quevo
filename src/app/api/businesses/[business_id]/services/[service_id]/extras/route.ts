import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params

    // Verify the service belongs to the business
    const service = await prisma.service.findFirst({
      where: {
        service_id: service_id,
        business_id: business_id,
        is_active: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Fetch service extras
    const extras = await prisma.serviceextra.findMany({
      where: {
        service_id: service_id,
        is_active: true,
      },
      orderBy: {
        display_order: 'asc',
      },
    })

    return NextResponse.json({ extras })
  } catch (error) {
    console.error("Error fetching service extras:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
