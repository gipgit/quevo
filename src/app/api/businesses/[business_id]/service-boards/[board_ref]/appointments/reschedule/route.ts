import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { board_ref: string } }
) {
  try {
    const body = await request.json();
    const { reason, current_datetime } = body;

    // Get the service board ID from the board_ref
    const serviceBoard = await prisma.serviceboard.findUnique({
      where: { board_ref: params.board_ref },
      select: { board_id: true },
    });

    if (!serviceBoard) {
      return NextResponse.json(
        { error: "Service board not found" },
        { status: 404 }
      );
    }

    // Update the appointment status to rescheduled
    const appointment = await prisma.appointment.updateMany({
      where: { 
        service_board_id: serviceBoard.board_id,
        appointment_datetime: new Date(current_datetime),
        status: "scheduled"
      },
      data: { 
        status: "rescheduled",
        notes: reason
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error requesting appointment reschedule:", error);
    return NextResponse.json(
      { error: "Failed to request appointment reschedule" },
      { status: 500 }
    );
  }
} 