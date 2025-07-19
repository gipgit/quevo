import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { board_ref: string } }
) {
  try {
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

    // Update the appointment status to rejected
    const appointment = await prisma.appointment.updateMany({
      where: { 
        service_board_id: serviceBoard.board_id,
        status: "pending"
      },
      data: { status: "rejected" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    return NextResponse.json(
      { error: "Failed to reject appointment" },
      { status: 500 }
    );
  }
} 