import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, board_ref } = params;
    const body = await request.json();

    // First verify board exists and belongs to the business
    const board = await prisma.serviceboard.findFirst({
      where: {
        board_ref,
        business: {
          business_id,
          manager_id: session.user.id
        }
      },
      select: {
        board_id: true
      }
    });

    if (!board) {
      return NextResponse.json({ error: "Service board not found or access denied" }, { status: 404 });
    }

    // Create new appointment
    const appointment = await prisma.appointment.create({
      data: {
        business_id,
        service_board_id: board.board_id,
        customer_id: session.user.role === 'customer' ? session.user.id : body.customerId,
        appointment_datetime: new Date(body.appointmentDateTime),
        appointment_type: body.appointmentType,
        appointment_location: body.appointmentLocation,
        platform_name: body.platformName || null,
        platform_link: body.platformLink || null,
        status: 'scheduled',
        notes: body.notes || null,
        originating_action_id: body.originatingActionId || null
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
        created_at: true,
        updated_at: true,
        usercustomer: {
          select: {
            user_id: true,
            name_first: true,
            name_last: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Appointment created successfully",
      appointment
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
} 