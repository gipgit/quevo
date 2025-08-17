"use client";

import React from 'react';

interface ServiceItem {
  service_item_id: number;
  item_name: string;
  item_description: string;
  price_base: number;
  price_type: string;
  price_unit: string;
  display_order: number;
  is_active: boolean;
}

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
  service_id: number;
  service_name: string;
  description: string;
  price_base: number;
  duration_minutes: number;
  quotation_available: boolean;
  date_selection: boolean;
  serviceitem?: ServiceItem[];
  serviceevent?: ServiceEvent[];
}

interface ServiceDetailsModalProps {
  service: Service | null;
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  onClose: () => void;
  onAction: (service: Service) => void;
  actionButtonText: string;
}

export default function ServiceDetailsModal({ 
  service, 
  themeColors, 
  onClose, 
  onAction, 
  actionButtonText 
}: ServiceDetailsModalProps) {
  if (!service) return null;

  const handleAction = () => {
    onAction(service);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.background }}
      >
        <div className="p-6">
          {/* Service Image Placeholder */}
          <div className="w-full h-32 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: themeColors.text + '10' }}>
            <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color: themeColors.text }}>
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>

          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-xl" style={{ color: themeColors.text }}>
              {service.service_name}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full transition-colors"
              style={{
                backgroundColor: themeColors.text + '10',
                color: themeColors.text
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {service.description && (
              <div>
                <h4 className="font-medium text-xs mb-1 opacity-60" style={{ color: themeColors.text }}>Descrizione</h4>
                <p className="text-sm opacity-70" style={{ color: themeColors.text }}>{service.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-xs mb-1 opacity-60" style={{ color: themeColors.text }}>Prezzo base</h4>
                <p className="text-sm opacity-70" style={{ color: themeColors.text }}>€{service.price_base || 0}</p>
              </div>
              {service.duration_minutes && (
                <div>
                  <h4 className="font-medium text-xs mb-1 opacity-60" style={{ color: themeColors.text }}>Durata</h4>
                  <p className="text-sm opacity-70" style={{ color: themeColors.text }}>{service.duration_minutes} minuti</p>
                </div>
              )}
            </div>

            {service.serviceitem && service.serviceitem.length > 0 && (
              <div>
                <h4 className="font-medium text-xs mb-2 opacity-60" style={{ color: themeColors.text }}>Elementi disponibili</h4>
                <div className="flex flex-wrap gap-2">
                  {service.serviceitem.map((item) => (
                    <div 
                      key={item.service_item_id}
                      className="px-3 py-1 rounded-full text-xs border"
                      style={{
                        backgroundColor: themeColors.text + '08',
                        borderColor: themeColors.text + '20',
                        color: themeColors.text
                      }}
                    >
                      {item.item_name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {service.serviceevent && service.serviceevent.length > 0 && (
              <div>
                <h4 className="font-medium text-xs mb-2 opacity-60" style={{ color: themeColors.text }}>Eventi disponibili</h4>
                <div className="flex flex-wrap gap-2">
                  {service.serviceevent.map((event) => (
                    <div 
                      key={event.event_id}
                      className="px-3 py-1 rounded-full text-xs border"
                      style={{
                        backgroundColor: themeColors.text + '08',
                        borderColor: themeColors.text + '20',
                        color: themeColors.text
                      }}
                    >
                      {event.event_name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg border transition-colors"
              style={{
                backgroundColor: themeColors.text + '05',
                color: themeColors.text,
                borderColor: themeColors.text + '20'
              }}
            >
              Chiudi
            </button>
            <button
              onClick={handleAction}
              className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeColors.button,
                color: '#ffffff'
              }}
            >
              {actionButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
