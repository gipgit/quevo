// components/modals/ContactModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { parseContacts, hasValidContacts, createWhatsAppLink } from '@/lib/utils/contacts';

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

  const phones = parseContacts(businessData.business_phone);
  const emails = parseContacts(businessData.business_email);

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

        {businessSettings.show_btn_phone && phones.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: themeColorText }}>
              Telefoni
            </h3>
            {phones.map((phone, index) => {
              const whatsappLink = createWhatsAppLink(phone.value || '');
              
              return (
                <div key={index} className="contacts-card relative py-4 px-4 border rounded-lg mb-3 flex items-center gap-4" style={{ borderColor: themeColorText + '30' }}>
            <div>
                    <Image src="/icons/iconsax/phone.svg" width={32} height={32} alt="Phone" />
            </div>
            <div className="flex-grow">
                    {phone.title && (
                      <p className="text-sm font-medium mb-1" style={{ color: themeColorText + '80' }}>
                        {phone.title}
                      </p>
                    )}
                    <p className="text-lg" style={{ color: themeColorText }}>
                      {phone.value || 'Telefono non disponibile'}
                    </p>
            </div>
                  <div className="flex flex-col gap-1">
                    {phone.value && (
                <>
                  <a
                          href={`tel:${phone.value}`}
                          className="button btn-sm call-button px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    Chiama
                  </a>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                          className="button btn-sm whatsapp-button px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    WhatsApp
                  </a>
                </>
              )}
            </div>
                </div>
              );
            })}
          </div>
        )}

        {businessSettings.show_btn_email && emails.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: themeColorText }}>
              Email
            </h3>
            {emails.map((email, index) => (
              <div key={index} className="contacts-card relative py-4 px-4 border rounded-lg mb-3 flex items-center gap-4" style={{ borderColor: themeColorText + '30' }}>
            <div>
                  <Image src="/icons/iconsax/email.svg" width={32} height={32} alt="Email" />
            </div>
            <div className="flex-grow">
                  {email.title && (
                    <p className="text-sm font-medium mb-1" style={{ color: themeColorText + '80' }}>
                      {email.title}
                    </p>
                  )}
                  <p className="text-sm lg:text-md break-all" style={{ color: themeColorText }}>
                    {email.value || 'Email non disponibile'}
                  </p>
            </div>
                <div className="flex flex-col gap-1">
                  {email.value && (
                <>
                  <a
                        href={`mailto:${email.value}`}
                        className="button btn-sm email-button px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                  >
                    Invia Email
                  </a>
                  <button
                        className="button btn-sm copy-button px-3 py-1 rounded text-xs"
                    style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                        onClick={() => handleCopy(email.value, 'Email Copiata!')}
                  >
                    Copia Email
                  </button>
                </>
              )}
            </div>
              </div>
            ))}
          </div>
        )}

        {(!phones.length && !emails.length) && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: themeColorText + 'A0' }}>
              Nessun contatto disponibile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}