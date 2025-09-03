"use client";

import React from 'react';
import ServiceImageDisplay from '@/components/service/ServiceImageDisplay';

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
  service_id: string;
  service_name: string;
  description: string;
  price_base: number;
  duration_minutes: number;
  active_quotation: boolean;
  active_booking: boolean;
  demo: boolean | null;
  has_image: boolean | null;
  serviceitem?: ServiceItem[];
  serviceevent?: ServiceEvent[];
}

interface ServiceDetailsModalProps {
  service: Service | null;
  businessPublicUuid: string;
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
  businessPublicUuid,
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
          {/* Service Image */}
          <div className="w-full h-32 rounded-lg mb-4 overflow-hidden">
            <ServiceImageDisplay
              serviceId={service.service_id}
              serviceName={service.service_name}
              demo={service.demo}
              hasImage={service.has_image}
              businessPublicUuid={businessPublicUuid}
              className="w-full h-32"
              showDemoBadge={false}
            />
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
