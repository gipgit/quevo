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
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointment_id,
        business_id: business_id,
        OR: [
          { business: { manager_id: session.user.id } },
          { customer_id: session.user.id }
        ]
      },
      include: {
        serviceboard: {
          include: {
            service: true
          }
        }
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
      (appointment.serviceboard.service?.duration_minutes || 60) + (appointment.serviceboard.service?.buffer_minutes || 0)
    );

    // Check for time slot availability
    const existingBookings = await prisma.appointment.findMany({
      where: {
        business_id: business_id,
        appointment_datetime: {
          gte: new Date(newDate),
          lt: new Date(new Date(newDate).getTime() + 24 * 60 * 60 * 1000) // Next day
        },
        status: { in: ['scheduled', 'confirmed'] },
        id: { not: appointment_id } // Exclude current appointment
      }
    });

    const isOverlapping = existingBookings.some(existing => {
      const existingStart = new Date(existing.appointment_datetime);
      const existingEnd = addMinutes(existingStart, existing.duration_minutes || 60);
      return (newBookingStart < existingEnd && newBookingEnd > existingStart);
    });

    if (isOverlapping) {
      return NextResponse.json({ error: 'Requested time slot is not available.' }, { status: 409 });
    }

    // Update appointment with new time
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment_id },
      data: {
        appointment_datetime: newBookingStart,
        status: 'scheduled'
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