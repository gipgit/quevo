"use client";

import React, { useState } from 'react';
import ServiceDetailsModal from '@/components/ServiceDetailsModal';

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
}

interface AIChatServicesProps {
  data: {
    type: 'services';
    services: Service[];
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  businessPublicUuid: string;
  onServiceSelect: (service: Service) => void;
}

export default function AIChatServices({ data, themeColors, businessPublicUuid, onServiceSelect }: AIChatServicesProps) {
  const [modalService, setModalService] = useState<Service | null>(null);

  const openModal = (service: Service) => {
    setModalService(service);
  };

  const closeModal = () => {
    setModalService(null);
  };

  const handleRequestClick = (service: Service) => {
    onServiceSelect(service);
  };

  const truncateDescription = (description: string, maxLength: number = 30) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

    return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-4 w-full">
        {data.services.map((service) => (
          <div
            key={service.service_id}
            className="p-4 rounded-lg border transition-all hover:shadow-md w-full"
            style={{
              backgroundColor: themeColors.text + '05',
              borderColor: themeColors.text + '20'
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-2">{service.service_name}</div>
                {service.description && (
                  <div className="text-xs opacity-70 mb-2">
                    {truncateDescription(service.description)}
                  </div>
                )}
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
                  onClick={() => handleRequestClick(service)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                  style={{
                    backgroundColor: themeColors.button,
                    color: '#ffffff'
                  }}
                >
                  Richiedi
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={modalService}
        businessPublicUuid={businessPublicUuid}
        themeColors={themeColors}
        onClose={closeModal}
        onAction={handleRequestClick}
        actionButtonText="Richiedi"
      />
    </div>
  );
}
