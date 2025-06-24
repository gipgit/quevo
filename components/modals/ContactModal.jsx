// components/modals/ContactModal.jsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ContactModal({ show, onClose, businessData, businessSettings, activeTab }) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  if (!show) {
    return null;
  }

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

  return (
    <div
      id="contactModalOverlay"
      className={`contact-modal-overlay fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 ${show ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="contact-modal-content bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="contact-modal-close absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none">&times;</button>

        {businessSettings.show_btn_phone && (
          <div id="phoneContactSection" className="contacts-card p-4 border rounded-lg mb-4 flex items-center gap-4">
            <div><Image src="/icons/phone.svg" width={24} height={24} alt="Phone" /></div>
            <div className="flex-grow">
              {businessData.business_phone ? (
                <p className="text-lg">{businessData.business_phone}</p>
              ) : (
                <p className="text-sm text-black-400">Telefono non disponibile.</p>
              )}
            </div>
            <div className="contacts-card-buttons flex flex-col gap-2">
              {businessData.business_phone && (
                <>
                  <a href={`tel:${formattedPhoneNumber}`} className="button btn-sm call-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Chiama</a>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="button btn-sm whatsapp-button bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">WhatsApp</a>
                </>
              )}
            </div>
          </div>
        )}

        {businessSettings.show_btn_email && (
          <div id="emailContactSection" className="contacts-card p-4 border rounded-lg mb-4 flex items-center gap-4">
            <div><Image src="/icons/email.svg" width={24} height={24} alt="Email" /></div>
            <div className="flex-grow">
              {businessData.business_email ? (
                <p id="modalEmailAddress" className="text-sm lg:text-md break-all">{businessData.business_email}</p>
              ) : (
                <p className="text-sm text-black-400">Email non disponibile.</p>
              )}
            </div>
            <div className="contacts-card-buttons flex flex-col gap-2">
              {businessData.business_email && (
                <>
                  <a href={`mailto:${businessData.business_email}`} className="button btn-sm email-button bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600">Invia Email</a>
                  <button className="button btn-sm copy-button bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300" onClick={() => handleCopy(businessData.business_email, 'Email Copiata!')}>Copia Email</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}