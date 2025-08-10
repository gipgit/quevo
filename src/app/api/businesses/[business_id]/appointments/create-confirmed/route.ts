import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const business_id = params.business_id;
    const body = await request.json();

    const {
      action_id,
      appointment_datetime,
      appointment_title,
      appointment_type,
      appointment_location,
      platform_name,
      platform_link,
      service_board_id
    } = body;

    // Input Validation
    if (!action_id || !appointment_datetime || !appointment_title || !appointment_type) {
      return NextResponse.json({ error: 'Missing required fields: action_id, appointment_datetime, appointment_title, appointment_type' }, { status: 400 });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { business_id: business_id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
    }

    // Get the service board action
    const serviceBoardAction = await prisma.serviceboardaction.findFirst({
      where: {
        action_id: action_id,
        serviceboard: {
          business_id: business_id
        }
      },
      include: {
        serviceboard: {
          include: {
            service: true
          }
        }
      }
    });

    if (!serviceBoardAction) {
      return NextResponse.json({ error: 'Service board action not found.' }, { status: 404 });
    }

    // Verify the action is an appointment scheduling action
    if (serviceBoardAction.action_type !== 'appointment_scheduling') {
      return NextResponse.json({ error: 'Invalid action type. Expected appointment_scheduling.' }, { status: 400 });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        business_id: business_id,
        service_board_id: serviceBoardAction.board_id,
        customer_id: serviceBoardAction.customer_id,
        appointment_datetime: new Date(appointment_datetime),
        appointment_title: appointment_title,
        appointment_type: appointment_type,
        appointment_location: appointment_location,
        platform_name: appointment_type === 'online' ? platform_name : null,
        platform_link: appointment_type === 'online' ? platform_link : null,
        status: 'scheduled',
        originating_action_id: action_id,
      }
    });

    return NextResponse.json({
      message: 'Confirmed appointment created successfully!',
      appointment: appointment
    }, { status: 200 });

  } catch (error) {
    console.error("Error creating confirmed appointment:", error);
    return NextResponse.json({ error: "Failed to create confirmed appointment" }, { status: 500 });
  }
}
