import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toZonedTime } from "date-fns-tz";
import { addMinutes, parseISO } from "date-fns";

const BUSINESS_TIMEZONE = 'Europe/Rome';

export async function POST(
  request: Request,
  { params }: { params: { business_id: string; appointment_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, appointment_id } = params;
    const body = await request.json();
    const { newDate, newTime } = body;

    if (!newDate || !newTime) {
      return NextResponse.json({ error: "New date and time are required" }, { status: 400 });
    }

    // Verify business ownership and appointment exists
    const appointment = await prisma.servicerequest.findFirst({
      where: {
        request_reference: appointment_id,
        business: {
          business_id: business_id,
          OR: [
            { manager_id: session.user.id },
            {
              servicerequest: {
                some: {
                  customer_user_id: session.user.id
                }
              }
            }
          ]
        }
      },
      include: {
        service: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or access denied" }, { status: 404 });
    }

    // Calculate new time slot
    const fullBookingDateTimeStr = `${newDate}T${newTime}:00`;
    const newBookingStart = toZonedTime(parseISO(fullBookingDateTimeStr), BUSINESS_TIMEZONE);
    const newBookingEnd = addMinutes(
      newBookingStart, 
      (appointment.service.duration_minutes || 60) + (appointment.service.buffer_minutes || 0)
    );

    // Check for time slot availability
    const existingBookings = await prisma.servicerequest.findMany({
      where: {
        business_id: business_id,
        request_date: new Date(newDate),
        status: { in: ['pending', 'confirmed'] },
        request_reference: { not: appointment_id }, // Exclude current appointment
        request_time_start: { not: null },
        request_time_end: { not: null }
      }
    });

    const isOverlapping = existingBookings.some(existing => {
      if (!existing.request_time_start || !existing.request_time_end) return false;
      const existingStart = new Date(existing.request_time_start);
      const existingEnd = new Date(existing.request_time_end);
      return (newBookingStart < existingEnd && newBookingEnd > existingStart);
    });

    if (isOverlapping) {
      return NextResponse.json({ error: 'Requested time slot is not available.' }, { status: 409 });
    }

    // Update appointment with new time
    const updatedAppointment = await prisma.servicerequest.update({
      where: { request_reference: appointment_id },
      data: {
        request_date: new Date(newDate),
        request_time_start: newBookingStart,
        request_time_end: newBookingEnd,
        status: 'confirmed'
      }
    });

    return NextResponse.json({
      message: session.user.role === 'customer' 
        ? "Reschedule request submitted successfully"
        : "Appointment rescheduled successfully",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return NextResponse.json({ error: "Failed to reschedule appointment" }, { status: 500 });
  }
} 