// src/app/api/business/[businessId]/availability/slots/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
    parseISO,
    format,
    setHours,
    setMinutes,
    addMinutes,
    isAfter,
    startOfDay,
    endOfDay,
    isSameDay,
    isBefore // Added isBefore for comprehensive date comparison
} from 'date-fns';

export async function GET(request, { params }) {
    const businessId = parseInt(params.businessId); // Corrected: Access businessId directly from params
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // 'YYYY-MM-DD'
    const durationParam = searchParams.get('duration'); // This is now totalOccupancyDuration from client, in minutes

    // Input Validation
    if (isNaN(businessId) || !dateParam || isNaN(parseInt(durationParam))) {
        return NextResponse.json({ error: 'Missing or invalid business ID, date, or duration.' }, { status: 400 });
    }

    const totalOccupancyDuration = parseInt(durationParam);
    const bookingDate = parseISO(dateParam); // This is a Date object for the requested day

    if (isNaN(bookingDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    // Ensure the requested date is not in the past
    const now = new Date();
    const todayStart = startOfDay(now);
    const bookingDateStart = startOfDay(bookingDate);

    // If the booking date is entirely in the past (not today and before today)
    if (isBefore(bookingDateStart, todayStart)) { // Simplified check: if start of booking date is before start of today
        return NextResponse.json({ availableSlots: [] }, { status: 200 }); // No slots for fully past dates
    }

    try {
        const dayOfWeek = bookingDate.getDay(); // 0 (Sunday) to 6 (Saturday)

        // Fetch all relevant availability blocks for this specific day
        const availabilitiesForDay = await prisma.bookingAvailability.findMany({
            where: {
                business_id: businessId,
                OR: [
                    {
                        is_recurring: true,
                        day_of_week: dayOfWeek,
                    },
                    {
                        is_recurring: false,
                        date_effective_from: { lte: bookingDate },
                        date_effective_to: { gte: bookingDate }
                    }
                ]
            },
            // Optionally, include staff information if needed later for filtering
            // include: { staff: true }
            orderBy: {
                time_start: 'asc' // Order by start time to process blocks sequentially
            }
        });

        if (availabilitiesForDay.length === 0) {
            return NextResponse.json({ availableSlots: [] }, { status: 200 }); // No availability defined for this day
        }

        // Helper to convert Prisma Time (string 'HH:mm:ss') to Date object on the bookingDate
        const getTimeDate = (timeString) => {
            const [h, m, s] = timeString.split(':').map(Number);
            return setMinutes(setHours(bookingDate, h), m);
        };

        const availableSlots = [];
        const addedSlots = new Set(); // To store 'HH:mm' strings and avoid duplicates from overlapping availability blocks

        // Fetch existing bookings for this day
        const existingBookings = await prisma.booking.findMany({
            where: {
                business_id: businessId,
                booking_date: bookingDate, // Filter by DATE part only
                status: {
                    in: ['pending', 'confirmed'] // Only consider pending or confirmed bookings as occupying slots
                }
            },
            select: {
                booking_time_start: true,
                // booking_time_end: true, // You can use this directly if you prefer, or recalculate
                duration_minutes: true, // Crucial for precise booked time calculation
            },
            orderBy: {
                booking_time_start: 'asc',
            },
        });

        // Convert existing bookings to intervals (start and end Date objects)
        const bookedIntervals = existingBookings.map(booking => {
            const startTime = getTimeDate(booking.booking_time_start);
            const endTime = addMinutes(startTime, booking.duration_minutes); // Use duration_minutes from Booking
            return { start: startTime, end: endTime };
        });

        // Sort booked intervals for easier processing (though Prisma orderBy helps)
        bookedIntervals.sort((a, b) => a.start.getTime() - b.start.getTime());

        // Define the interval at which to check for new slots (e.g., every 15 minutes)
        // This is the "grid" on which new bookings can start.
        const slotCheckIntervalMinutes = 15; // You can adjust this (e.g., 5, 10, 30)

        // Process each availability block found for the day
        for (const avail of availabilitiesForDay) {
            let currentSlotCandidateTime = getTimeDate(avail.time_start);
            const blockEndTime = getTimeDate(avail.time_end);

            // Adjust the start time for 'today' to ensure future bookings
            const minAllowedStartTimeForToday = addMinutes(now, 15); // e.g., no bookings within the next 15 minutes
            if (isSameDay(bookingDate, now) && isBefore(currentSlotCandidateTime, minAllowedStartTimeForToday)) {
                // Round up to the next `slotCheckIntervalMinutes` interval from `minAllowedStartTimeForToday`
                const minutesSinceMidnight = minAllowedStartTimeForToday.getHours() * 60 + minAllowedStartTimeForToday.getMinutes();
                const remainder = minutesSinceMidnight % slotCheckIntervalMinutes;
                const minutesToAdd = remainder === 0 ? 0 : slotCheckIntervalMinutes - remainder;
                currentSlotCandidateTime = addMinutes(minAllowedStartTimeForToday, minutesToAdd);
            }

            // Loop through potential slots within this availability block
            while (isAfter(blockEndTime, addMinutes(currentSlotCandidateTime, totalOccupancyDuration - 1)) || isSameDay(blockEndTime, addMinutes(currentSlotCandidateTime, totalOccupancyDuration - 1))) {
                const potentialSlotEndTime = addMinutes(currentSlotCandidateTime, totalOccupancyDuration);
                const slotFormatString = format(currentSlotCandidateTime, 'HH:mm');

                // If this slot has already been considered from another availability block, skip
                if (addedSlots.has(slotFormatString)) {
                    currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
                    continue;
                }

                // Check for overlaps with existing bookings
                const isBlockedByExistingBooking = bookedIntervals.some(booked => {
                    // Overlap if:
                    // (New potential slot starts before booked slot ends AND New potential slot ends after booked slot starts)
                    return !(isAfter(currentSlotCandidateTime, booked.end) || isAfter(booked.start, potentialSlotEndTime));
                });

                if (!isBlockedByExistingBooking) {
                    availableSlots.push(slotFormatString);
                    addedSlots.add(slotFormatString); // Mark as added
                }

                // Move to the next potential slot start
                currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
            }
        }

        // Sort the final list of slots (important for consistent display)
        availableSlots.sort((a, b) => {
            const [ah, am] = a.split(':').map(Number);
            const [bh, bm] = b.split(':').map(Number);
            if (ah !== bh) return ah - bh;
            return am - bm;
        });

        // Consistent response format
        return NextResponse.json({ availableSlots });

    } catch (error) {
        console.error("API Availability Slots Error:", error);
        return NextResponse.json({ error: 'Failed to fetch availability slots' }, { status: 500 });
    }
}