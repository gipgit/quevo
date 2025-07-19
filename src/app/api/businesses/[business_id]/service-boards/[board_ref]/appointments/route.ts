import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;

    // First verify board exists and belongs to the business
    const board = await prisma.serviceboard.findFirst({
      where: {
        board_ref,
        business: {
          business_id
        }
      },
      select: {
        board_id: true
      }
    });

    if (!board) {
      return NextResponse.json({ error: "Service board not found" }, { status: 404 });
    }

    // Get all appointments linked to this service board
    const appointments = await prisma.appointment.findMany({
      where: {
        business_id,
        service_board_id: board.board_id
      },
      select: {
        id: true,
        appointment_datetime: true,
        appointment_type: true,
        appointment_location: true,
        platform_name: true,
        platform_link: true,
        status: true,
        notes: true,
        appointment_title: true,
        created_at: true,
        updated_at: true,
        usercustomer: {
          select: {
            user_id: true,
            name_first: true,
            name_last: true,
            email: true
          }
        }
      },
      orderBy: {
        appointment_datetime: 'desc'
      }
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching service board appointments:", error);
    return NextResponse.json({ error: "Failed to fetch service board appointments" }, { status: 500 });
  }
} 