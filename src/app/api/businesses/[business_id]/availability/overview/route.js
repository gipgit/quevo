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

const BUSINESS_TIMEZONE = 'Europe/Rome';

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
    const businessId = params.business_id; // Use UUID string directly, don't parse as integer
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const durationParam = searchParams.get('duration');
    const eventIdParam = searchParams.get('eventId');

    if (!businessId) {
        console.error('Validation Error: Invalid businessId', { businessId });
        return NextResponse.json({ error: 'Invalid businessId' }, { status: 400 });
    }
    if (!startDateParam || !endDateParam) {
        console.error('Validation Error: Missing startDate or endDate parameters', { startDateParam, endDateParam });
        return NextResponse.json({ error: 'Missing startDate or endDate parameters' }, { status: 400 });
    }

    try {
        console.log(`[Overview API] Received request for businessId: ${businessId}, startDate: ${startDateParam}, endDate: ${endDateParam}, eventId: ${eventIdParam}, duration: ${durationParam}`);

        // If eventId is provided, fetch the event details to get the correct duration and buffer
        let eventDuration = durationParam ? parseInt(durationParam) : 30;
        let eventBuffer = 0;
        
        if (eventIdParam) {
            try {
                const event = await prisma.serviceevent.findUnique({
                    where: { event_id: parseInt(eventIdParam) },
                    select: { duration_minutes: true, buffer_minutes: true }
                });
                
                if (event) {
                    eventDuration = event.duration_minutes || eventDuration;
                    eventBuffer = event.buffer_minutes || 0;
                    console.log(`[Overview API] Event details - duration: ${eventDuration}, buffer: ${eventBuffer}`);
                }
            } catch (error) {
                console.error('[Overview API] Error fetching event details:', error);
            }
        }
        
        const totalRequiredDuration = eventDuration + eventBuffer;
        console.log(`[Overview API] Total required duration (duration + buffer): ${totalRequiredDuration} minutes`);

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
        
        // Build the availability query based on whether eventId is provided
        let availabilityWhere = {
            business_id: businessId, // Use UUID string directly
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
        };

        // If eventId is provided, filter to only include event-specific availability
        if (eventIdParam) {
            availabilityWhere.AND = [
                { event_id: parseInt(eventIdParam) } // Only event-specific availability
            ];
        }

        const availableAvailabilities = await prisma.serviceeventavailability.findMany({
            where: availabilityWhere,
            select: {
                day_of_week: true,
                time_start: true,
                time_end: true,
                is_recurring: true,
                date_effective_from: true,
                date_effective_to: true,
                event_id: true, // Add event_id to see which records are being used
            },
        });
        console.log(`[Overview API] Fetched ${availableAvailabilities.length} availability blocks.`);
        console.log(`[Overview API] Event ID filter: ${eventIdParam ? `Only event_id=${eventIdParam} or NULL` : 'All events'}`);
        console.log(`[Overview API] Available Availabilities Details:`, JSON.stringify(availableAvailabilities, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }, 2));

        console.log('[Overview API] Fetching existing appointments...');
        const bookedSlots = await prisma.appointment.findMany({
            where: {
                business_id: businessId, // Use UUID string directly
                appointment_datetime: {
                    gte: startOfMonth(zonedStartDate),
                    lte: endOfMonth(zonedEndDate),
                },
                status: {
                    in: ['scheduled', 'confirmed'] // Only consider active appointments
                },
            },
            select: {
                appointment_datetime: true,
                duration_minutes: true,
            },
        });
        console.log(`[Overview API] Fetched ${bookedSlots.length} existing appointments.`);
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
                console.log(`  - Avail (day_of_week=${avail.day_of_week}, ${avail.is_recurring ? 'Recurring' : 'One-time'}): isEffective=${isEffective}`);
                return isEffective;
            });

            console.log(`  - Found ${availabilitiesForCurrentDay.length} specific availability blocks for ${format(day, 'EEEE')}.`);

            if (availabilitiesForCurrentDay.length === 0) {
                console.log(`  - No availability blocks found for ${format(day, 'EEEE')}, excluding this day.`);
                return false;
            }

            const hasPotentialOpenSlot = availabilitiesForCurrentDay.some(avail => {
                const dayStart = startOfDay(day);
                const availabilityStart = getTimeDate(day, avail.time_start);
                const availabilityEnd = getTimeDate(day, avail.time_end);

                console.log(`    - Checking availability block: ${format(availabilityStart, 'HH:mm')} - ${format(availabilityEnd, 'HH:mm')}`);

                // Check if there's enough time for the total required duration (duration + buffer)
                const potentialSlotEnd = addMinutes(availabilityStart, totalRequiredDuration);

                if (isAfter(potentialSlotEnd, availabilityEnd)) {
                    console.log(`    - Block too short for total required duration (${totalRequiredDuration} min).`);
                    return false;
                }

                // Check if this time slot conflicts with existing appointments
                const dayStartTime = startOfDay(day);
                const dayEndTime = addMinutes(dayStartTime, 24 * 60);

                const appointmentsForDay = bookedSlots.filter(appointment => {
                    const appointmentDate = appointment.appointment_datetime;
                    return isSameDay(appointmentDate, day);
                });

                console.log(`    - Found ${appointmentsForDay.length} appointments for this day.`);

                // Check if the availability block overlaps with any existing appointments
                const hasConflict = appointmentsForDay.some(appointment => {
                    const appointmentStart = appointment.appointment_datetime;
                    const appointmentDuration = appointment.duration_minutes || 60;
                    const appointmentEnd = addMinutes(appointmentStart, appointmentDuration);

                    // Check if the availability block overlaps with this appointment
                    const overlap = isBefore(availabilityStart, appointmentEnd) && isAfter(availabilityEnd, appointmentStart);

                    if (overlap) {
                        console.log(`    - CONFLICT: Availability block overlaps with appointment ${format(appointmentStart, 'HH:mm')} - ${format(appointmentEnd, 'HH:mm')}`);
                    }

                    return overlap;
                });

                if (hasConflict) {
                    console.log(`    - Availability block has conflicts with existing appointments.`);
                    return false;
                }

                console.log(`    - Availability block has potential open slots.`);
                return true;
            });

            if (hasPotentialOpenSlot) {
                console.log(`  - Day ${format(day, 'yyyy-MM-dd (EEEE)')} has potential open slots.`);
                return true;
            } else {
                console.log(`  - Day ${format(day, 'yyyy-MM-dd (EEEE)')} has no potential open slots.`);
                return false;
            }
        });

        console.log(`[Overview API] Available dates:`, availableDates.map(d => format(d, 'yyyy-MM-dd (EEEE)')));

        // Filter out past dates
        const today = startOfDay(toZonedTime(new Date(), BUSINESS_TIMEZONE));
        const futureAvailableDates = availableDates.filter(day => !isBefore(day, today));
        
        console.log(`[Overview API] Future available dates:`, futureAvailableDates.map(d => format(d, 'yyyy-MM-dd (EEEE)')));

        const result = {
            availableDates: futureAvailableDates.map(date => format(date, 'yyyy-MM-dd')),
            businessId: businessId,
            startDate: startDateParam,
            endDate: endDateParam,
            totalDays: daysInMonth.length,
            availableDays: futureAvailableDates.length
        };

        console.log(`[Overview API] Final result:`, result);

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error('[Overview API] Error:', error);
        return NextResponse.json({ error: 'Internal server error while generating availability overview.' }, { status: 500 });
    }
}