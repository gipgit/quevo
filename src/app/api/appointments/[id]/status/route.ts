import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

const VALID_STATUSES = [
  'scheduled',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
  'rescheduled',
];

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate status
    if (!data.status || !VALID_STATUSES.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status: data.status,
        updated_at: new Date(),
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

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment status' },
      { status: 500 }
    );
  }
} 