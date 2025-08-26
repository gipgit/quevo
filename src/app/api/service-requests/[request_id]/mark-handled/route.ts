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
    const { is_handled } = body

    // Update the service request
    const updatedRequest = await prisma.servicerequest.update({
      where: { request_id },
      data: {
        is_handled,
        handled_at: is_handled ? new Date() : null,
        handled_by: is_handled ? session.user.name || session.user.email : null,
        date_updated: new Date()
      }
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
