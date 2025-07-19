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

    // Get the current appointment to access its notes
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      select: { notes: true },
    });

    // Update the appointment as no-show
    const appointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        status: 'no_show',
        notes: data.no_show_notes ? 
          `${data.no_show_notes}${currentAppointment?.notes ? `\n\nPrevious notes: ${currentAppointment.notes}` : ''}` : 
          undefined,
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
    console.error('Error marking appointment as no-show:', error);
    return NextResponse.json(
      { error: 'Failed to mark appointment as no-show' },
      { status: 500 }
    );
  }
} 