// components/modals/ContactModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ContactModal({
  show, // Keep the show prop
  onClose,
  businessData,
  businessSettings,
  initialTab,
  themeColorText,
  themeColorBackground,
  themeColorButton,
  isDarkBackground
}) {
  const [currentTab, setCurrentTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // If `show` is false, this component shouldn't even be rendered by the parent,
  // but we can add an extra safety check here if desired. However, for transitions,
  // the component needs to be rendered for the 'active' class to be toggled.

  const handleCopy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il testo.');
    }
  };

  const formattedPhoneNumber = businessData.business_phone ? businessData.business_phone.replace(/\s/g, '') : '';
  const whatsappLink = `https://wa.me/${formattedPhoneNumber}`;

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

  return (
    // Apply the 'active' class based on the 'show' prop
    <div
      id="contactModalOverlay"
      className={`contact-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="contact-modal-content w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: themeColorBackground,
          color: themeColorText,
        }}
      >
        <button
          onClick={onClose}
          className="contact-modal-close absolute top-4 right-4 text-2xl font-bold focus:outline-none"
          style={{ color: themeColorText }}
        >
          &times;
        </button>

        {businessSettings.show_btn_phone && (
          <div id="phoneContactSection" className="contacts-card relative py-8 px-4 border rounded-lg mb-4 flex items-center gap-4" style={{ borderColor: themeColorText + '30' }}>
            <div>
              <Image src="/icons/iconsax/phone.svg" width={24} height={24} alt="Phone" />
            </div>
            <div className="flex-grow">
              {businessData.business_phone ? (
                <p className="text-lg" style={{ color: themeColorText }}>{businessData.business_phone}</p>
              ) : (
                <p className="text-sm" style={{ color: themeColorText + 'A0' }}>Telefono non disponibile.</p>
              )}
            </div>
            <div className="absolute bottom-0 -mb-[10px] right-0 w-full flex flex-row justify-end gap-2">
              {businessData.business_phone && (
                <>
                  <a
                    href={`tel:${formattedPhoneNumber}`}
                    className="button btn-sm call-button px-3 py-1 rounded"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    Chiama
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button btn-sm whatsapp-button px-3 py-1 rounded"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    WhatsApp
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {businessSettings.show_btn_email && (
          <div id="emailContactSection" className="contacts-card relative py-8 px-4 border rounded-lg mb-4 flex items-center gap-4" style={{ borderColor: themeColorText + '30' }}>
            <div>
              <Image src="/icons/iconsax/email.svg" width={24} height={24} alt="Email" />
            </div>
            <div className="flex-grow">
              {businessData.business_email ? (
                <p id="modalEmailAddress" className="text-sm lg:text-md break-all" style={{ color: themeColorText }}>{businessData.business_email}</p>
              ) : (
                <p className="text-sm" style={{ color: themeColorText + 'A0' }}>Email non disponibile.</p>
              )}
            </div>
            <div className="absolute bottom-0 -mb-[10px] right-0 w-full flex flex-row justify-end gap-2">
              {businessData.business_email && (
                <>
                  <a
                    href={`mailto:${businessData.business_email}`}
                    className="button btn-sm email-button px-3 py-1 rounded"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    Invia Email
                  </a>
                  <button
                    className="button btn-sm copy-button px-3 py-1 rounded"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                    onClick={() => handleCopy(businessData.business_email, 'Email Copiata!')}
                  >
                    Copia Email
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}