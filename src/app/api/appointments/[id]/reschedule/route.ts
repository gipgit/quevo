import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate required fields
    if (!data.appointment_datetime) {
      return NextResponse.json(
        { error: 'New appointment datetime is required' },
        { status: 400 }
      );
    }

    // Start a transaction to handle the rescheduling
    const appointment = await prisma.$transaction(async (tx) => {
      // First, update the current appointment status to rescheduled
      const currentAppointment = await tx.appointment.update({
        where: {
          id,
        },
        data: {
          status: 'rescheduled',
          updated_at: new Date(),
        },
      });

      // Then, create a new appointment with the new datetime
      const newAppointment = await tx.appointment.create({
        data: {
          service_board_id: currentAppointment.service_board_id,
          customer_id: currentAppointment.customer_id,
          business_id: currentAppointment.business_id,
          appointment_datetime: new Date(data.appointment_datetime),
          appointment_location: currentAppointment.appointment_location,
          appointment_type: currentAppointment.appointment_type,
          status: 'scheduled',
          notes: data.notes || currentAppointment.notes,
          originating_action_id: currentAppointment.originating_action_id,
        },
        include: {
          usercustomer: {
            select: {
              name_first: true,
              name_last: true,
              email: true,
            },
          },
          serviceboard: {
            select: {
              board_title: true,
              service: {
                select: {
                  service_name: true,
                  duration_minutes: true,
                },
              },
            },
          },
        },
      });

      return newAppointment;
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
} 