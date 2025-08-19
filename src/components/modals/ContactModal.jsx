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
      className={`contact-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end lg:items-center justify-center ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="contact-modal-content w-full max-w-[500px] px-4 lg:px-6 py-6 lg:py-6 rounded-t-[2rem] lg:rounded-b-[2rem] shadow-lg relative text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: themeColorBackground,
          color: themeColorText,
        }}
      >
        <button
          onClick={onClose}
          className="contact-modal-close absolute top-6 right-6 w-8 h-8 flex items-center justify-center focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
          style={{ color: themeColorText }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        {businessSettings.show_btn_phone && phones.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-normal mb-3" style={{ color: themeColorText }}>
              Telefoni
            </h3>
            {phones.map((phone, index) => {
              const whatsappLink = createWhatsAppLink(phone.value || '');
              
              return (
                                <div key={index} className="contacts-card relative py-4 px-4 border rounded-lg mb-3" style={{ borderColor: themeColorText + '30' }}>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Image src="/icons/iconsax/phone.svg" width={24} height={24} alt="Phone" className="md:hidden" />
                    <Image src="/icons/iconsax/phone.svg" width={32} height={32} alt="Phone" className="hidden md:block" />
                  </div>
                  <div className="text-center pl-6">
                    {phone.title && (
                      <p className="text-sm font-medium mb-1" style={{ color: themeColorText + '80' }}>
                        {phone.title}
                      </p>
                    )}
                    <p className="text-2xl font-medium mb-1" style={{ color: themeColorText }}>
                      {phone.value || 'Telefono non disponibile'}
                    </p>
                    {phone.value && (
                      <div className="flex gap-1 md:gap-2 lg:gap-2 justify-center">
                        <a
                          href={`tel:${phone.value}`}
                          className="button btn-sm call-button px-2 md:px-3 py-1 md:py-1.5 lg:py-1.5 rounded-lg text-xs md:text-sm inline-flex items-center gap-1 md:gap-2 whitespace-nowrap border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: themeColorText }}
                        >
                          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(45, 205, 82)' }}>
                            <svg className="w-2 h-2 md:w-3 md:h-3" fill="white" viewBox="0 0 24 24">
                              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                          </div>
                          <span className="hidden lg:inline">Chiama</span>
                        </a>
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button btn-sm whatsapp-button px-2 md:px-3 py-1 md:py-1.5 lg:py-1.5 rounded-lg text-xs md:text-sm inline-flex items-center gap-1 md:gap-2 whitespace-nowrap border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: themeColorText }}
                        >
                          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25d366' }}>
                            <svg className="w-2 h-2 md:w-3 md:h-3" fill="white" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                          </div>
                          <span className="hidden lg:inline">WhatsApp</span>
                        </a>
                        <button
                          className="button btn-sm copy-button px-2 md:px-3 py-1 md:py-1.5 lg:py-1.5 rounded-lg text-xs md:text-sm inline-flex items-center gap-1 md:gap-2 whitespace-nowrap border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: themeColorText }}
                          onClick={() => handleCopy(phone.value, 'Telefono Copiato!')}
                        >
                          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6c757d' }}>
                            <svg className="w-2 h-2 md:w-3 md:h-3" fill="white" viewBox="0 0 24 24">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                          </div>
                          <span className="hidden lg:inline">Copia</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {businessSettings.show_btn_email && emails.length > 0 && (
          <div className="mt-2">
            <h3 className="text-sm font-normal mb-3" style={{ color: themeColorText }}>
              Email
            </h3>
            {emails.map((email, index) => (
              <div key={index} className="contacts-card relative py-4 px-4 border rounded-lg mb-3" style={{ borderColor: themeColorText + '30' }}>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Image src="/icons/iconsax/email.svg" width={24} height={24} alt="Email" className="md:hidden" />
                  <Image src="/icons/iconsax/email.svg" width={32} height={32} alt="Email" className="hidden md:block" />
                </div>
                <div className="text-center pl-6">
                  {email.title && (
                    <p className="text-sm font-medium mb-1" style={{ color: themeColorText + '80' }}>
                      {email.title}
                    </p>
                  )}
                  <p className="text-base lg:text-lg font-medium break-all md:text-2xl mb-1" style={{ color: themeColorText }}>
                    {email.value || 'Email non disponibile'}
                  </p>
                  {email.value && (
                    <div className="flex gap-1 md:gap-2 lg:gap-2 justify-center">
                      <a
                        href={`mailto:${email.value}`}
                        className="button btn-sm email-button px-2 md:px-3 py-1 md:py-1.5 lg:py-1.5 rounded-lg text-xs md:text-sm inline-flex items-center gap-1 md:gap-2 whitespace-nowrap border border-gray-200 hover:bg-gray-50 transition-colors"
                        style={{ color: themeColorText }}
                      >
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(15, 107, 255)' }}>
                          <svg className="w-2 h-2 md:w-3 md:h-3" fill="white" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                          </svg>
                        </div>
                        <span className="hidden lg:inline">Invia Email</span>
                      </a>
                      <button
                        className="button btn-sm copy-button px-2 md:px-3 py-1 md:py-1.5 lg:py-1.5 rounded-lg text-xs md:text-sm inline-flex items-center gap-1 md:gap-2 whitespace-nowrap border border-gray-200 hover:bg-gray-50 transition-colors"
                        style={{ color: themeColorText }}
                        onClick={() => handleCopy(email.value, 'Email Copiata!')}
                      >
                        <div className="w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#6c757d' }}>
                          <svg className="w-2 h-2 md:w-3 md:h-3" fill="white" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                          </svg>
                        </div>
                        <span className="hidden lg:inline">Copia Email</span>
                      </button>
                    </div>
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