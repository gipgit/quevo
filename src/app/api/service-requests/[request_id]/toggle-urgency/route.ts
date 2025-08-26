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
    const { urgency_flag } = body

    // Update the service request
    const updatedRequest = await prisma.servicerequest.update({
      where: { request_id },
      data: {
        urgency_flag,
        date_updated: new Date()
      }
    })

    return NextResponse.json({ success: true, request: updatedRequest })
  } catch (error) {
    console.error("Error toggling urgency flag:", error)
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    )
  }
}
