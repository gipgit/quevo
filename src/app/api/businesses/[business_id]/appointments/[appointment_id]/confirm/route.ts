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

    // Verify business ownership and appointment exists
    const appointment = await prisma.servicerequest.findFirst({
      where: {
        request_reference: appointment_id,
        business: {
          business_id: business_id,
          manager_id: session.user.id
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or access denied" }, { status: 404 });
    }

    // Update appointment status
    const updatedAppointment = await prisma.servicerequest.update({
      where: { request_reference: appointment_id },
      data: { status: 'confirmed' }
    });

    return NextResponse.json({
      message: "Appointment confirmed successfully",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Error confirming appointment:", error);
    return NextResponse.json({ error: "Failed to confirm appointment" }, { status: 500 });
  }
} 