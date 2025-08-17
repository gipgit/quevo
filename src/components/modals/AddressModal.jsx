// components/modals/AddressModal.jsx
"use client";

import React from 'react';
import Image from 'next/image';

export default function AddressModal({
  show,
  onClose,
  businessData,
  businessSettings,
  themeColorText,
  themeColorBackground,
  themeColorButton,
  isDarkBackground
}) {
  const handleCopy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il testo.');
    }
  };

  const getButtonTextColor = (bgColor) => {
    if (!bgColor) return 'white';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  const buttonTextColor = getButtonTextColor(themeColorButton);

  // Create navigation URLs
  const createNavigationUrl = (provider) => {
    const address = `${businessData.business_address}, ${businessData.business_city}`;
    const encodedAddress = encodeURIComponent(address);
    
    switch (provider) {
      case 'google':
        return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      case 'waze':
        return `https://waze.com/ul?q=${encodedAddress}`;
      default:
        return '';
    }
  };

  const fullAddress = `${businessData.business_address}, ${businessData.business_city}`;

  return (
    <div
      id="addressModalOverlay"
      className={`address-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end lg:items-center justify-center ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="address-modal-content w-full max-w-[500px] px-4 lg:px-6 py-6 lg:py-6 rounded-t-[2rem] lg:rounded-b-[2rem] shadow-lg relative text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: themeColorBackground,
          color: themeColorText,
        }}
      >
        <button
          onClick={onClose}
          className="address-modal-close absolute top-6 right-6 w-8 h-8 flex items-center justify-center focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
          style={{ color: themeColorText }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {businessSettings.show_address && businessData.business_address && (
          <div className="mt-2">
            <h3 className="text-sm font-normal mb-3" style={{ color: themeColorText }}>
              Indirizzo
            </h3>
            <div className="contacts-card relative py-4 px-4 border rounded-lg mb-3" style={{ borderColor: themeColorText + '30' }}>
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Image src="/icons/iconsax/location.svg" width={24} height={24} alt="Location" className="md:hidden" />
                <Image src="/icons/iconsax/location.svg" width={32} height={32} alt="Location" className="hidden md:block" />
              </div>
              <div className="text-center pl-6">
                <p className="text-base lg:text-lg font-medium break-words md:text-2xl" style={{ color: themeColorText }}>
                  {fullAddress}
                </p>
                <div className="flex gap-1 md:gap-2 mt-1 justify-center">
                  <a
                    href={createNavigationUrl('google')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button btn-sm google-maps-button px-2 md:px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                    style={{ backgroundColor: '#4285f4', color: '#fff' }}
                  >
                    <Image
                      src="/icons/appointments/googlemaps.svg"
                      alt="Google Maps"
                      width={12}
                      height={12}
                    />
                    Google Maps
                  </a>
                  <a
                    href={createNavigationUrl('waze')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button btn-sm waze-button px-2 md:px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                    style={{ backgroundColor: '#33ccff', color: '#fff' }}
                  >
                    <Image
                      src="/icons/appointments/waze.svg"
                      alt="Waze"
                      width={12}
                      height={12}
                    />
                    Waze
                  </a>
                  <button
                    className="button btn-sm copy-button px-2 md:px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                    style={{ backgroundColor: '#6c757d', color: '#fff' }}
                    onClick={() => handleCopy(fullAddress, 'Indirizzo Copiato!')}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copia
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(!businessSettings.show_address || !businessData.business_address) && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: themeColorText + 'A0' }}>
              Indirizzo non disponibile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
