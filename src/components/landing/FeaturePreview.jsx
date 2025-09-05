// components/landing/FeaturePreview.jsx
'use client';

import { useTranslations } from 'next-intl';

export default function FeaturePreview({ featureType, locale }) {
  const t = useTranslations('Landing');

  const getPreviewContent = () => {
    switch (featureType) {
      case 'serviceRequests':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 border max-w-2xl min-w-[28rem]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Richiesta Servizio</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Attivo</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mario Rossi</p>
                  <p className="text-sm text-gray-500">Richiesta: Consulenza legale</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">Ho bisogno di una consulenza per un contratto di lavoro. Quando possiamo incontrarci?</p>
              </div>
            </div>
          </div>
        );

      case 'appointmentsScheduling':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 border max-w-2xl min-w-[28rem]">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prenotazione Appuntamento</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                  <div key={i} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                  <div key={i} className={`text-center py-2 text-sm rounded ${
                    i === 15 ? 'bg-blue-500 text-white' : 
                    i > 10 && i < 20 ? 'bg-gray-100 text-gray-700' : 
                    'text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">9:00 - 10:00</span>
                    <span className="text-green-600">Disponibile</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">10:00 - 11:00</span>
                    <span className="text-red-600">Occupato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quoteSimulation':
        return (
          <div className="bg-white rounded-lg shadow-lg p-8 border max-w-2xl min-w-[28rem]">
            <div className="space-y-2">
              {/* Service Items Section */}
              <div className="space-y-2">
                {[
                  { id: 1, name: "Consulenza legale", price: 60, unit: "ora", selected: true, quantity: 2 },
                  { id: 2, name: "Analisi documenti", price: 40, unit: "documento", selected: true, quantity: 1 },
                  { id: 3, name: "Redazione contratto", price: 150, unit: "contratto", selected: false, quantity: 0 },
                  { id: 4, name: "Assistenza in tribunale", price: 200, unit: "udienza", selected: true, quantity: 1 },
                  { id: 5, name: "Parere legale scritto", price: 80, unit: "parere", selected: false, quantity: 0 }
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`
                      relative flex flex-row items-center justify-between p-2 rounded-lg border
                      ${item.selected ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l border-gray-200 bg-gray-50'}
                    `}
                  >
                    <div className="text-base flex-1">
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {item.selected 
                            ? `€${(item.price * item.quantity).toFixed(2)}`
                            : `${item.price.toFixed(2)}€ / ${item.unit}`
                          }
                        </p>
                      </div>
                      
                      {!item.selected ? (
                        <div className="px-3 py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-700 bg-gray-100">
                          Add
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="px-2 py-1 rounded-full text-sm font-bold shadow-sm bg-blue-600 text-white">
                            -
                          </div>
                          <span className="font-bold text-center text-xs min-w-[2rem]">
                            {item.quantity} {item.unit}
                          </span>
                          <div className="px-2 py-1 rounded-full text-sm font-bold shadow-sm bg-blue-600 text-white">
                            +
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quotation Summary */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Totale</span>
                  <span className="text-xl font-bold text-blue-600">€280</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Elementi opzionali selezionabili</p>
              </div>
            </div>
          </div>
        );


      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-6 border max-w-2xl min-w-[28rem]">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Seleziona una funzionalità per vedere l'anteprima</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="sticky top-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-10 border border-blue-200 flex justify-center">
        {getPreviewContent()}
      </div>
    </div>
  );
}
