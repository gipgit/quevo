import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { processAndSaveImage } from "@/lib/imageUpload"

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params
    console.log("Service image upload started", { business_id, service_id });
    
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

    console.log("Business verified", { business_public_uuid: business.business_public_uuid });

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

    console.log("Image file validated", { 
      filename: imageFile.name, 
      size: imageFile.size, 
      type: imageFile.type 
    });

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    console.log("Image buffer created", { bufferSize: buffer.length });

    // Get business public UUID for R2 path
    const businessPublicUuid = business.business_public_uuid
    if (!businessPublicUuid) {
      return NextResponse.json({ error: "Business public UUID not found" }, { status: 500 })
    }

    console.log("Starting R2 upload", {
      businessPublicUuid,
      service_id,
      bucket: process.env.CLOUDFLARE_R2_BUCKET_BUSINESS_PUBLIC
    });

    // Process and upload image to R2
    const result = await processAndSaveImage({
      buffer,
      filename: `${service_id}.webp`,
      width: 800, // Service cover width
      height: 450, // Service cover height (16:9 ratio)
      quality: 80,
      fit: "cover",
      maxSizeBytes: 500 * 1024, // 500KB max
      businessId: businessPublicUuid,
      uploadType: "service",
      serviceBoardId: service_id, // Use service_id for the path
    })

    console.log("R2 upload completed", { 
      path: result.path, 
      size: result.size, 
      publicPath: result.publicPath 
    });

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
