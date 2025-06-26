// src/app/api/booking/slots/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const businessId = parseInt(searchParams.get('business_id'));
    const serviceId = parseInt(searchParams.get('service_id'));
    const dateStr = searchParams.get('date'); // YYYY-MM-DD format

    if (!businessId || !serviceId || !dateStr) {
        return NextResponse.json({ error: 'Business ID, Service ID, and Date are required' }, { status: 400 });
    }

    try {
        const service = await prisma.bookingService.findUnique({
            where: { service_id: serviceId },
            select: { duration_minutes: true }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        const bookingDuration = service.duration_minutes;

        // Fetch general recurring availability for the given date's weekday
        const targetDate = new Date(dateStr);
        const dayOfWeek = targetDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

        const availabilities = await prisma.bookingAvailability.findMany({
            where: {
                business_id: businessId,
                staff_id: null, // General availability
                is_recurring: true,
                day_of_week: dayOfWeek,
            },
            orderBy: {
                start_time: 'asc',
            },
        });

        // Fetch existing bookings for the selected date
        const existingBookings = await prisma.booking.findMany({
            where: {
                business_id: businessId,
                booking_date: new Date(dateStr), // Match date without time
                status: {
                    in: ['CONFIRMED', 'PENDING'] // Consider what statuses block availability
                }
            },
            select: {
                booking_time_start: true,
                booking_time_end: true,
            },
        });

        const timeSlots = [];
        const ONE_MINUTE = 60 * 1000;

        for (const avail of availabilities) {
            let currentSlotStart = new Date(`${dateStr}T${avail.start_time}`); // HH:MM:SS
            let availabilityEnd = new Date(`${dateStr}T${avail.end_time}`); // HH:MM:SS

            // Adjust for today's current time if the date is today
            const now = new Date();
            if (targetDate.toDateString() === now.toDateString()) {
                // Ensure currentSlotStart is not in the past relative to now, plus a buffer (e.g., 15 min)
                const minStartTime = new Date(now.getTime() + 15 * ONE_MINUTE); // 15 minute buffer
                if (currentSlotStart < minStartTime) {
                    currentSlotStart = minStartTime;
                }
            }
            
            while (currentSlotStart.getTime() + bookingDuration * ONE_MINUTE <= availabilityEnd.getTime()) {
                const potentialSlotEnd = new Date(currentSlotStart.getTime() + bookingDuration * ONE_MINUTE);

                const isBlocked = existingBookings.some(booking => {
                    const existingStart = new Date(`${dateStr}T${booking.booking_time_start}`);
                    const existingEnd = new Date(`${dateStr}T${booking.booking_time_end}`);

                    // Check for overlap: [currentSlotStart, potentialSlotEnd) overlaps with [existingStart, existingEnd)
                    return (currentSlotStart < existingEnd && potentialSlotEnd > existingStart);
                });

                if (!isBlocked) {
                    const hour = String(currentSlotStart.getHours()).padStart(2, '0');
                    const minute = String(currentSlotStart.getMinutes()).padStart(2, '0');
                    timeSlots.push(`${hour}:${minute}`);
                }

                currentSlotStart = new Date(currentSlotStart.getTime() + avail.slot_interval_minutes * ONE_MINUTE);
            }
        }

        if (timeSlots.length === 0) {
            return NextResponse.json({ message: 'Non ci sono disponibilità per questo servizio in questa data.' });
        }

        return NextResponse.json({ slots: timeSlots });

    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
    }
}