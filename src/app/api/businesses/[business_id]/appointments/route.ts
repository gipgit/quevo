import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id } = params;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id,
        manager_id: session.user.id
      },
      include: {
        usermanager: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Fetch appointments with related data
    const appointments = await prisma.appointment.findMany({
      where: {
        business_id
      },
      include: {
        serviceboard: {
          include: {
            servicerequest: {
              include: {
                service: {
                  include: {
                    servicecategory: true
                  }
                }
              }
            }
          }
        },
        usercustomer: true
      },
      orderBy: {
        appointment_datetime: 'asc'
      }
    });

    // Transform appointments to include start/end times and customer info
    const transformedAppointments = appointments.map(appointment => {
      const startTime = new Date(appointment.appointment_datetime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration
      
      return {
        id: appointment.id,
        title: appointment.appointment_title || 'Appointment',
        start: startTime,
        end: endTime,
        customerName: `${appointment.usercustomer.name_first} ${appointment.usercustomer.name_last}`,
        customerEmail: appointment.usercustomer.email,
        customerPhone: (appointment.usercustomer as any).phone,
        status: appointment.status,
        notes: appointment.notes,
        appointment_title: appointment.appointment_title,
        appointment_type: appointment.appointment_type,
        appointment_location: appointment.appointment_location,
        platform_name: appointment.platform_name,
        platform_link: appointment.platform_link,
        duration_minutes: 60, // Default duration
        service_board_title: appointment.serviceboard.board_title,
        service_board_ref: appointment.serviceboard.board_ref,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at
      };
    });

    // Get plan limits for appointments (using bookings limit)
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: business.usermanager.plan_id,
        feature: 'bookings'
      }
    });

    const appointmentLimit = planLimits[0]?.max_count || 100;

    return NextResponse.json({
      appointments: transformedAppointments,
      planLimits: {
        maxAppointments: appointmentLimit
      }
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 