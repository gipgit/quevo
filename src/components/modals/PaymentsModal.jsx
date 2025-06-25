// components/modals/PaymentsModal.jsx
"use client";

import React from 'react';
import Image from 'next/image';

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
      className={`payments-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 ${show ? 'active' : ''}`}
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
          className="payments-modal-close absolute top-4 right-4 text-2xl font-bold focus:outline-none"
          style={{ color: themeColorText }}
        >
          &times;
        </button>

        <p className="text-md font-bold mb-2" style={{ color: themeColorText }}>Modalità di Pagamento</p>

        {businessPaymentMethods && businessPaymentMethods.length > 0 ? (
          <div className="flex flex-col gap-3">
            {businessPaymentMethods.map((method, index) => (
              <div key={index} className="payments-card p-4 border rounded-lg flex items-center gap-4" style={{ borderColor: themeColorText + '30' }}>
                <div>
                  {method.icon && (
                    <Image src={method.icon} width={24} height={24} alt={`${method.label} Icon`} />
                  )}
                </div>

                <div className="flex-grow">
                  <p className="text-md font-semibold mb-1" style={{ color: themeColorText }}>{method.label}</p>

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
                  {Object.keys(method.details).length === 0 && !['Stripe', 'Cash'].includes(method.label) && (
                    <p className="text-sm" style={{ color: themeColorText + 'C0' }}></p>
                  )}
                </div>

                <div className="payments-card-buttons flex flex-col gap-2">
                  {method.label === 'PayPal' && method.details.paypal_email && (
                    <>
                      <a
                        href={`mailto:${method.details.paypal_email}?subject=Pagamento`}
                        className="button btn-sm paypal-button px-3 py-1 rounded text-center"
                        style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                      >
                        Invia Pagamento
                      </a>
                      <button
                        className="button btn-sm copy-button px-3 py-1 rounded"
                        style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                        onClick={() => handleCopy(method.details.paypal_email, 'Email Copiata!')}
                      >
                        Copia Email
                      </button>
                    </>
                  )}
                  {method.label === 'Bank Transfer' && method.details.iban && (
                    <button
                      className="button btn-sm iban-copy-button px-3 py-1 rounded"
                      style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                      onClick={() => handleCopy(method.details.iban, 'IBAN Copiato!')}
                    >
                      Copia IBAN
                    </button>
                  )}
                  {method.label === 'Satispay' && method.details.phone_number && (
                    <button
                      className="button btn-sm copy-button px-3 py-1 rounded"
                      style={{ backgroundColor: themeColorButton, color: buttonTextColor }}
                      onClick={() => handleCopy(method.details.phone_number, 'Numero Copiato!')}
                    >
                      Copia Numero
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600" style={{ color: themeColorText + 'A0' }}>Nessun metodo di pagamento disponibile per questa attività.</p>
        )}
      </div>
    </div>
  );
}