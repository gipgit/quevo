import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { request_id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { request_id } = params
    const body = await request.json()
    const { generated_response } = body

    if (!generated_response) {
      return NextResponse.json({ error: "Generated response is required" }, { status: 400 })
    }

    console.log("Save generated response request:", { request_id, user: session.user.email })

    // Check if the request exists
    const existingRequest = await prisma.servicerequest.findUnique({
      where: { request_id }
    })

    if (!existingRequest) {
      console.log("Request not found:", request_id)
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Update the service request with generated response
    const updatedRequest = await prisma.servicerequest.update({
      where: { request_id },
      data: {
        generated_response,
        generated_response_saved_at: new Date(),
        date_updated: new Date()
      }
    })

    console.log("Saved generated response for request:", { 
      request_id: updatedRequest.request_id,
      has_response: !!updatedRequest.generated_response
    })

    return NextResponse.json({ 
      success: true, 
      request: updatedRequest,
      message: "Response saved successfully"
    })
  } catch (error) {
    console.error("Error saving generated response:", error)
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    )
  }
}
