// src/components/profile/sections/booking/DateTimeSelection.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

import { format, parse, startOfWeek, getDay, isBefore, isSameDay, addDays, startOfDay, addMonths, startOfMonth } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import it from 'date-fns/locale/it';
import es from 'date-fns/locale/es';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import zhCN from 'date-fns/locale/zh-CN';
import ar from 'date-fns/locale/ar';

import { useTranslations } from 'next-intl';

import CustomToolbarCalendar from './CustomToolbarCalendar';
import CustomDateCellWrapper from './CustomDateCellWrapper'; // This now handles everything
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const locales = {
    'en-US': enUS, 'it': it, 'es': es, 'fr': fr, 'de': de, 'zh-CN': zhCN, 'ar': ar,
};

const localizer = dateFnsLocalizer({
    format, parse, startOfWeek, getDay, locales,
});

export default function DateTimeSelection({
    businessId, totalOccupancyDuration, onDateTimeSelect, selectedDateTime,
    themeColorText, themeColorBackgroundCard, themeColorButton, themeColorBorder, locale, onBack, onSkip, selectedEvent
}) {
    const t = useTranslations('ServiceRequest');
    const tCommon = useTranslations('Common');

    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(selectedDateTime?.date || startOfDay(new Date()));
    const [availableDaysOverview, setAvailableDaysOverview] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [overviewError, setOverviewError] = useState(null);

    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    console.log("Available Days Overview:", availableDaysOverview); // Keep this for debugging!

    const fetchAvailabilityOverview = useCallback(async (start, end) => {
        setLoadingOverview(true);
        setOverviewError(null);
        try {
                    const response = await fetch(
            `/api/businesses/${businessId}/availability/overview?startDate=${start.toISOString()}&endDate=${end.toISOString()}&duration=${totalOccupancyDuration}&eventId=${selectedEvent?.event_id || ''}`
        );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t('failedToLoadAvailability'));
            }
            const data = await response.json();
            console.log("API Response for availability overview:", data);
            setAvailableDaysOverview(data.availableDates || []);
        } catch (err) {
            console.error("Error fetching availability overview:", err);
            setOverviewError(err.message);
            setAvailableDaysOverview([]);
        } finally {
            setLoadingOverview(false);
        }
    }, [businessId, t]);

    const fetchTimeSlots = useCallback(async (dateToFetch) => {
        setLoadingSlots(true);
        setSlotsError(null);
        setAvailableTimeSlots([]);
        try {
            const dateString = format(dateToFetch, 'yyyy-MM-dd');
            const response = await fetch(
                `/api/businesses/${businessId}/availability/slots?date=${dateString}&duration=${totalOccupancyDuration}`
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
        const fetchUntil = addMonths(currentMonthStart, 2);
        fetchAvailabilityOverview(currentMonthStart, fetchUntil);
    }, [calendarDate, fetchAvailabilityOverview, locale]);

    useEffect(() => {
        if (selectedDate && totalOccupancyDuration > 0) {
            if (!isBefore(selectedDate, startOfDay(new Date()))) {
                fetchTimeSlots(selectedDate);
            } else {
                setAvailableTimeSlots([]);
                setSlotsError(t('cannotSelectPastDate'));
            }
        } else if (selectedDate && totalOccupancyDuration === 0) {
            setAvailableTimeSlots([]);
            setSlotsError(t('serviceDurationInvalid'));
        }
    }, [selectedDate, totalOccupancyDuration, fetchTimeSlots, t]);

    const handleCalendarNavigate = useCallback((newDate) => {
        setCalendarDate(newDate);
    }, []);

    const handleDateSelect = useCallback((slotInfo) => {
        // console.log("handleDateSelect received slotInfo:", slotInfo); // Keep this for debugging!
        const clickedDate = startOfDay(slotInfo.start);
        const today = startOfDay(new Date());

        if (isBefore(clickedDate, today)) {
            setSlotsError(t('cannotSelectPastDate'));
            setAvailableTimeSlots([]);
            return;
        }

        setSelectedDate(clickedDate);
        setSlotsError(null);
    }, [t]);

    const handleTimeSlotClick = (time) => {
        onDateTimeSelect({ date: selectedDate, time });
    };

    const handleSkip = useCallback(() => {
        if (onSkip) {
            onSkip();
        }
    }, [onSkip]);

    const dayPropGetter = useCallback((date) => {
        // Return empty props to let CustomDateCellWrapper handle all styling
        return {
            className: '',
            style: {},
        };
    }, []);


    return (
        <div className="flex flex-col h-full p-6" style={{ color: themeColorText}}>
            <h3 className="text-sm lg:text-xl font-semibold mb-6 capitalize">
                {t('selectDateAndTime')} {selectedEvent && `per ${selectedEvent.event_title}`}
            </h3>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-3/5">
                    {loadingOverview && (
                        <div className="relative rounded-lg p-8" style={{ backgroundColor: themeColorBackgroundCard }}>
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
                                <LoadingSpinner size="lg" color="gray" />
                            </div>
                        </div>
                    )}
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
                            components={{
                                toolbar: CustomToolbarCalendar,
                                // Pass ALL necessary props to CustomDateCellWrapper
                                // It now handles both click and content rendering
                                dateCellWrapper: (props) => (
                                    <CustomDateCellWrapper
                                        {...props}
                                        onDateCellClick={handleDateSelect}
                                        availableDaysOverview={availableDaysOverview}
                                        themeColorButton={themeColorButton}
                                    />
                                ),
                                // IMPORTANT: Remove the 'dateCell' override, as dateCellWrapper handles content now.
                                // dateCell: (props) => (
                                //     <CustomDateCellContent
                                //         {...props}
                                //         availableDaysOverview={availableDaysOverview}
                                //         themeColorButton={themeColorButton}
                                //     />
                                // ),
                            }}
                        />
                    )}
                    <div className="mt-4 flex items-center text-sm" style={{ color: themeColorText }}>
                        <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: themeColorButton}}></span>
                        {t('availableDayIndicator')}
                    </div>
                </div>

                <div className="md:w-2/5">
                    <p className="text-sm mb-4">
                        {t('selectedDate')}: <span className="font-semibold">{format(selectedDate, 'dd/MM/yyyy')}</span>
                    </p>
                    {loadingSlots && (
                        <div className="relative rounded-lg p-6" style={{ backgroundColor: themeColorBackgroundCard }}>
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
                                <LoadingSpinner size="md" color="gray" />
                            </div>
                        </div>
                    )}
                    {slotsError && <p className="text-sm text-red-500">{slotsError}</p>}
                    {!loadingSlots && availableTimeSlots.length === 0 && !slotsError && (
                        <p className="text-xs opacity-50">{t('noSlotsAvailable')}</p>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                        {availableTimeSlots.map((slot) => (
                            <button
                                key={slot.time}
                                className={`p-2 rounded-md border transition-colors ${
                                    selectedDateTime?.time === slot.time && isSameDay(selectedDateTime?.date, selectedDate)
                                        ? 'text-white'
                                        : ''
                                }`}
                                style={{
                                    backgroundColor: selectedDateTime?.time === slot.time && isSameDay(selectedDateTime?.date, selectedDate) ? themeColorButton : themeColorBackgroundCard,
                                    color: selectedDateTime?.time === slot.time && isSameDay(selectedDateTime?.date, selectedDate) ? 'white' : themeColorText,
                                    borderColor: selectedDateTime?.time === slot.time && isSameDay(selectedDateTime?.date, selectedDate) ? 'white' : themeColorBorder, 
                                }}
                                onClick={() => handleTimeSlotClick(slot.time)}
                                disabled={selectedDateTime?.time === slot.time && isSameDay(selectedDateTime?.date, selectedDate)}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`flex ${onBack ? 'justify-between' : 'justify-end'} pt-4 mt-auto sticky bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-gray-200 -mx-6 px-6 py-4`}>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="py-2 px-4 rounded transition-colors"
                        style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorText}` }}
                    >
                        {tCommon('back')}
                    </button>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 rounded-md text-sm font-medium"
                        style={{ backgroundColor: 'transparent', color: themeColorText, border: `1px solid ${themeColorBorder}` }}
                    >
                        {t('skip')}
                    </button>
                </div>
            </div>
        </div>
    );
}