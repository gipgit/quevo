// src/app/api/business/[businessId]/availability/overview/route.js

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    isBefore,
    isAfter,
    setHours,
    setMinutes,
    addMinutes,
    startOfDay,
    getDay
} from 'date-fns';

import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Import the specific enum you need from Prisma Client
import { booking_status_type } from '@prisma/client'; // <-- This is correctly importing the enum itself

const BUSINESS_TIMEZONE = 'Europe/Rome';

// --- Debugging Prisma Client & Enums (Adjusted logging for clarity) ---
console.log('--- Debugging Prisma Client & Enums ---');
console.log('Is prisma imported and defined?', prisma ? 'Yes' : 'No');

// Check if the directly imported enum is available
console.log('Is `booking_status_type` enum directly imported and available?', booking_status_type ? 'Yes' : 'No');
if (booking_status_type) {
    console.log('Contents of `booking_status_type`:', booking_status_type);
    console.log('booking_status_type.cancelled:', booking_status_type.cancelled);
    console.log('booking_status_type.rescheduled:', booking_status_type.rescheduled);
} else {
    console.warn('WARNING: `booking_status_type` enum is undefined despite import.');
}
console.log('--- End Debugging Prisma Client & Enums ---');
// --- End Debugging Prisma Client & Enums ---


const getTimeDate = (day, timeDateObject) => {
    if (!(timeDateObject instanceof Date) || isNaN(timeDateObject.getTime())) {
        console.error('Invalid Date object provided to getTimeDate for time extraction:', timeDateObject);
        return startOfDay(day);
    }

    const h = timeDateObject.getHours();
    const m = timeDateObject.getMinutes();

    return setMinutes(setHours(startOfDay(day), h), m);
};


