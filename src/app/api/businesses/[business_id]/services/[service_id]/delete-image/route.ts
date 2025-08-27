import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { deleteImageFromR2, getServiceImagePath } from "@/lib/imageUpload"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params
    console.log("Service image deletion started", { business_id, service_id });
    
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Verify service exists and belongs to this business
    const service = await prisma.service.findFirst({
      where: {
        service_id: service_id,
        business_id: business_id,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Get the image path to delete from R2
    const businessPublicUuid = business.business_public_uuid
    if (!businessPublicUuid) {
      return NextResponse.json({ error: "Business public UUID not found" }, { status: 500 })
    }

    const imagePath = getServiceImagePath(businessPublicUuid, service_id)

    try {
      // Delete from R2
      await deleteImageFromR2(imagePath, "service")
      console.log("Image deleted from R2:", imagePath)
    } catch (r2Error) {
      console.error("Failed to delete image from R2:", r2Error)
      // Continue with database update even if R2 deletion fails
    }

    // Update service to set has_image to false
    await prisma.service.update({
      where: {
        service_id: service_id,
      },
      data: {
        has_image: false,
      },
    })

    console.log("Service has_image flag updated to false")

    return NextResponse.json({
      success: true,
      message: "Service image deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting service image:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      business_id: params.business_id,
      service_id: params.service_id
    })
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
