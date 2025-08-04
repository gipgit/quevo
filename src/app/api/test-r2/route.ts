import { NextResponse } from "next/server"
import { processAndSaveImage } from "@/lib/imageUpload"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const testImage = formData.get("test_image") as File

    if (!testImage) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const bytes = await testImage.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await processAndSaveImage({
      buffer,
      filename: "test-image.webp",
      width: 400,
      height: 400,
      quality: 80,
      fit: "cover",
      maxSizeBytes: 1024 * 1024,
      businessId: "test-business-id",
      uploadType: "business",
    })

    return NextResponse.json({
      success: true,
      result,
      message: "Test upload successful"
    })

  } catch (error) {
    console.error("R2 test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "R2 test endpoint ready",
    instructions: "POST with formData containing 'test_image' file"
  })
} 