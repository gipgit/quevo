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
    isBefore,
    isWithinInterval
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const BUSINESS_TIMEZONE = 'Europe/Rome';

export async function GET(request, { params }) {
    const businessId = params.business_id; // Use UUID string directly, don't parse as integer
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const durationParam = searchParams.get('duration');
    const eventIdParam = searchParams.get('eventId');

    console.log(`--- API Call Start for Business ID: ${businessId}, Date: ${dateParam}, Duration: ${durationParam}, EventId: ${eventIdParam} ---`);

    if (!businessId || !dateParam || isNaN(parseInt(durationParam))) {
        console.error("Missing or invalid parameters:", { businessId, dateParam, durationParam });
        return NextResponse.json({ error: 'Missing or invalid business ID, date, or duration.' }, { status: 400 });
    }

    const bookingDate = toZonedTime(parseISO(dateParam), BUSINESS_TIMEZONE);
    const bookingDayStart = startOfDay(bookingDate);

    console.log("Parsed bookingDate (zoned):", bookingDate.toISOString());
    console.log("BookingDayStart (zoned):", bookingDayStart.toISOString());

    // Get event details if eventId is provided, otherwise use duration from request
    let eventDuration = durationParam ? parseInt(durationParam) : 60;
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
                console.log(`[DEBUG] Event details - duration: ${eventDuration}, buffer: ${eventBuffer}`);
            }
        } catch (error) {
            console.error('[DEBUG] Error fetching event details:', error);
        }
    }
    
    const totalOccupancyDuration = eventDuration + eventBuffer;
    console.log(`[DEBUG] Total required duration (duration + buffer): ${totalOccupancyDuration} minutes`);

    if (isNaN(bookingDate.getTime())) {
        console.error("Invalid date format parsed:", dateParam);
        return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    // Get current server time and convert it to the business's timezone for consistent comparison
    const nowInBusinessTimezone = toZonedTime(new Date(), BUSINESS_TIMEZONE);
    const todayStartInBusinessTimezone = startOfDay(nowInBusinessTimezone);

    console.log("Current server time (zoned to business timezone):", nowInBusinessTimezone.toISOString());
    console.log("Today's start (zoned to business timezone):", todayStartInBusinessTimezone.toISOString());

    // If the booking date is strictly before today's start, no slots can be offered.
    if (isBefore(bookingDayStart, todayStartInBusinessTimezone)) {
        console.log(`Requested date ${dateParam} is in the past. Returning no slots.`);
        return NextResponse.json({ availableSlots: [] }, { status: 200 });
    }
    console.log("Booking date is not in the past.");

    try {
        // Get business working hours from serviceeventavailability table
        const dayOfWeek = bookingDate.getDay();
        console.log("Day of week for bookingDate:", dayOfWeek);

        console.log(`[DEBUG] Querying ServiceEventAvailability for day ${dayOfWeek} (${format(bookingDate, 'EEEE')})`);
        
        // Build the where clause based on whether eventId is provided
        let availabilityWhere = {
            business_id: businessId, // Use UUID string directly
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
        };

        // If eventId is provided, filter to only include event-specific availability
        if (eventIdParam) {
            availabilityWhere.AND = [
                { event_id: parseInt(eventIdParam) } // Only event-specific availability
            ];
            console.log(`[DEBUG] Filtering for specific event ID: ${eventIdParam}`);
        } else {
            console.log(`[DEBUG] No event ID provided, fetching all business availability`);
        }
        
        const availabilitiesForDay = await prisma.serviceeventavailability.findMany({
            where: availabilityWhere,
            select: {
                availability_id: true,
                event_id: true,
                business_id: true,
                day_of_week: true,
                time_start: true,
                time_end: true,
                slot_interval_minutes: true,
                is_recurring: true,
                date_effective_from: true,
                date_effective_to: true
            },
            orderBy: {
                time_start: 'asc'
            }
        });

        console.log(`[DEBUG] Fetched ${availabilitiesForDay.length} availability blocks for ${format(bookingDate, 'EEEE')}:`);
        availabilitiesForDay.forEach((avail, index) => {
            console.log(`  [${index}] Day ${avail.day_of_week}: ${avail.time_start.toISOString().substring(11,19)} - ${avail.time_end.toISOString().substring(11,19)} (Event ID: ${avail.event_id}, Interval: ${avail.slot_interval_minutes}min)`);
        });
        
        console.log("Fetched availabilitiesForDay:", JSON.stringify(availabilitiesForDay));

        if (availabilitiesForDay.length === 0) {
            console.log(`No availability blocks found for businessId ${businessId} on ${dateParam}.`);
            return NextResponse.json({ availableSlots: [] }, { status: 200 });
        }

        // Get existing appointments for this date
        const existingAppointments = await prisma.appointment.findMany({
            where: {
                business_id: businessId, // Use UUID string directly
                appointment_datetime: {
                    gte: bookingDayStart,
                    lt: addMinutes(bookingDayStart, 24 * 60) // Next day
                },
                status: {
                    in: ['scheduled', 'confirmed'] // Only consider active appointments
                }
            },
            select: {
                appointment_datetime: true,
                duration_minutes: true,
            },
            orderBy: {
                appointment_datetime: 'asc',
            },
        });

        console.log("Fetched existingAppointments:", JSON.stringify(existingAppointments));

        // Convert appointments to time intervals
        const bookedIntervals = existingAppointments.map(appointment => {
            const startTime = appointment.appointment_datetime;
            const duration = appointment.duration_minutes || 60; // Default to 60 minutes
            const endTime = addMinutes(startTime, duration);
            console.log(`  Booked Interval: ${formatInTimeZone(startTime, BUSINESS_TIMEZONE, 'HH:mm')} - ${formatInTimeZone(endTime, BUSINESS_TIMEZONE, 'HH:mm')}`);
            return { start: startTime, end: endTime };
        });

        const availableSlots = [];
        const addedSlots = new Set();
        // Get slot interval from the first availability block (all should have the same interval for the same event)
        const slotCheckIntervalMinutes = availabilitiesForDay.length > 0 ? (availabilitiesForDay[0].slot_interval_minutes || 15) : 15;
        console.log(`[DEBUG] Using slot interval: ${slotCheckIntervalMinutes} minutes`);

        // Helper function to convert time to date
        const getTimeDate = (timeDateObjectFromPrisma) => {
            if (!(timeDateObjectFromPrisma instanceof Date) || isNaN(timeDateObjectFromPrisma.getTime())) {
                console.warn("getTimeDate received invalid input:", timeDateObjectFromPrisma);
                return null;
            }
            // Extract time from the ISO string to avoid timezone conversion
            const timeString = timeDateObjectFromPrisma.toISOString().substring(11, 19); // Get "HH:mm:ss"
            const [hours, minutes] = timeString.split(':').map(Number);
            console.log(`  getTimeDate: Raw Prisma Time Object: ${timeDateObjectFromPrisma.toISOString()}, Extracted Hours: ${hours}, Extracted Minutes: ${minutes}`);
            const resultTime = setMinutes(setHours(bookingDayStart, hours), minutes);
            console.log(`  getTimeDate: Resulting zoned time: ${resultTime.toISOString()}`);
            return resultTime;
        };

        for (const avail of availabilitiesForDay) {
            console.log(`\n--- Processing availability block: ${formatInTimeZone(getTimeDate(avail.time_start), BUSINESS_TIMEZONE, 'HH:mm')} to ${formatInTimeZone(getTimeDate(avail.time_end), BUSINESS_TIMEZONE, 'HH:mm')} ---`);

            let currentSlotCandidateTime = getTimeDate(avail.time_start);
            const blockEndTime = getTimeDate(avail.time_end);

            // Time for comparison: now in the business's timezone, plus 15 mins buffer
            const minAllowedStartTimeForToday = addMinutes(nowInBusinessTimezone, 15);
            console.log("minAllowedStartTimeForToday:", minAllowedStartTimeForToday.toISOString());

            // Check if the booking date is today, and if current candidate time is before 'now' + buffer
            if (isSameDay(bookingDayStart, nowInBusinessTimezone) && isBefore(currentSlotCandidateTime, minAllowedStartTimeForToday)) {
                console.log("Condition met: Booking date is TODAY and current candidate time is BEFORE minAllowedStartTimeForToday.");
                const minutesSinceMidnight = minAllowedStartTimeForToday.getHours() * 60 + minAllowedStartTimeForToday.getMinutes();
                const remainder = minutesSinceMidnight % slotCheckIntervalMinutes;
                const minutesToAdd = remainder === 0 ? 0 : slotCheckIntervalMinutes - remainder;
                currentSlotCandidateTime = addMinutes(minAllowedStartTimeForToday, minutesToAdd);
                console.log("Adjusted currentSlotCandidateTime (due to 'today' logic):", currentSlotCandidateTime.toISOString());
            } else {
                console.log("Condition NOT met: Booking date is NOT today OR current candidate time is NOT before minAllowedStartTimeForToday.");
                console.log("Initial candidate for this block (after getTimeDate):", currentSlotCandidateTime.toISOString());
            }

            // Initial check for block validity
            if (!currentSlotCandidateTime || !blockEndTime ||
                isAfter(currentSlotCandidateTime, blockEndTime) ||
                isBefore(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), currentSlotCandidateTime) ||
                isAfter(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), blockEndTime)) {
                console.log(`Skipping block due to initial invalidity. Candidate: ${currentSlotCandidateTime?.toISOString()}, Block End: ${blockEndTime?.toISOString()}`);
                continue;
            }

            // Loop to generate slots within the current availability block
            while (!isAfter(addMinutes(currentSlotCandidateTime, totalOccupancyDuration), blockEndTime)) {
                const potentialSlotEndTime = addMinutes(currentSlotCandidateTime, totalOccupancyDuration);
                const slotFormatString = formatInTimeZone(currentSlotCandidateTime, BUSINESS_TIMEZONE, 'HH:mm');

                console.log(`  Evaluating potential slot: ${slotFormatString} (ends ${formatInTimeZone(potentialSlotEndTime, BUSINESS_TIMEZONE, 'HH:mm')}) [Raw time: ${currentSlotCandidateTime.toISOString()}]`);

                if (addedSlots.has(slotFormatString)) {
                    console.log(`  Skipping ${slotFormatString} - already added (or duplicate check).`);
                    currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
                    continue;
                }

                // Check if slot conflicts with existing appointments
                const isBlockedByExistingAppointment = bookedIntervals.some(booked => {
                    const overlap = isBefore(currentSlotCandidateTime, booked.end) && isAfter(potentialSlotEndTime, booked.start);
                    if (overlap) {
                        console.log(`  Slot ${slotFormatString} IS BLOCKED by existing appointment from ${formatInTimeZone(booked.start, BUSINESS_TIMEZONE, 'HH:mm')} to ${formatInTimeZone(booked.end, BUSINESS_TIMEZONE, 'HH:mm')}`);
                    }
                    return overlap;
                });

                if (!isBlockedByExistingAppointment) {
                    console.log(`  Slot ${slotFormatString} is AVAILABLE.`);
                    availableSlots.push({
                        time: slotFormatString,
                        datetime: currentSlotCandidateTime.toISOString(),
                        duration: totalOccupancyDuration
                    });
                    addedSlots.add(slotFormatString);
                } else {
                    console.log(`  Slot ${slotFormatString} is BLOCKED.`);
                }

                currentSlotCandidateTime = addMinutes(currentSlotCandidateTime, slotCheckIntervalMinutes);
            }
        }

        console.log(`Generated ${availableSlots.length} available slots for businessId ${businessId} on ${dateParam}.`);
        console.log("Available slots:", availableSlots);

        return NextResponse.json({
            availableSlots: availableSlots,
            businessId: businessId,
            date: dateParam,
            duration: totalOccupancyDuration
        }, { status: 200 });

    } catch (error) {
        console.error('Error generating available slots:', error);
        return NextResponse.json({ error: 'Internal server error while generating available slots.' }, { status: 500 });
    }
}
