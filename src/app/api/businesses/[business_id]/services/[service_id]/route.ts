import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params
    const serviceId = parseInt(service_id)

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 })
    }

    // Check if the service exists and belongs to the business
    const existingService = await prisma.service.findFirst({
      where: {
        service_id: serviceId,
        business_id: business_id,
      },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Delete the service (this will cascade to related records due to foreign key constraints)
    await prisma.service.delete({
      where: {
        service_id: serviceId,
      },
    })

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    )
  }
} 