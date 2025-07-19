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
      datetime,
      platform
    } = body;

    // Input Validation
    if (!action_id || !datetime) {
      return NextResponse.json({ error: 'Missing required fields: action_id and datetime' }, { status: 400 });
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

    // Verify the action is in pending_customer status
    const actionDetails = serviceBoardAction.action_details as any;
    if (actionDetails.confirmation_status !== 'pending_customer') {
      return NextResponse.json({ error: 'Appointment is not in pending status.' }, { status: 400 });
    }

    // Create appointment and update action details in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the appointment
      const appointment = await prisma.appointment.create({
        data: {
          business_id: business_id,
          service_board_id: serviceBoardAction.board_id,
          customer_id: serviceBoardAction.customer_id,
          appointment_datetime: new Date(datetime),
          appointment_title: actionDetails.appointment_title || serviceBoardAction.action_title,
          appointment_type: actionDetails.appointment_type,
          appointment_location: actionDetails.appointment_type === 'online' ? 'Online' : (actionDetails.address || 'TBD'),
          platform_name: actionDetails.appointment_type === 'online' ? platform : null,
          platform_link: actionDetails.appointment_type === 'online' ? null : null, // Could be generated based on platform
          status: 'scheduled',
          originating_action_id: action_id,
        }
      });

      // Update the action details
      const updatedActionDetails = {
        ...actionDetails,
        confirmation_status: 'confirmed',
        datetime_confirmed: datetime,
        platform_confirmed: actionDetails.appointment_type === 'online' ? platform : null,
                platforms_selected: actionDetails.appointment_type === 'online' && platform
          ? [...(actionDetails.platforms_selected || []), platform]
          : actionDetails.platforms_selected || [],
        appointment_id: appointment.id
      };

      // Update the service board action
      const updatedAction = await prisma.serviceboardaction.update({
        where: {
          action_id: action_id
        },
        data: {
          action_details: updatedActionDetails,
          action_status: 'completed',
          updated_at: new Date()
        }
      });

      return {
        appointment,
        action: updatedAction
      };
    });

    return NextResponse.json({
      message: 'Appointment confirmed successfully!',
      appointment: result.appointment,
      action: result.action
    }, { status: 200 });

  } catch (error) {
    console.error("Error confirming appointment:", error);
    return NextResponse.json({ error: "Failed to confirm appointment" }, { status: 500 });
  }
} 