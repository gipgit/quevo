import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
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

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const data = await request.json();

    // Validate required fields
    if (!data.appointment_datetime || !data.appointment_location || !data.appointment_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.update({
      where: {
        id,
      },
      data: {
        appointment_datetime: new Date(data.appointment_datetime),
        appointment_location: data.appointment_location,
        appointment_type: data.appointment_type,
        status: data.status,
        notes: data.notes,
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
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
} 