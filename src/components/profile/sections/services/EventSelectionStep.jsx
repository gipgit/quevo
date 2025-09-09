"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

export default function EventSelectionStep({
    serviceEvents,
    selectedEvent,
    onEventSelect,
    themeColorText,
    themeColorBackgroundCard,
    themeColorButton,
    themeColorBorder
}) {
    const t = useTranslations('ServiceRequest');

    return (
        <div className="space-y-4 px-4 py-3 md:px-6 md:py-4 lg:p-6">
            <h2 className="text-base md:text-lg lg:text-2xl font-bold mb-1 md:mb-2 lg:mb-2" style={{ color: themeColorText }}>
                {t('selectEvent')}
            </h2>
            
            <div className="grid gap-3">
                {serviceEvents.map((event) => (
                    <div
                        key={event.event_id}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                            selectedEvent?.event_id === event.event_id 
                                ? 'ring-2 ring-offset-2' 
                                : 'hover:shadow-md'
                        }`}
                        style={{
                            backgroundColor: selectedEvent?.event_id === event.event_id ? themeColorButton + '20' : themeColorBackgroundCard,
                            borderColor: selectedEvent?.event_id === event.event_id ? themeColorButton : themeColorBorder,
                        }}
                        onClick={() => onEventSelect(event)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2" style={{ color: themeColorText }}>
                                    {event.event_title}
                                </h3>
                                {event.event_description && (
                                    <p className="text-xs lg:text-sm opacity-70" style={{ color: themeColorText }}>
                                        {event.event_description}
                                    </p>
                                )}
                            </div>
                            <button
                                className="px-2 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm rounded-lg font-medium transition-colors ml-4"
                                style={{
                                    backgroundColor: selectedEvent?.event_id === event.event_id ? themeColorButton : 'transparent',
                                    color: selectedEvent?.event_id === event.event_id ? 'white' : themeColorButton,
                                    border: `1px solid ${themeColorButton}`
                                }}
                            >
                                {t('select')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
