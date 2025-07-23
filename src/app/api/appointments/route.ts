import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Build the where clause based on filters
    const where: any = {
      business_id: businessId,
    };

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add date range filter if provided
    if (from || to) {
      where.appointment_datetime = {};
      if (from) {
        where.appointment_datetime.gte = new Date(from);
      }
      if (to) {
        where.appointment_datetime.lte = new Date(to);
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
      orderBy: {
        appointment_datetime: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 