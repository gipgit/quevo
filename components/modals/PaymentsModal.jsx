// components/modals/PaymentsModal.jsx
import React from 'react';
import Image from 'next/image';

export default function PaymentsModal({ show, onClose, businessPaymentMethods }) {
  if (!show) return null;

  const handleCopy = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il testo.');
    }
  };

  return (
    <div
      id="paymentsModalOverlay"
      className={`payments-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="payments-modal-content bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="payments-modal-close absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none">&times;</button>

        <p className="text-md font-bold mb-2">Modalità di Pagamento</p>

        {businessPaymentMethods && businessPaymentMethods.length > 0 ? (
          <div className="flex flex-col gap-3">
            {businessPaymentMethods.map((method, index) => (
              <div key={index} className="payments-card p-4 border rounded-lg flex items-center gap-4">
                {/* Payment Method Icon */}
                <div>
                  {method.icon && (
                    <Image src={method.icon} width={24} height={24} alt={`${method.label} Icon`} />
                  )}
                </div>
                
                <div className="flex-grow">
                  {/* Display the Payment Method Name */}
                  <p className="text-md font-semibold text-gray-800 mb-1">{method.label}</p>

                  {/* Specific details based on method.label */}
                  {method.label === 'PayPal' && method.details.paypal_email && (
                    <p className="text-sm text-gray-600">Email: {method.details.paypal_email}</p>
                  )}
                  {method.label === 'Bank Transfer' && (
                    <>
                      {method.details.iban && <p className="text-sm text-gray-600">IBAN: <span id="ibanValue">{method.details.iban}</span></p>}
                      {method.details.account_holder && <p className="text-sm text-gray-600">Beneficiario: {method.details.account_holder}</p>}
                      {method.details.bank_name && <p className="text-sm text-gray-600">Banca: {method.details.bank_name}</p>}
                    </>
                  )}
                  {method.label === 'Satispay' && method.details.phone_number && (
                    <p className="text-sm text-gray-600">Numero di telefono: {method.details.phone_number}</p>
                  )}
                  {method.label === 'Klarna' && method.details.merchant_id && (
                    <p className="text-sm text-gray-600">Klarna (ID Commerciante: {method.details.merchant_id})</p>
                  )}
                  {method.label === 'Stripe' && (
                    <p className="text-sm text-gray-600">Accetta pagamenti online tramite Stripe.</p>
                  )}
                  {method.label === 'Cash' && (
                    <p className="text-sm text-gray-600">Pagamento in contanti alla consegna/servizio.</p>
                  )}
                  {/* Fallback for other methods with details not specifically handled, or if no details */}
                  {Object.keys(method.details).length > 0 && !['PayPal', 'Bank Transfer', 'Klarna', 'Satispay', 'Stripe', 'Cash'].includes(method.label) && (
                    <p className="text-sm text-gray-600">Dettagli: {JSON.stringify(method.details)}</p>
                  )}
                  {Object.keys(method.details).length === 0 && !['Stripe', 'Cash'].includes(method.label) && (
                    <p className="text-sm text-gray-600"></p>
                  )}
                </div>

                {/* Buttons for copying/sending */}
                <div className="payments-card-buttons flex flex-col gap-2">
                  {method.label === 'PayPal' && method.details.paypal_email && (
                    <>
                      <a href={`mailto:${method.details.paypal_email}?subject=Pagamento`} className="button btn-sm paypal-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-center">Invia Pagamento</a>
                      <button className="button btn-sm copy-button bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300" onClick={() => handleCopy(method.details.paypal_email, 'Email Copiata!')}>Copia Email</button>
                    </>
                  )}
                  {method.label === 'Bank Transfer' && method.details.iban && (
                    <button className="button btn-sm iban-copy-button bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300" onClick={() => handleCopy(method.details.iban, 'IBAN Copiato!')}>Copia IBAN</button>
                  )}
                  {method.label === 'Satispay' && method.details.phone_number && (
                    <button className="button btn-sm copy-button bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300" onClick={() => handleCopy(method.details.phone_number, 'Numero Copiato!')}>Copia Numero</button>
                  )}
                  {/* Add more buttons for other methods if needed */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nessun metodo di pagamento disponibile per questa attività.</p>
        )}
      </div>
    </div>
  );
}