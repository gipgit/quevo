"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface AIChatServiceRequestProps {
  data: any;
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  onStepComplete: (step: string, data: any) => void;
  onBack: () => void;
}

export default function AIChatServiceRequest({ 
  data, 
  themeColors, 
  onStepComplete, 
  onBack 
}: AIChatServiceRequestProps) {
  const [currentStep, setCurrentStep] = useState(data.step || 'service_selection');
  const [selectedService, setSelectedService] = useState(data.preselectedService || null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [customerDetails, setCustomerDetails] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerNotes: ''
  });

  // Service Selection Step
  const ServiceSelectionStep = () => {
    // If there's only one service and it's pre-selected, skip this step
    if (data.services.length === 1 && data.preselectedService) {
      return null; // Don't render service selection if service is already selected
    }

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
          Scegli il servizio
        </h4>
        <div className="space-y-3">
          {data.services.map((service: any, index: number) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedService?.service_id === service.service_id 
                  ? 'ring-2 ring-offset-2' 
                  : 'hover:shadow-md'
              }`}
              style={{ 
                backgroundColor: selectedService?.service_id === service.service_id 
                  ? themeColors.button + '10' 
                  : themeColors.text + '05',
                borderColor: selectedService?.service_id === service.service_id 
                  ? themeColors.button 
                  : themeColors.text + '20'
              }}
              onClick={() => setSelectedService(service)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm">{service.service_name}</div>
                <div className="font-bold text-sm" style={{ color: themeColors.button }}>
                  €{service.price_base}
                </div>
              </div>
              {service.description && (
                <div className="text-xs opacity-70 mb-2 leading-relaxed">
                  {service.description}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs opacity-60">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {service.duration_minutes} min
                </div>
                {service.date_selection && (
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                    Prenotabile
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {selectedService && (
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: themeColors.button, 
                color: '#FFFFFF' 
              }}
              onClick={() => {
                if (selectedService.date_selection) {
                  setCurrentStep('datetime_selection');
                } else {
                  setCurrentStep('customer_details');
                }
              }}
            >
              Continua
            </button>
          </div>
        )}
      </div>
    );
  };

  // DateTime Selection Step
  const DateTimeSelectionStep = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');

    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          {data.services.length > 1 && (
            <button
              onClick={() => setCurrentStep('service_selection')}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
          )}
          <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
            Scegli data e ora
          </h4>
        </div>

        <div className="space-y-4">
          {/* Date Selection */}
          <div>
            <label className="block text-xs font-medium mb-2">Data</label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full p-3 rounded-lg border text-sm"
              style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20',
                color: themeColors.text
              }}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-xs font-medium mb-2">Orario</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedTime === time 
                      ? 'text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                  style={{ 
                    backgroundColor: selectedTime === time 
                      ? themeColors.button 
                      : themeColors.text + '05',
                    borderColor: themeColors.text + '20'
                  }}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedDate && selectedTime && (
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: themeColors.button, 
                color: '#FFFFFF' 
              }}
              onClick={() => {
                setSelectedDateTime({ date: selectedDate, time: selectedTime });
                setCurrentStep('customer_details');
              }}
            >
              Continua
            </button>
          </div>
        )}
      </div>
    );
  };

  // Customer Details Step
  const CustomerDetailsStep = () => {
    const handleSubmit = () => {
      onStepComplete('service_request_complete', {
        service: selectedService,
        dateTime: selectedDateTime,
        customerDetails
      });
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          {(data.services.length > 1 || selectedService?.date_selection) && (
            <button
              onClick={() => {
                if (selectedService?.date_selection) {
                  setCurrentStep('datetime_selection');
                } else if (data.services.length > 1) {
                  setCurrentStep('service_selection');
                }
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
          )}
          <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
            I tuoi dati
          </h4>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Nome completo *</label>
            <input
              type="text"
              value={customerDetails.customerName}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full p-3 rounded-lg border text-sm"
              style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20',
                color: themeColors.text
              }}
              placeholder="Il tuo nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Email *</label>
            <input
              type="email"
              value={customerDetails.customerEmail}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, customerEmail: e.target.value }))}
              className="w-full p-3 rounded-lg border text-sm"
              style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20',
                color: themeColors.text
              }}
              placeholder="La tua email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Telefono</label>
            <input
              type="tel"
              value={customerDetails.customerPhone}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, customerPhone: e.target.value }))}
              className="w-full p-3 rounded-lg border text-sm"
              style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20',
                color: themeColors.text
              }}
              placeholder="Il tuo numero di telefono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Note aggiuntive</label>
            <textarea
              value={customerDetails.customerNotes}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, customerNotes: e.target.value }))}
              className="w-full p-3 rounded-lg border text-sm resize-none"
              style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20',
                color: themeColors.text
              }}
              placeholder="Note o richieste speciali"
              rows={3}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 rounded-lg border mt-4" style={{ 
          backgroundColor: themeColors.text + '05',
          borderColor: themeColors.text + '20'
        }}>
          <h5 className="font-medium text-sm mb-2">Riepilogo prenotazione</h5>
          <div className="text-xs space-y-1">
            <div><strong>Servizio:</strong> {selectedService?.service_name}</div>
            <div><strong>Prezzo:</strong> €{selectedService?.price_base}</div>
            {selectedDateTime && (
              <div><strong>Data e ora:</strong> {format(selectedDateTime.date, 'dd/MM/yyyy', { locale: it })} alle {selectedDateTime.time}</div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: themeColors.button, 
              color: '#FFFFFF' 
            }}
            onClick={handleSubmit}
            disabled={!customerDetails.customerName || !customerDetails.customerEmail}
          >
            Conferma prenotazione
          </button>
        </div>
      </div>
    );
  };

  // Render current step
  switch (currentStep) {
    case 'service_selection':
      return <ServiceSelectionStep />;
    case 'datetime_selection':
      return <DateTimeSelectionStep />;
    case 'customer_details':
      return <CustomerDetailsStep />;
    default:
      return <ServiceSelectionStep />;
  }
}
