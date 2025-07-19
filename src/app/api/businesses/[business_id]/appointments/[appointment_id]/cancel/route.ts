import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { business_id: string; appointment_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, appointment_id } = params;

    // Verify business ownership/customer access and appointment exists
    const appointment = await prisma.servicerequest.findFirst({
      where: {
        request_reference: appointment_id,
        business: {
          business_id: business_id,
          OR: [
            { manager_id: session.user.id },
            {
              servicerequest: {
                some: {
                  customer_user_id: session.user.id
                }
              }
            }
          ]
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or access denied" }, { status: 404 });
    }

    // Get cancellation reason from request body
    const body = await request.json();
    const { reason } = body;

    // Update appointment status
    const updatedAppointment = await prisma.servicerequest.update({
      where: { request_reference: appointment_id },
      data: { 
        status: 'cancelled',
        date_updated: new Date()
      }
    });

    return NextResponse.json({
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }
} 