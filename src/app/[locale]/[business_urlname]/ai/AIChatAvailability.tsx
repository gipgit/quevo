"use client";

import React, { useState, useEffect } from 'react';
import ServiceDetailsModal from '@/components/ServiceDetailsModal';

interface ServiceEvent {
  event_id: number;
  event_name: string;
  event_description: string;
  event_type: string;
  duration_minutes: number;
  buffer_minutes: number;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  serviceeventavailability: any[];
}

interface Service {
  service_id: string;
  service_name: string;
  description: string;
  price_base: number;
  duration_minutes: number;
  active_quotation: boolean;
  active_booking: boolean;
  demo: boolean | null;
  has_image: boolean | null;
  serviceevent?: ServiceEvent[];
}

interface AIChatAvailabilityProps {
  data: {
    type: 'availability_service_selection' | 'availability_event_selection';
    services?: Service[];
    selectedService?: Service;
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  businessId: string;
  businessPublicUuid: string;
  onServiceSelect: (service: Service) => void;
  onBack: () => void;
}

export default function AIChatAvailability({ data, themeColors, businessId, businessPublicUuid, onServiceSelect, onBack }: AIChatAvailabilityProps) {
  // Use the selectedService from data instead of local state
  const selectedService = data.selectedService;
  const [modalService, setModalService] = useState<Service | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
  const [nextAvailableSlots, setNextAvailableSlots] = useState<{ [key: number]: any }>({});
  const [loadingSlots, setLoadingSlots] = useState<{ [key: number]: boolean }>({});

  const handleServiceSelect = (service: Service) => {
    onServiceSelect(service);
  };

  const handleBack = () => {
    onBack();
  };

  const handleAvailabilityClick = (service: Service) => {
    onServiceSelect(service);
  };

  const openModal = (service: Service) => {
    setModalService(service);
  };

  const closeModal = () => {
    setModalService(null);
  };

  const toggleDescription = (eventId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  // Fetch availability slots for all events when component mounts
  useEffect(() => {
    if (selectedService?.serviceevent) {
      // Clear cache when service changes
      setNextAvailableSlots({});
      setLoadingSlots({});
      
      const appointmentEvents = selectedService.serviceevent.filter((event: ServiceEvent) => event.event_type === 'appointment');
      
      console.log('Selected service events:', appointmentEvents);
      
      appointmentEvents.forEach(async (event) => {
        if (event.serviceeventavailability && event.serviceeventavailability.length > 0) {
          console.log('Fetching slots for event:', event.event_id);
          await getNextAvailableSlot(event.event_id, event.serviceeventavailability);
        }
      });
    }
  }, [selectedService]);

  const getNextAvailableSlot = async (eventId: number, availabilities: any[]) => {
    if (!availabilities || availabilities.length === 0) {
      return null;
    }

    // If we already have the slot for this event, return it
    if (nextAvailableSlots[eventId]) {
      console.log('Using cached slot for event:', eventId, nextAvailableSlots[eventId]);
      return nextAvailableSlots[eventId];
    }

    // If we're already loading for this event, return null
    if (loadingSlots[eventId]) {
      return null;
    }

    // Set loading state for this event
    setLoadingSlots(prev => ({ ...prev, [eventId]: true }));

    try {
      // Get the first availability to determine duration
      const firstAvailability = availabilities[0];
      const duration = selectedService?.duration_minutes || 60;

      // Get current date and next 30 days
      const now = new Date();
      console.log('Current date:', now.toISOString());
      console.log('Current year:', now.getFullYear());
      
      // Ensure we're using the current year and correct date range
      const startDate = now.toISOString();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      console.log('Date range:', { startDate, endDate });

      // Fetch available dates overview
      const overviewResponse = await fetch(
        `/api/businesses/${businessId}/availability/overview?startDate=${startDate}&endDate=${endDate}`
      );

      if (!overviewResponse.ok) {
        console.error('Failed to fetch availability overview');
        return null;
      }

      const overviewData = await overviewResponse.json();
      console.log('Overview API response:', overviewData);
      const availableDates = overviewData.availableDates || [];

      if (availableDates.length === 0) {
        console.log('No available dates found');
        return null;
      }

      // Get the first available date
      const firstAvailableDate = availableDates[0];
      console.log('First available date:', firstAvailableDate);

      // Fetch time slots for this date
      const slotsResponse = await fetch(
        `/api/businesses/${businessId}/availability/slots?date=${firstAvailableDate}&duration=${duration}`
      );

      if (!slotsResponse.ok) {
        console.error('Failed to fetch time slots');
        return null;
      }

      const slotsData = await slotsResponse.json();
      console.log('Slots API response:', slotsData);
      const availableSlots = slotsData.availableSlots || [];

      if (availableSlots.length === 0) {
        console.log('No available slots found for date:', firstAvailableDate);
        return null;
      }

      // Get the first available slot
      const firstSlot = availableSlots[0];
      
      // Format the date and time
      const slotDate = new Date(firstSlot.datetime);
      const formattedDate = slotDate.toLocaleDateString('it-IT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      const formattedTime = slotDate.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Calculate end time based on duration
      const endTime = new Date(slotDate.getTime() + duration * 60 * 1000);
      const formattedEndTime = endTime.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      const slotInfo = {
        day: formattedDate,
        timeStart: formattedTime,
        timeEnd: formattedEndTime,
        fullDate: slotDate
      };

      // Cache the result
      setNextAvailableSlots(prev => ({ ...prev, [eventId]: slotInfo }));
      return slotInfo;

    } catch (error) {
      console.error('Error fetching availability:', error);
      return null;
    } finally {
      setLoadingSlots(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (selectedService) {
    // Show events for selected service
    const appointmentEvents = selectedService.serviceevent?.filter((event: ServiceEvent) => event.event_type === 'appointment') || [];
    
    return (
      <div className="space-y-4">
        {appointmentEvents.length === 0 ? (
          <div className="p-4 rounded-lg border text-center" style={{ 
            backgroundColor: themeColors.text + '05',
            borderColor: themeColors.text + '20'
          }}>
            <p className="text-sm opacity-70">Nessun evento prenotabile disponibile per questo servizio.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointmentEvents.map((event) => {
              const nextSlot = nextAvailableSlots[event.event_id];
              const isLoading = loadingSlots[event.event_id];
              
              return (
                <div 
                  key={event.event_id}
                  className="p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: themeColors.text + '05',
                    borderColor: themeColors.text + '20'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-semibold text-sm">{event.event_name}</div>
                        {event.event_description && (
                          <button
                            onClick={() => toggleDescription(event.event_id)}
                            className="p-0.5 rounded-full transition-colors hover:bg-opacity-20 inline-flex items-center"
                            style={{
                              backgroundColor: themeColors.text + '10',
                              color: themeColors.text
                            }}
                          >
                            <svg 
                              className={`w-3 h-3 transition-transform ${expandedDescriptions[event.event_id] ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="text-xs opacity-60 mb-2">
                        {event.duration_minutes} min
                      </div>
                      {event.event_description && expandedDescriptions[event.event_id] && (
                        <div className="text-xs opacity-70 mb-2 leading-relaxed">
                          {event.event_description}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-xs">
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="opacity-70">Caricamento disponibilità...</span>
                    </div>
                  ) : nextSlot ? (
                    <div>
                      <div className="text-xs opacity-70 mb-1">
                        Prossima disponibilità:
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span 
                          className="font-semibold text-sm"
                          style={{ color: themeColors.button }}
                        >
                          {nextSlot.day} {nextSlot.timeStart} - {nextSlot.timeEnd}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="opacity-70">Nessuna disponibilità attuale</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Back button below events list */}
        <div className="flex justify-start mt-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: themeColors.text + '10',
              color: themeColors.text 
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Indietro</span>
          </button>
        </div>
      </div>
    );
  }

  // Show service selection
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm mb-3">Servizi con disponibilità prenotabile:</h4>
      
      <div className="space-y-3">
        {data.services?.map((service) => (
          <div 
            key={service.service_id}
            className="p-4 rounded-lg border transition-all hover:shadow-md"
            style={{ 
              backgroundColor: themeColors.text + '05',
              borderColor: themeColors.text + '20'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">{service.service_name}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(service)}
                    className="p-0.5 rounded-full transition-colors hover:bg-opacity-20 inline-flex items-center"
                    style={{
                      backgroundColor: themeColors.text + '10',
                      color: themeColors.text
                    }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <span className="text-xs opacity-70">Maggiori informazioni</span>
                  <span className="text-xs opacity-60 ml-2">
                    €{service.price_base || 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleAvailabilityClick(service)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                  style={{
                    backgroundColor: themeColors.button,
                    color: '#ffffff'
                  }}
                >
                  Disponibilità
                </button>
              </div>
            </div>
          </div>
        )        )}
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={modalService}
        businessPublicUuid={businessPublicUuid}
        themeColors={themeColors}
        onClose={closeModal}
        onAction={handleAvailabilityClick}
        actionButtonText="Controlla Disponibilità"
      />
    </div>
  );
}
