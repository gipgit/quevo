import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { processAndSaveImage } from "@/lib/imageUpload"

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { business_id, service_id } = params

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

    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer())

    // Get business public UUID for R2 path
    const businessPublicUuid = business.business_public_uuid
    if (!businessPublicUuid) {
      return NextResponse.json({ error: "Business public UUID not found" }, { status: 500 })
    }

    // Process and upload image to R2
    const result = await processAndSaveImage({
      buffer,
      filename: "cover.webp",
      width: 800, // Service cover width
      height: 450, // Service cover height (16:9 ratio)
      quality: 80,
      fit: "cover",
      maxSizeBytes: 500 * 1024, // 500KB max
      businessId: businessPublicUuid,
      uploadType: "service",
      serviceBoardId: service_id, // Use service_id for the path
    })

    // No need to update service - path is deterministic
    // We can construct the path anytime using business_public_uuid and service_id

    return NextResponse.json({
      success: true,
      path: result.path,
      publicPath: result.publicPath,
      size: result.size,
    })
  } catch (error) {
    console.error("Error uploading service image:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
