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
      reason,
      current_datetime
    } = body;

    // Input Validation
    if (!action_id || !reason) {
      return NextResponse.json({ error: 'Missing required fields: action_id and reason' }, { status: 400 });
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
      }
    });

    if (!serviceBoardAction) {
      return NextResponse.json({ error: 'Service board action not found.' }, { status: 404 });
    }

    // Verify the action is an appointment scheduling action
    if (serviceBoardAction.action_type !== 'appointment_scheduling') {
      return NextResponse.json({ error: 'Invalid action type. Expected appointment_scheduling.' }, { status: 400 });
    }

    // Update the action details
    const actionDetails = serviceBoardAction.action_details as any;
    const updatedActionDetails = {
      ...actionDetails,
      confirmation_status: 'rescheduled',
      reschedule_reason: reason,
      datetime_confirmed: null, // Clear the confirmed datetime since it's being rescheduled
      platform_confirmed: null // Clear the confirmed platform
    };

    // Update the service board action
    const updatedAction = await prisma.serviceboardaction.update({
      where: {
        action_id: action_id
      },
      data: {
        action_details: updatedActionDetails,
        action_status: 'pending',
        updated_at: new Date()
      }
    });

    // If there's an existing appointment, update its status
    if (actionDetails.appointment_id) {
      await prisma.appointment.update({
        where: {
          id: actionDetails.appointment_id
        },
        data: {
          status: 'rescheduled',
          notes: reason
        }
      });
    }

    return NextResponse.json({
      message: 'Appointment reschedule requested successfully!',
      appointment: { action_details: updatedActionDetails },
      action: updatedAction
    }, { status: 200 });

  } catch (error) {
    console.error("Error requesting appointment reschedule:", error);
    return NextResponse.json({ error: "Failed to request appointment reschedule" }, { status: 500 });
  }
} 