export async function GET(request, { params }) {
    const businessId = parseInt(params.businessId);
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (isNaN(businessId)) {
        console.error('Validation Error: Invalid businessId', { businessId });
        return NextResponse.json({ error: 'Invalid businessId' }, { status: 400 });
    }
    if (!startDateParam || !endDateParam) {
        console.error('Validation Error: Missing startDate or endDate parameters', { startDateParam, endDateParam });
        return NextResponse.json({ error: 'Missing startDate or endDate parameters' }, { status: 400 });
    }

    try {
        console.log(`[Overview API] Received request for businessId: ${businessId}, startDate: ${startDateParam}, endDate: ${endDateParam}`);

        const startDateUTC = new Date(startDateParam);
        const endDateUTC = new Date(endDateParam);

        if (isNaN(startDateUTC.getTime()) || isNaN(endDateUTC.getTime())) {
            console.error('Parsing Error: Invalid date format after new Date()', { startDateParam, endDateParam });
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        console.log(`[Overview API] Parsed UTC Dates - Start: ${startDateUTC.toISOString()}, End: ${endDateUTC.toISOString()}`);

        const zonedStartDate = toZonedTime(startDateUTC, BUSINESS_TIMEZONE);
        const zonedEndDate = toZonedTime(endDateUTC, BUSINESS_TIMEZONE);

        console.log(`[Overview API] Converted to Zoned Time (${BUSINESS_TIMEZONE}) - Start: ${format(zonedStartDate, 'yyyy-MM-dd HH:mm:ssXXX')}, End: ${format(zonedEndDate, 'yyyy-MM-dd HH:mm:ssXXX')}`);

        const daysInMonth = eachDayOfInterval({
            start: startOfMonth(zonedStartDate),
            end: endOfMonth(zonedEndDate)
        }).map(day => toZonedTime(day, BUSINESS_TIMEZONE));

        console.log(`[Overview API] Days in month (first 5 for brevity):`, daysInMonth.slice(0, 5).map(d => format(d, 'yyyy-MM-dd (EEEE)')));
        console.log(`[Overview API] Total days in interval:`, daysInMonth.length);

        console.log('[Overview API] Fetching bookingavailability...');
        const availableAvailabilities = await prisma.bookingavailability.findMany({
            where: {
                business_id: businessId,
                OR: [
                    {
                        is_recurring: true,
                    },
                    {
                        is_recurring: false,
                        date_effective_from: { lte: zonedEndDate },
                        date_effective_to: { gte: zonedStartDate }
                    },
                    {
                        is_recurring: false,
                        date_effective_from: { lte: zonedEndDate },
                        date_effective_to: null,
                    },
                    {
                        is_recurring: false,
                        date_effective_from: null,
                        date_effective_to: { gte: zonedStartDate },
                    }
                ]
            },
            select: {
                // id: true, // <-- REMOVED THIS LINE AS PER ERROR
                day_of_week: true,
                time_start: true,
                time_end: true,
                is_recurring: true,
                date_effective_from: true,
                date_effective_to: true,
            },
        });
        console.log(`[Overview API] Fetched ${availableAvailabilities.length} availability blocks.`);
        console.log(`[Overview API] Available Availabilities Details:`, JSON.stringify(availableAvailabilities, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }, 2));


        console.log('[Overview API] Fetching existing bookings...');
        const bookedSlots = await prisma.booking.findMany({
            where: {
                business_id: businessId,
                booking_date: {
                    gte: startOfMonth(zonedStartDate),
                    lte: endOfMonth(zonedEndDate),
                },
                status: {
                    notIn: [booking_status_type.cancelled, booking_status_type.rescheduled]
                },
            },
            select: {
                booking_date: true,
                booking_time_start: true,
                booking_time_end: true,
            },
        });
        console.log(`[Overview API] Fetched ${bookedSlots.length} existing bookings.`);
        console.log(`[Overview API] Booked Slots Details:`, JSON.stringify(bookedSlots, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }, 2));


        const availableDates = daysInMonth.filter(day => {
            const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            console.log(`\n[DEBUG] Checking day: ${format(day, 'yyyy-MM-dd (EEEE)')} (JS DayOfWeek: ${dayOfWeek})`);

            const availabilitiesForCurrentDay = availableAvailabilities.filter(avail => {
                const matchesDayOfWeek = avail.day_of_week === dayOfWeek;
                let isEffective = false;

                if (avail.is_recurring) {
                    isEffective = matchesDayOfWeek;
                } else {
                    const effectiveFrom = avail.date_effective_from ? toZonedTime(avail.date_effective_from, BUSINESS_TIMEZONE) : null;
                    const effectiveTo = avail.date_effective_to ? toZonedTime(avail.date_effective_to, BUSINESS_TIMEZONE) : null;

                    const startsBeforeOrOnDay = effectiveFrom ? !isAfter(day, effectiveFrom) : true;
                    const endsAfterOrOnDay = effectiveTo ? !isBefore(day, effectiveTo) : true;

                    isEffective = matchesDayOfWeek && startsBeforeOrOnDay && endsAfterOrOnDay;
                }
                // Log why an availability is being included/excluded. avail.id will be undefined here.
                console.log(`  - Avail (day_of_week=${avail.day_of_week}, ${avail.is_recurring ? 'Recurring' : 'One-time'}): isEffective=${isEffective}`);
                return isEffective;
            });

            console.log(`  - Found ${availabilitiesForCurrentDay.length} specific availability blocks for ${format(day, 'EEEE')}.`);

            if (availabilitiesForCurrentDay.length === 0) {
                console.log(`  - No availability blocks found for ${format(day, 'EEEE')}, excluding this day.`);
                return false;
            }

            const hasPotentialOpenSlot = availabilitiesForCurrentDay.some(avail => {
                let currentCheckTime = getTimeDate(day, avail.time_start);
                const blockEndTime = getTimeDate(day, avail.time_end);

                const minServiceDuration = 30;

                const nowZoned = toZonedTime(new Date(), BUSINESS_TIMEZONE);
                let adjustedCurrentCheckTime = currentCheckTime;

                if (isSameDay(day, nowZoned) && isBefore(adjustedCurrentCheckTime, nowZoned)) {
                    adjustedCurrentCheckTime = addMinutes(nowZoned, 15);
                    const minutesInHour = adjustedCurrentCheckTime.getMinutes();
                    const remainder = minutesInHour % 15;
                    if (remainder !== 0) {
                        adjustedCurrentCheckTime = addMinutes(adjustedCurrentCheckTime, 15 - remainder);
                    }
                    console.log(`    - Today's date, adjusting start time. Original: ${format(currentCheckTime, 'HH:mm')}, Adjusted: ${format(adjustedCurrentCheckTime, 'HH:mm')}`);
                }

                if (isAfter(adjustedCurrentCheckTime, blockEndTime) || (isSameDay(adjustedCurrentCheckTime, blockEndTime) && adjustedCurrentCheckTime.getTime() === blockEndTime.getTime())) {
                    console.log(`    - Adjusted start time (${format(adjustedCurrentCheckTime, 'HH:mm')}) is past or at block end (${format(blockEndTime, 'HH:mm')}). No slots.`);
                    return false;
                }
                if (addMinutes(adjustedCurrentCheckTime, minServiceDuration) > blockEndTime) {
                    console.log(`    - Block (${format(adjustedCurrentCheckTime, 'HH:mm')} - ${format(blockEndTime, 'HH:mm')}) too short for ${minServiceDuration} min service.`);
                    return false;
                }

                const relevantBookings = bookedSlots.filter(booking =>
                    isSameDay(toZonedTime(booking.booking_date, BUSINESS_TIMEZONE), day)
                ).map(b => ({
                    start: getTimeDate(day, b.booking_time_start),
                    end: getTimeDate(day, b.booking_time_end),
                })).sort((a,b) => a.start.getTime() - b.start.getTime());

                console.log(`    - Relevant Bookings for ${format(day, 'yyyy-MM-dd')}:`, relevantBookings.map(b => `${format(b.start, 'HH:mm')}-${format(b.end, 'HH:mm')}`));

                let hasOpenSlot = false;
                let checkCursor = adjustedCurrentCheckTime;

                // Loop through potential slots in 15-minute increments
                // The condition `addMinutes(checkCursor, minServiceDuration - 1) < blockEndTime` means:
                // Is there *at least* a `minServiceDuration` amount of time remaining in the block
                // when starting at `checkCursor`?
                // This correctly handles the case where the last possible slot ends exactly at `blockEndTime`.
                while (addMinutes(checkCursor, minServiceDuration - 1) < blockEndTime) {
                    const potentialSlotStart = checkCursor;
                    const potentialSlotEnd = addMinutes(checkCursor, minServiceDuration);

                    let isOverlap = false;

                    console.log(`      - Checking slot: ${format(potentialSlotStart, 'HH:mm')} - ${format(potentialSlotEnd, 'HH:mm')}`);

                    for (const booked of relevantBookings) {
                        // Standard overlap check: [A, B) and [C, D) overlap if A < D and B > C
                        if (potentialSlotStart < booked.end && potentialSlotEnd > booked.start) {
                            isOverlap = true;
                            console.log(`        - OVERLAP with booked: ${format(booked.start, 'HH:mm')}-${format(booked.end, 'HH:mm')}`);
                            break;
                        }
                    }

                    if (!isOverlap) {
                        hasOpenSlot = true;
                        console.log(`        - Found OPEN slot! ${format(potentialSlotStart, 'HH:mm')} - ${format(potentialSlotEnd, 'HH:mm')}`);
                        break;
                    }

                    checkCursor = addMinutes(checkCursor, 15);
                }
                console.log(`    - Has potential open slot for this availability block: ${hasOpenSlot}`);
                return hasOpenSlot;
            });

            console.log(`  - Overall: ${format(day, 'yyyy-MM-dd (EEEE)')} has potential open slots: ${hasPotentialOpenSlot}`);
            return hasPotentialOpenSlot;
        }).map(day => format(day, 'yyyy-MM-dd'));

        console.log(`[Overview API] Final Available Dates:`, availableDates);
        return NextResponse.json({ availableDates });

    } catch (error) {
        console.error('API Availability Overview Error (Caught):', error);
        return NextResponse.json({ error: 'Failed to fetch availability overview', details: error.message, stack: error.stack }, { status: 500 });
    }
}