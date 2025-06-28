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
    isSameDay,
    isBefore
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'; // Import formatInTimeZone

const BUSINESS_TIMEZONE = 'Europe/Rome'; // Define the business timezone

export async function GET(request, { params }) {
    const businessId = parseInt(params.businessId);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const durationParam = searchParams.get('duration');

    if (isNaN(businessId) || !dateParam || isNaN(parseInt(durationParam))) {
        console.error("Missing or invalid parameters:", { businessId, dateParam, durationParam });
        return NextResponse.json({ error: 'Missing or invalid business ID, date, or duration.' }, { status: 400 });
    }

    const totalOccupancyDuration = parseInt(durationParam);
    // Ensure bookingDate is in the business's timezone at the start of the day
    const bookingDate = toZonedTime(parseISO(dateParam), BUSINESS_TIMEZONE); // Use toZonedTime here
    const bookingDayStart = startOfDay(bookingDate); // Get the start of the day in the specified timezone

    if (isNaN(bookingDate.getTime())) {
        console.error("Invalid date format parsed:", dateParam);
        return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    // Get current server time and convert it to the business's timezone for consistent comparison
    const nowInBusinessTimezone = toZonedTime(new Date(), BUSINESS_TIMEZONE);
    const todayStartInBusinessTimezone = startOfDay(nowInBusinessTimezone);

    // If the booking date is strictly before today's start, no slots can be offered.
    if (isBefore(bookingDayStart, todayStartInBusinessTimezone)) {
        console.log(`Requested date ${dateParam} is in the past. Returning no slots.`);
        return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }

    try {
        // dayOfWeek is 0 (Sunday) to 6 (Saturday) - this is consistent regardless of timezone
        const dayOfWeek = bookingDate.getDay();

        // --- UPDATED getTimeDate FUNCTION ---
        // This function now robustly sets the time component onto bookingDayStart,
        // ensuring it's always in the BUSINESS_TIMEZONE.
        // Prisma's Date objects for @db.Time(6) typically use a dummy date, often UTC.
        // We extract the hours/minutes and apply them to the zoned bookingDayStart.
        const getTimeDate = (timeDateObjectFromPrisma) => {
            if (!(timeDateObjectFromPrisma instanceof Date) || isNaN(timeDateObjectFromPrisma.getTime())) {
                console.warn("getTimeDate received invalid input:", timeDateObjectFromPrisma);
                return null;
            }
            // Get hours and minutes from the Prisma-provided Date object
            // These hours/minutes are effectively the UTC equivalent if the dummy date was UTC.
            const hours = timeDateObjectFromPrisma.getHours();
            const minutes = timeDateObjectFromPrisma.getMinutes();

            // Set these hours/minutes onto the bookingDayStart (which is already zoned)
            // This ensures the resulting time is also correctly zoned.
            return setMinutes(setHours(bookingDayStart, hours), minutes);
        };
        // --- END UPDATED getTimeDate ---

        const availabilitiesForDay = await prisma.bookingavailability.findMany({
            where: {
                business_id: businessId,
                OR: [
                    {
                        is_recurring: true,
                        day_of_week: dayOfWeek,
                    },
                    {
                        is_recurring: false,
                        date_effective_from: { lte: bookingDate }, // Prisma handles date filtering correctly with Date objects
                        date_effective_to: { gte: bookingDate }
                    }
                ]
            },
            orderBy: {
                time_start: 'asc'
            }
        });

        if (availabilitiesForDay.length === 0) {
            console.log(`No availability blocks found for businessId ${businessId} on ${dateParam}.`);
            return NextResponse.json({ availableSlots: [] }, { status: 200 });
        }

        const availableSlots = [];
        const addedSlots = new Set();

        const existingBookings = await prisma.booking.findMany({
            where: {
                business_id: businessId,
                booking_date: bookingDate, // Filtering by Date object is fine for @db.Date
                status: {
                    in: ['pending', 'confirmed']
                }
            },
            select: {
                booking_time_start: true,
                bookingservice: {
                    select: {
                        duration_minutes: true,
                    },
                },
            },
            orderBy: {
                booking_time_start: 'asc',
            },
        });

        const bookedIntervals = existingBookings.map(booking => {
            const startTime = getTimeDate(booking.booking_time_start);
            const duration = booking.bookingservice?.duration_minutes || 0;
            const endTime = addMinutes(startTime, duration);
            return { start: startTime, end: endTime };
        });

        const slotCheckIntervalMinutes = 15;

        for (const avail of availabilitiesForDay) {
            let currentSlotCandidateTime = getTimeDate(avail.time_start);
            const blockEndTime = getTimeDate(avail.time_end);

            // Time for comparison: now in the business's timezone, plus 15 mins buffer
            const minAllowedStartTimeForToday = addMinutes(nowInBusinessTimezone, 15);

            // If the booking date is today, adjust the starting time to be after 'now' + buffer
            if (isSameDay(bookingDayStart, nowInBusinessTimezone) && isBefore(currentSlotCandidateTime, minAllowedStartTimeForToday)) {
                // Round currentSlotCandidateTime UP to the next `slotCheckIntervalMinutes` from `minAllowedStartTimeForToday`
                const minutesSinceMidnight = minAllowedStartTimeForToday.getHours() * 60 + minAllowedStartTimeForToday.getMinutes();
                const remainder = minutesSinceMidnight % slotCheckIntervalMinutes;
                const minutesToAdd = remainder === 0 ? 0 : slotCheckIntervalMinutes - remainder;
                currentSlotCandidateTime = addMinutes(minAllowedStartTimeForToday, minutesToAdd);
            }

            if (!currentSlotCandidateTime || !blockEndTime ||
                isAfter(currentSlotCandidateTime, blockEndTime) ||
                isBefore(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), currentSlotCandidateTime) ||
                isAfter(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), blockEndTime)) {
                continue;
            }

            while (!isAfter(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), blockEndTime)) {
                const potentialSlotEndTime = addMinutes(currentSlotCandidateTime, totalOccupancyDuration);
                // Use formatInTimeZone to ensure the output string is in the desired timezone
                const slotFormatString = formatInTimeZone(currentSlotCandidateTime, BUSINESS_TIMEZONE, 'HH:mm');

                if (addedSlots.has(slotFormatString)) {
                    currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
                    continue;
                }

                const isBlockedByExistingBooking = bookedIntervals.some(booked => {
                    return isBefore(currentSlotCandidateTime, booked.end) && isAfter(potentialSlotEndTime, booked.start);
                });

                if (!isBlockedByExistingBooking) {
                    availableSlots.push(slotFormatString);
                    addedSlots.add(slotFormatString);
                }

                currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
            }
        }

        availableSlots.sort((a, b) => {
            const [ah, am] = a.split(':').map(Number);
            const [bh, bm] = b.split(':').map(Number);
            if (ah !== bh) return ah - bh;
            return am - bm;
        });

        return NextResponse.json({ availableSlots });

    } catch (error) {
        console.error("API Availability Slots Error:", error);
        return NextResponse.json({ error: 'Failed to fetch availability slots', details: error.message }, { status: 500 });
    }
}