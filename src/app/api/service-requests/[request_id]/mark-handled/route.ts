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
    // No need to extract is_handled from body since we're toggling

    console.log("Mark handled request:", { request_id, user: session.user.email })

    // First, let's check if the request exists
    const existingRequest = await prisma.servicerequest.findUnique({
      where: { request_id }
    })

    if (!existingRequest) {
      console.log("Request not found:", request_id)
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    console.log("Existing request:", { 
      request_id: existingRequest.request_id, 
      is_handled: existingRequest.is_handled,
      urgency_flag: existingRequest.urgency_flag 
    })

    // Update the service request - toggle the handled state
    const updatedRequest = await prisma.servicerequest.update({
      where: { request_id },
      data: {
        is_handled: !existingRequest.is_handled, // Toggle the current state
        handled_at: !existingRequest.is_handled ? new Date() : null,
        handled_by: !existingRequest.is_handled ? session.user.name || session.user.email : null,
        date_updated: new Date()
      }
    })

    console.log("Updated request:", { 
      request_id: updatedRequest.request_id, 
      is_handled: updatedRequest.is_handled,
      urgency_flag: updatedRequest.urgency_flag 
    })

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error("Error marking request as handled:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}
