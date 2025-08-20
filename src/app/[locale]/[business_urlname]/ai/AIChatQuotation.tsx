"use client";

import React, { useState } from 'react';
import ServiceDetailsModal from '@/components/ServiceDetailsModal';

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

interface Service {
  service_id: number;
  service_name: string;
  description: string;
  price_base: number;
  duration_minutes: number;
  available_quotation: boolean;
  available_booking: boolean;
  serviceitem?: ServiceItem[];
}

interface AIChatQuotationProps {
  data: {
    type: 'quotation_service_selection' | 'quotation_items_selection';
    services?: Service[];
    selectedService?: Service;
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  onServiceSelect: (service: Service) => void;
  onBack: () => void;
  onSubmit: (selectedItems: { [key: number]: number }) => void;
}

export default function AIChatQuotation({ data, themeColors, onServiceSelect, onBack, onSubmit }: AIChatQuotationProps) {
  // Use the selectedService from data instead of local state
  const selectedService = data.selectedService;
  const [selectedServiceItems, setSelectedServiceItems] = useState<{ [key: number]: number }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
  const [modalService, setModalService] = useState<Service | null>(null);

  const handleServiceSelect = (service: Service) => {
    onServiceSelect(service);
  };

  const handleQuotationClick = (service: Service) => {
    onServiceSelect(service);
  };

  const openModal = (service: Service) => {
    setModalService(service);
  };

  const closeModal = () => {
    setModalService(null);
  };

  const handleBack = () => {
    setSelectedServiceItems({});
    setExpandedDescriptions({});
    onBack();
  };

  const handleServiceItemToggle = (itemId: number) => {
    setSelectedServiceItems(prev => {
      const newSelection = { ...prev };
      if (newSelection[itemId]) {
        delete newSelection[itemId];
      } else {
        newSelection[itemId] = 1;
      }
      return newSelection;
    });
  };

  const toggleDescription = (itemId: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedServiceItems(prev => {
        const newSelection = { ...prev };
        delete newSelection[itemId];
        return newSelection;
      });
    } else {
      setSelectedServiceItems(prev => ({
        ...prev,
        [itemId]: quantity
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedServiceItems);
  };

  const totalQuotationPrice = Object.entries(selectedServiceItems).reduce((total, [itemId, quantity]) => {
    const item = selectedService?.serviceitem?.find(i => i.service_item_id === parseInt(itemId));
    return total + (item ? item.price_base * quantity : 0);
  }, 0);

  if (selectedService) {
    // Show service items for selected service
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: themeColors.text + '10',
              color: themeColors.text
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="font-semibold text-sm">Elementi per: {selectedService.service_name}</h4>
        </div>

        {!selectedService.serviceitem || selectedService.serviceitem.length === 0 ? (
          <div className="p-4 rounded-lg border text-center" style={{
            backgroundColor: themeColors.text + '05',
            borderColor: themeColors.text + '20'
          }}>
            <p className="text-sm opacity-70">Nessun elemento disponibile per questo servizio.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedService.serviceitem.map((item) => {
              const isSelected = selectedServiceItems[item.service_item_id] > 0;
              const quantity = selectedServiceItems[item.service_item_id] || 0;
              const isDescriptionExpanded = expandedDescriptions[item.service_item_id];

              return (
                <div
                  key={item.service_item_id}
                  className="p-4 rounded-lg border transition-all hover:shadow-md"
                  style={{
                    backgroundColor: themeColors.text + '05',
                    borderColor: isSelected ? themeColors.button : themeColors.text + '20'
                  }}
                >
                  <div className="flex justify-between items-start">
                    {/* Left side: Title, description, price */}
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className="font-semibold text-sm">{item.item_name}</span>
                        {item.item_description && (
                          <button
                            onClick={() => toggleDescription(item.service_item_id)}
                            className="ml-1 p-0.5 rounded-full transition-colors hover:bg-opacity-20 inline-flex items-center"
                            style={{
                              backgroundColor: themeColors.text + '10',
                              color: themeColors.text
                            }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {item.item_description && isDescriptionExpanded && (
                        <div className="text-xs opacity-70 mb-1 leading-relaxed">
                          {item.item_description}
                        </div>
                      )}
                    </div>
                    
                    {/* Right side: Base price, Add button or counter */}
                    <div className="flex items-center gap-2">
                      {!isSelected ? (
                        <>
                          <div className="text-xs sm:text-sm font-medium text-right min-w-[50px] sm:min-w-[60px]">
                            €{item.price_base}
                            {item.price_type === 'per_unit' && item.price_unit && (
                              <span className="text-xs opacity-60 block">per {item.price_unit}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleServiceItemToggle(item.service_item_id)}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm border"
                            style={{
                              backgroundColor: themeColors.text + '05',
                              color: themeColors.text,
                              borderColor: themeColors.text + '20'
                            }}
                          >
                            Aggiungi
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="text-xs sm:text-sm font-medium text-right min-w-[50px] sm:min-w-[60px]">
                            €{(item.price_base * quantity).toFixed(2)}
                            {item.price_type === 'per_unit' && item.price_unit && (
                              <span className="text-xs opacity-60 block">({quantity} {item.price_unit})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                              style={{
                                backgroundColor: themeColors.button,
                                color: '#ffffff'
                              }}
                              onClick={() => handleQuantityChange(item.service_item_id, quantity - 1)}
                            >
                              -
                            </button>
                            <span className="text-xs sm:text-sm font-medium min-w-[20px] sm:min-w-[24px] text-center">
                              {quantity}
                              {item.price_type === 'per_unit' && item.price_unit && (
                                <span className="text-xs opacity-60 ml-1">{item.price_unit}</span>
                              )}
                            </span>
                            <button
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                              style={{
                                backgroundColor: themeColors.button,
                                color: '#ffffff'
                              }}
                              onClick={() => handleQuantityChange(item.service_item_id, quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {Object.keys(selectedServiceItems).length > 0 && (
          <div className="mt-4 p-4 rounded-lg border" style={{
            backgroundColor: themeColors.text + '05',
            borderColor: themeColors.text + '20'
          }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-sm">Totale preventivo:</span>
              <span className="font-bold text-lg">€{totalQuotationPrice.toFixed(2)}</span>
            </div>
            <button
              className="w-full py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeColors.button,
                color: '#ffffff'
              }}
              onClick={handleSubmit}
            >
              Invia Preventivo
            </button>
          </div>
        )}
      </div>
    );
  }

  // Show service selection
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm mb-3">Servizi con preventivo disponibile:</h4>

      <div className="space-y-3">
        {data.services?.filter(service => service.serviceitem && service.serviceitem.length > 0).map((service) => (
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
                  onClick={() => handleQuotationClick(service)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                  style={{
                    backgroundColor: themeColors.button,
                    color: '#ffffff'
                  }}
                >
                  Simula Preventivo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={modalService}
        themeColors={themeColors}
        onClose={closeModal}
        onAction={handleQuotationClick}
        actionButtonText="Simula Preventivo"
      />
    </div>
  );
}
