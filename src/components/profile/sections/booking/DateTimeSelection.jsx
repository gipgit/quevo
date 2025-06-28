// src/components/profile/sections/booking/DateTimeSelection.jsx

"use client"; // This is a Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

// date-fns functions
import { format, parse, startOfWeek, getDay, isBefore, isSameDay, addDays, startOfDay, addMonths, startOfMonth } from 'date-fns';
// Import ALL locales you plan to use
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import zhCN from 'date-fns/locale/zh-CN';
import ar from 'date-fns/locale/ar';

import { useTranslations } from 'next-intl';

// Define locales for react-big-calendar, including all supported ones
const locales = {
    'en-US': enUS,
    'it': it,
    'es': es,
    'fr': fr,
    'de': de,
    'zh-CN': zhCN,
    'ar': ar,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function DateTimeSelection({
    businessId,
    totalOccupancyDuration,
    onDateTimeSelect,
    selectedDateTime,
    themeColorText,
    themeColorButton,
    locale,
    onBack
}) {
    const t = useTranslations('Booking');

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(selectedDateTime?.date || startOfDay(new Date()));
    const [availableDaysOverview, setAvailableDaysOverview] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState(null);

    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    const cardBackgroundColor = themeColorText === '#FFFFFF' ? '#F0F0F0' : '#FFFFFF';
    const itemBackgroundColor = themeColorText === '#FFFFFF' ? '#E0E0E0' : '#F8F8F8';


    // --- Fetching Calendar Overview (Days with any availability) ---
    const fetchAvailabilityOverview = useCallback(async (start, end) => {
        setLoadingOverview(true);
        setOverviewError(null);
        try {
            const response = await fetch(
                `/api/business/${businessId}/availability/overview?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('failedToLoadAvailability'));
            }
            const data = await response.json();
            setAvailableDaysOverview(data.availableDates || []);
        } catch (err) {
            console.error("Error fetching availability overview:", err);
            setOverviewError(err.message);
            setAvailableDaysOverview([]);
        } finally {
            setLoadingOverview(false);
        }
    }, [businessId, t]);

    // --- Fetching Specific Time Slots for Selected Date ---
    const fetchTimeSlots = useCallback(async (dateToFetch) => {
        setLoadingSlots(true);
        setSlotsError(null);
        setAvailableTimeSlots([]);
        try {
            const dateString = format(dateToFetch, 'yyyy-MM-dd');
            const response = await fetch(
                `/api/business/${businessId}/availability/slots?date=${dateString}&duration=${totalOccupancyDuration}`
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('failedToLoadAvailability'));
            }
            const data = await response.json();
            setAvailableTimeSlots(data.availableSlots || []);
        } catch (err) {
            console.error("Error fetching time slots:", err);
            setSlotsError(err.message);
            setAvailableTimeSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, [businessId, totalOccupancyDuration, t]);

    useEffect(() => {
        const currentMonthStart = startOfMonth(calendarDate);
        // Fetch for the current month displayed, and the next two months
        const fetchUntil = addMonths(currentMonthStart, 2);

        fetchAvailabilityOverview(currentMonthStart, fetchUntil);
    }, [calendarDate, fetchAvailabilityOverview, locale]);


    useEffect(() => {
        // --- ADDED CONSOLE.LOGS FOR DEBUGGING totalOccupancyDuration ---
        console.log("--- Time Slots useEffect Triggered ---");
        console.log("Current selectedDate:", selectedDate ? format(selectedDate, 'yyyy-MM-dd (EEEE)') : 'null/undefined');
        console.log("totalOccupancyDuration:", totalOccupancyDuration);
        console.log("Is selectedDate in the past?", isBefore(selectedDate, startOfDay(new Date())));
        // --- END ADDED CONSOLE.LOGS ---

        if (selectedDate && totalOccupancyDuration > 0) {
            // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
            console.log("Conditions met: selectedDate is valid and totalOccupancyDuration > 0. Attempting to fetch slots.");
            // --- END ADDED CONSOLE.LOG ---
            if (!isBefore(selectedDate, startOfDay(new Date()))) {
                fetchTimeSlots(selectedDate);
            } else {
                // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
                console.log("Condition 2 is FALSE (past date selected).");
                // --- END ADDED CONSOLE.LOG ---
                setAvailableTimeSlots([]);
                setSlotsError(t('cannotSelectPastDate'));
            }
        } else if (selectedDate && totalOccupancyDuration === 0) {
            // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
            console.log("totalOccupancyDuration is 0. Cannot fetch slots.");
            // --- END ADDED CONSOLE.LOG ---
            setAvailableTimeSlots([]);
            setSlotsError(t('serviceDurationInvalid'));
        } else {
            // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
            console.log("selectedDate is null/undefined or totalOccupancyDuration is <= 0.");
            // --- END ADDED CONSOLE.LOG ---
        }
    }, [selectedDate, totalOccupancyDuration, fetchTimeSlots, t]);

    const handleCalendarNavigate = useCallback((newDate) => {
        setCalendarDate(newDate);
    }, []);

    const handleDateSelect = useCallback((slotInfo) => {
        const clickedDate = startOfDay(slotInfo.start);
        const today = startOfDay(new Date());

        // --- ADDED CONSOLE.LOGS FOR DEBUGGING ---
        console.log("handleDateSelect called.");
        console.log("Clicked Date (startOfDay):", format(clickedDate, 'yyyy-MM-dd (EEEE)'));
        console.log("Current Selected Date (before update):", selectedDate ? format(selectedDate, 'yyyy-MM-dd (EEEE)') : 'null/undefined');
        // --- END ADDED CONSOLE.LOGS ---

        if (isBefore(clickedDate, today)) {
            // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
            console.log("Attempted to select a past date. Clearing slots.");
            // --- END ADDED CONSOLE.LOG ---
            setSlotsError(t('cannotSelectPastDate'));
            setAvailableTimeSlots([]);
            return;
        }

        setSelectedDate(clickedDate);
        setSlotsError(null);

        // --- ADDED CONSOLE.LOG FOR DEBUGGING ---
        console.log("Selected Date updated to:", format(clickedDate, 'yyyy-MM-dd (EEEE)'));
        // --- END ADDED CONSOLE.LOGS ---

    }, [t, selectedDate]); // 'selectedDate' added to dependencies for accurate logging of its 'before' value

    const handleTimeSlotClick = (time) => {
        onDateTimeSelect({ date: selectedDate, time });
    };

    const dayPropGetter = useCallback((date) => {
        const dayString = format(date, 'yyyy-MM-dd');
        const isAvailable = availableDaysOverview.includes(dayString);
        const today = startOfDay(new Date());
        const isPastDate = isBefore(date, today);

        return {
            className: `${isAvailable && !isPastDate ? 'has-availability' : ''}`,
            style: {},
        };
    }, [availableDaysOverview]);


    return (
        <div className="" style={{ color: themeColorText}}>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-3/5">
                    <h3 className="text-xl font-semibold mb-3">{t('selectDate')}</h3>
                    {loadingOverview && <p className="text-sm">{t('loadingCalendar')}</p>}
                    {overviewError && <p className="text-sm text-red-500">{overviewError}</p>}
                    {!loadingOverview && (
                        <Calendar
                            localizer={localizer}
                            events={[]}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 380 }}
                            date={calendarDate}
                            onNavigate={handleCalendarNavigate}
                            onSelectSlot={handleDateSelect}
                            selectable={true}
                            views={['month']}
                            defaultView="month"
                            min={startOfDay(new Date())}
                            dayPropGetter={dayPropGetter}
                            formats={{
                                monthHeaderFormat: (date, culture, localizer) => localizer.format(date, 'MMMM yyyy', culture),
                                weekdayFormat: (date, culture, localizer) => localizer.format(date, 'EE', culture),
                                dayFormat: (date, culture, localizer) => localizer.format(date, 'd', culture),
                            }}
                            culture={locale}
                        />
                    )}
                    <div className="mt-4 flex items-center text-sm" style={{ color: themeColorText }}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#04dd4e'}}></span>
                        {t('availableDayIndicator')}
                    </div>
                </div>

                <div className="md:w-2/5">
                    <h3 className="text-xl font-semibold mb-3">{t('selectTime')}</h3>
                    <p className="text-sm mb-4">
                        {t('selectedDate')}: <span className="font-semibold">{format(selectedDate, 'dd/MM/yyyy')}</span>
                    </p>
                    {loadingSlots && <p className="text-sm">{t('loadingSlots')}</p>}
                    {slotsError && <p className="text-sm text-red-500">{slotsError}</p>}
                    {!loadingSlots && availableTimeSlots.length === 0 && !slotsError && (
                        <p className="text-sm">{t('noSlotsAvailable')}</p>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                        {availableTimeSlots.map((time) => (
                            <button
                                key={time}
                                className={`p-2 rounded-md border transition-colors ${
                                    selectedDateTime?.time === time && isSameDay(selectedDateTime?.date, selectedDate)
                                        ? 'text-white'
                                        : ''
                                }`}
                                style={{
                                    backgroundColor: selectedDateTime?.time === time && isSameDay(selectedDateTime?.date, selectedDate) ? themeColorButton : itemBackgroundColor,
                                    borderColor: themeColorButton,
                                    color: selectedDateTime?.time === time && isSameDay(selectedDateTime?.date, selectedDate) ? 'white' : themeColorText,
                                }}
                                onClick={() => handleTimeSlotClick(time)}
                                disabled={selectedDateTime?.time === time && isSameDay(selectedDateTime?.date, selectedDate)}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-start mt-6">
                <button
                    onClick={onBack}
                    className="py-2 px-4 rounded transition-colors"
                    style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorText}` }}
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );
}