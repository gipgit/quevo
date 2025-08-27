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
    const { is_closed } = body

    console.log("Toggle closed request:", { request_id, is_closed, user: session.user.email })

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
      urgency_flag: existingRequest.urgency_flag,
      is_closed: existingRequest.is_closed
    })

    // Update the service request
    const updatedRequest = await prisma.servicerequest.update({
      where: { request_id },
      data: {
        is_closed,
        date_updated: new Date()
      }
    })

    console.log("Updated request:", { 
      request_id: updatedRequest.request_id, 
      is_handled: updatedRequest.is_handled,
      urgency_flag: updatedRequest.urgency_flag,
      is_closed: updatedRequest.is_closed
    })

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error("Error toggling closed status:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}
