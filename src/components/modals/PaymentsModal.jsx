// components/modals/PaymentsModal.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { ALLOWED_PAYMENT_METHODS } from "@/lib/payment-methods-config";

export default function PaymentsModal({
  show, // Keep the show prop
  onClose,
  businessPaymentMethods,
  isLoading = false, // Add loading prop
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

        {/* OPTIMIZED: Show loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColorText }}></div>
            <span className="ml-3 text-sm" style={{ color: themeColorText }}>Caricamento metodi di pagamento...</span>
          </div>
        ) : businessPaymentMethods && businessPaymentMethods.length > 0 ? (
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
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Telefono: {method.details.phone_number}</p>
                     )}
                     {method.label === 'Cash' && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Pagamento in contanti</p>
                     )}
                     {method.label === 'Card' && (
                       <p className="text-sm" style={{ color: themeColorText + 'C0' }}>Pagamento con carta</p>
                     )}
                   </div>

                   {/* Copy button for bank transfer IBAN */}
                   {method.label === 'Bank Transfer' && method.details.iban && (
                     <button
                       onClick={() => handleCopy(method.details.iban, 'IBAN copiato negli appunti!')}
                       className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                       style={{ color: themeColorText }}
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                       </svg>
                     </button>
                   )}
                 </div>
               );
             })}
           </div>
         ) : (
           <div className="text-center py-8">
             <p className="text-sm" style={{ color: themeColorText + '80' }}>Nessun metodo di pagamento disponibile</p>
           </div>
         )}
       </div>
     </div>
   );
 }