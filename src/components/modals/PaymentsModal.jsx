// components/modals/PaymentsModal.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { ALLOWED_PAYMENT_METHODS } from "@/lib/payment-methods-config";

export default function PaymentsModal({
  show, // Keep the show prop
  onClose,
  businessPaymentMethods,
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

  return (
    // Apply the 'active' class based on the 'show' prop
    <div
      id="paymentsModalOverlay"
      className={`payments-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="payments-modal-content w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: themeColorBackground,
          color: themeColorText,
        }}
      >
        <button
          onClick={onClose}
          className="payments-modal-close absolute top-6 right-6 w-8 h-8 flex items-center justify-center focus:outline-none hover:bg-gray-100 rounded-full transition-colors"
          style={{ color: themeColorText }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <p className="text-md font-bold mb-2" style={{ color: themeColorText }}>Modalità di Pagamento</p>

        {businessPaymentMethods && businessPaymentMethods.length > 0 ? (
          <div className="flex flex-col gap-3">
            {businessPaymentMethods.map((method, index) => {
              // Find iconPath from config by label or id
              const config = ALLOWED_PAYMENT_METHODS.find(
                (pm) =>
                  pm.name.toLowerCase() === method.label?.toLowerCase() ||
                  pm.id === method.id
              );
              const iconPath = config?.iconPath;
              return (
                <div key={index} className="payments-card relative py-8 px-4 border rounded-lg" style={{ borderColor: themeColorText + '30' }}>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {iconPath && (
                      <>
                        <Image src={iconPath} width={24} height={24} alt={`${method.label} Icon`} className="md:hidden" />
                        <Image src={iconPath} width={36} height={36} alt={`${method.label} Icon`} className="hidden md:block" />
                      </>
                    )}
                  </div>

                                     <div className="text-center pl-6 flex flex-col gap-1">
                     <p className="text-md font-semibold" style={{ color: themeColorText }}>{method.label}</p>

                     {method.label === 'PayPal' && method.details.paypal_email && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Email: {method.details.paypal_email}</p>
                     )}
                     {method.label === 'Bank Transfer' && (
                       <>
                         {method.details.iban && <p className="text-sm" style={{ color: themeColorText + 'C0' }}>IBAN: <span id="ibanValue">{method.details.iban}</span></p>}
                         {method.details.account_holder && <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Beneficiario: {method.details.account_holder}</p>}
                         {method.details.bank_name && <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Banca: {method.details.bank_name}</p>}
                       </>
                     )}
                     {method.label === 'Satispay' && method.details.phone_number && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Numero di telefono: {method.details.phone_number}</p>
                     )}
                     {method.label === 'Klarna' && method.details.merchant_id && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Klarna (ID Commerciante: {method.details.merchant_id})</p>
                     )}
                     {method.label === 'Stripe' && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Accetta pagamenti online tramite Stripe.</p>
                     )}
                     {method.label === 'Cash' && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Pagamento in contanti alla consegna/servizio.</p>
                     )}
                     {Object.keys(method.details).length > 0 && !['PayPal', 'Bank Transfer', 'Klarna', 'Satispay', 'Stripe', 'Cash'].includes(method.label) && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Dettagli: {JSON.stringify(method.details)}</p>
                     )}
                     

                     {/* Action Buttons */}
                     {(method.label === 'PayPal' && method.details.paypal_email) ||
                      (method.label === 'Bank Transfer' && method.details.iban) ||
                      (method.label === 'Satispay' && method.details.phone_number) ? (
                       <div className="flex gap-2 mt-3 justify-center">
                      {method.label === 'PayPal' && method.details.paypal_email && (
                        <>
                          <a
                            href={`mailto:${method.details.paypal_email}?subject=Pagamento`}
                            className="button btn-sm paypal-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                            style={{ backgroundColor: 'rgb(15, 107, 255)', color: '#fff' }}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Invia Pagamento
                          </a>
                          <button
                            className="button btn-sm copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                            style={{ backgroundColor: '#6c757d', color: '#fff' }}
                            onClick={() => handleCopy(method.details.paypal_email, 'Email Copiata!')}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            Copia Email
                          </button>
                        </>
                      )}
                      {method.label === 'Bank Transfer' && method.details.iban && (
                        <>
                          <button
                            className="button btn-sm iban-copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                            style={{ backgroundColor: '#6c757d', color: '#fff' }}
                            onClick={() => handleCopy(method.details.iban, 'IBAN Copiato!')}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            Copia IBAN
                          </button>
                          {method.details.account_holder && (
                            <button
                              className="button btn-sm account-holder-copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                              style={{ backgroundColor: '#6c757d', color: '#fff' }}
                              onClick={() => handleCopy(method.details.account_holder, 'Beneficiario Copiato!')}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                              </svg>
                              Copia Beneficiario
                            </button>
                          )}
                        </>
                      )}
                      {method.label === 'Satispay' && method.details.phone_number && (
                        <button
                          className="button btn-sm copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1 whitespace-nowrap"
                          style={{ backgroundColor: '#6c757d', color: '#fff' }}
                          onClick={() => handleCopy(method.details.phone_number, 'Numero Copiato!')}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                          </svg>
                          Copia Numero
                        </button>
                                             )}
                     </div>
                   ) : null}
                   </div>
                 </div>
               );
             })}
           </div>
        ) : (
          <p className="text-gray-600" style={{ color: themeColorText + 'A0' }}>Nessun metodo di pagamento disponibile per questa attività.</p>
        )}
      </div>
    </div>
  );
}