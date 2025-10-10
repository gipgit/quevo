// components/landing/FeaturePreview.jsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function FeaturePreview({ featureType, locale, featureColor }) {
  const t = useTranslations('Landing');

  const getPreviewContent = () => {
    switch (featureType) {
      case 'serviceRequests':
        return <GuidedRequestPreview />;

      case 'appointmentsScheduling':
        return (
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 border max-w-2xl min-w-[20rem] lg:min-w-[28rem]">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Prenotazione Appuntamento</h3>
            <div className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                  <div key={i} className="text-center text-xs lg:text-sm font-medium text-gray-500 py-1 lg:py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                  <div key={i} className={`text-center py-1 lg:py-2 text-xs lg:text-sm rounded ${
                    i === 15 ? 'bg-blue-500 text-white' : 
                    i > 10 && i < 20 ? 'bg-gray-100 text-gray-700' : 
                    'text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 lg:pt-4">
                <div className="space-y-1 lg:space-y-2">
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">9:00 - 10:00</span>
                    <span className="text-green-600">Disponibile</span>
                  </div>
                  <div className="flex justify-between text-xs lg:text-sm">
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
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-8 border max-w-2xl min-w-[20rem] lg:min-w-[28rem]">
            <div className="space-y-1 lg:space-y-2">
              {/* Service Items Section */}
              <div className="space-y-1 lg:space-y-2">
                {[
                  { id: 1, name: "Consulenza legale", price: 60, unit: "ora", selected: true, quantity: 2 },
                  { id: 2, name: "Analisi documenti", price: 40, unit: "documento", selected: true, quantity: 1 },
                  { id: 3, name: "Redazione contratto", price: 150, unit: "contratto", selected: false, quantity: 0 },
                  { id: 4, name: "Assistenza in tribunale", price: 200, unit: "udienza", selected: true, quantity: 1 }
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`
                      relative flex flex-row items-center justify-between p-1.5 lg:p-2 rounded-lg border
                      ${item.selected ? 'border-l-4 border-blue-500 bg-blue-50' : 'border-l border-gray-200 bg-gray-50'}
                    `}
                  >
                    <div className="text-sm lg:text-base flex-1">
                      <p className="text-xs lg:text-sm font-medium leading-none">{item.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3">
                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {item.selected 
                            ? `€${(item.price * item.quantity).toFixed(2)}`
                            : `${item.price.toFixed(2)}€ / ${item.unit}`
                          }
                        </p>
                      </div>
                      
                      {!item.selected ? (
                        <div className="px-2 py-1 lg:px-3 lg:py-1 rounded-md text-xs font-medium border border-gray-300 text-gray-700 bg-gray-100">
                          Add
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <div className="px-1.5 py-1 lg:px-2 lg:py-1 rounded-full text-xs lg:text-sm font-bold shadow-sm bg-blue-600 text-white">
                            -
                          </div>
                          <span className="font-bold text-center text-xs min-w-[1.5rem] lg:min-w-[2rem]">
                            {item.quantity} {item.unit}
                          </span>
                          <div className="px-1.5 py-1 lg:px-2 lg:py-1 rounded-full text-xs lg:text-sm font-bold shadow-sm bg-blue-600 text-white">
                            +
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quotation Summary */}
              <div className="border-t pt-2 lg:pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm lg:text-base font-semibold text-gray-900">Totale</span>
                  <span className="text-lg lg:text-xl font-bold text-blue-600">€280</span>
                </div>
              </div>
            </div>
          </div>
        );


      default:
        return (
          <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6 border max-w-2xl min-w-[20rem] lg:min-w-[28rem]">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm lg:text-base">Seleziona una funzionalità per vedere l'anteprima</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="sticky top-8">
      <div 
        className="rounded-3xl p-4 lg:p-10 border flex justify-center transition-all duration-300 ease-linear"
        style={featureColor ? {
          background: `linear-gradient(to bottom right, #000000, ${featureColor.primary})`,
          borderColor: featureColor.primary
        } : {
          background: 'linear-gradient(to bottom right, #000000, #9CA3AF)',
          borderColor: '#9CA3AF'
        }}
      >
        {getPreviewContent()}
      </div>
    </div>
  );
}

// Guided Request Preview Component
function GuidedRequestPreview() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    { id: 'overview', name: 'Overview', label: 'Overview' },
    { id: 'extras', name: 'Extras', label: 'Extras' },
    { id: 'items', name: 'Items', label: 'Items' },
    { id: 'datetime', name: 'DateTime', label: 'Date & Time' },
    { id: 'questions', name: 'Questions', label: 'Questions' },
    { id: 'requirements', name: 'Requirements', label: 'Requirements' },
    { id: 'details', name: 'Details', label: 'Details' }
  ];

  // Auto-advance through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [steps.length]);

  // Function to determine if skip button should be shown
  const shouldShowSkipButton = () => {
    const currentStepId = steps[currentStep]?.id;
    return ['extras', 'items', 'datetime'].includes(currentStepId);
  };

  const getStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'overview':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">Consulenza Legale</h3>
            <p className="text-xs lg:text-sm text-gray-600 leading-relaxed mb-3 lg:mb-4">
              Servizio di consulenza legale specializzato in diritto del lavoro. 
              Analisi approfondita dei contratti e assistenza nella risoluzione di controversie.
            </p>
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-600">Prezzo base:</span>
                <span className="font-semibold text-gray-900">€80.00</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm">
                <span className="text-gray-600">Durata:</span>
                <span className="text-gray-900">60 minuti</span>
              </div>
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">Servizi Aggiuntivi</h3>
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex items-center justify-between p-1.5 lg:p-2 border rounded-lg">
                <div className="flex items-center space-x-1.5 lg:space-x-2 flex-1">
                  <input type="checkbox" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 flex-shrink-0" defaultChecked />
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-900">Analisi documenti</p>
                    <p className="text-xs text-gray-500">Revisione completa dei contratti</p>
                  </div>
                </div>
                <span className="text-xs lg:text-sm font-semibold text-gray-900 flex-shrink-0">€25.00</span>
              </div>
              <div className="flex items-center justify-between p-1.5 lg:p-2 border rounded-lg">
                <div className="flex items-center space-x-1.5 lg:space-x-2 flex-1">
                  <input type="checkbox" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-900">Assistenza telefonica</p>
                    <p className="text-xs text-gray-500">Supporto post-consulenza</p>
                  </div>
                </div>
                <span className="text-xs lg:text-sm font-semibold text-gray-900 flex-shrink-0">€15.00</span>
              </div>
            </div>
          </div>
        );

      case 'items':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">Elementi del Servizio</h3>
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex items-center justify-between p-1.5 lg:p-2 border rounded-lg bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-1.5 lg:space-x-2 flex-1">
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-900">Consulenza base</p>
                    <p className="text-xs text-gray-500">€40.00 per ora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 lg:space-x-2 flex-shrink-0">
                  <button className="w-4 h-4 lg:w-5 lg:h-5 bg-blue-600 text-white rounded-full text-xs">-</button>
                  <span className="text-xs lg:text-sm font-medium">2 ore</span>
                  <button className="w-4 h-4 lg:w-5 lg:h-5 bg-blue-600 text-white rounded-full text-xs">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-1.5 lg:p-2 border rounded-lg">
                <div className="flex items-center space-x-1.5 lg:space-x-2 flex-1">
                  <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 border border-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-900">Redazione contratto</p>
                    <p className="text-xs text-gray-500">€120.00 per contratto</p>
                  </div>
                </div>
                <button className="px-1.5 py-0.5 lg:px-2 lg:py-1 text-xs border border-gray-300 rounded-md text-gray-600 flex-shrink-0">Aggiungi</button>
              </div>
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">Seleziona Data e Ora</h3>
            <div className="grid grid-cols-7 gap-0.5 lg:gap-1 mb-2 lg:mb-3">
              {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500 py-0.5 lg:py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 28 }, (_, i) => (
                <div key={i} className={`text-center py-0.5 lg:py-1 text-xs rounded ${
                  i === 15 ? 'bg-blue-500 text-white' : 
                  i > 10 && i < 20 ? 'bg-gray-100 text-gray-700' : 
                  'text-gray-400'
                }`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs lg:text-sm p-1.5 lg:p-2 bg-blue-50 rounded">
                <span className="text-gray-600">14:00 - 15:00</span>
                <span className="text-green-600 font-medium">Disponibile</span>
              </div>
              <div className="flex justify-between text-xs lg:text-sm p-1.5 lg:p-2">
                <span className="text-gray-600">15:00 - 16:00</span>
                <span className="text-gray-500">Occupato</span>
              </div>
            </div>
          </div>
        );

      case 'questions':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">Domande Aggiuntive</h3>
            <div className="space-y-2 lg:space-y-3">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Qual è la natura del tuo problema legale?
                </label>
                <textarea 
                  className="w-full p-1.5 lg:p-2 border border-gray-300 rounded-lg text-xs lg:text-sm"
                  rows="2"
                  placeholder="Descrivi brevemente la situazione..."
                />
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Hai già documenti da analizzare?
                </label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="radio" name="documents" className="mr-1.5 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="text-xs lg:text-sm text-gray-700">Sì, ho contratti da rivedere</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="documents" className="mr-1.5 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" defaultChecked />
                    <span className="text-xs lg:text-sm text-gray-700">No, partiamo da zero</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'requirements':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">Requisiti del Servizio</h3>
            <div className="space-y-1.5 lg:space-y-2">
              <div className="flex items-start space-x-1.5 lg:space-x-2 p-1.5 lg:p-2 border rounded-lg">
                <input type="checkbox" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 mt-0.5 lg:mt-1 flex-shrink-0" defaultChecked />
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Accetto i termini di servizio</p>
                  <p className="text-xs text-gray-500">Confermo di aver letto e accettato i termini e condizioni</p>
                </div>
              </div>
              <div className="flex items-start space-x-1.5 lg:space-x-2 p-1.5 lg:p-2 border rounded-lg">
                <input type="checkbox" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 mt-0.5 lg:mt-1 flex-shrink-0" defaultChecked />
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Consenso al trattamento dati</p>
                  <p className="text-xs text-gray-500">Autorizzo il trattamento dei miei dati personali</p>
                </div>
              </div>
              <div className="flex items-start space-x-1.5 lg:space-x-2 p-1.5 lg:p-2 border rounded-lg">
                <input type="checkbox" className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-blue-600 mt-0.5 lg:mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">Newsletter</p>
                  <p className="text-xs text-gray-500">Desidero ricevere aggiornamenti e promozioni</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="w-full px-3 lg:px-4 pt-2 pb-4">
            <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-1.5 lg:mb-2">I Tuoi Dettagli</h3>
            <div className="space-y-1.5 lg:space-y-2">
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input 
                  type="text" 
                  className="w-full p-1.5 lg:p-2 border border-gray-300 rounded-lg text-xs lg:text-sm"
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full p-1.5 lg:p-2 border border-gray-300 rounded-lg text-xs lg:text-sm"
                  placeholder="mario.rossi@email.com"
                />
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Telefono</label>
                <input 
                  type="tel" 
                  className="w-full p-1.5 lg:p-2 border border-gray-300 rounded-lg text-xs lg:text-sm"
                  placeholder="+39 123 456 7890"
                />
              </div>
              <div>
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Note aggiuntive</label>
                <textarea 
                  className="w-full p-1.5 lg:p-2 border border-gray-300 rounded-lg text-xs lg:text-sm"
                  rows="2"
                  placeholder="Informazioni aggiuntive..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border max-w-4xl w-full min-w-[20rem] lg:min-w-[32rem] overflow-hidden h-[300px] flex flex-col">
      {/* Modal Header */}
      <div className="flex justify-between items-center p-3 lg:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Mobile Image - Only visible on xs to md screens */}
          <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">Consulenza Legale</h3>
          
          {/* Step Navigation Progress */}
          <div className="flex items-center">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300 ${
                      isActive ? 'scale-125' : isCompleted ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? '#3B82F6' 
                        : isCompleted 
                          ? '#3B82F6' 
                          : '#E5E7EB'
                    }}
                  />
                  {index < steps.length - 1 && (
                    <div 
                      className="h-0.5 w-3 lg:w-4 transition-all duration-300"
                      style={{
                        backgroundColor: index < currentStep ? '#3B82F6' : '#E5E7EB'
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <button className="p-1.5 lg:p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Modal Content - Responsive Layout */}
      <div className="flex flex-1 p-3 lg:p-4 gap-3 lg:gap-4 w-full min-h-0">
        {/* Left Column - Image Placeholder (30%) - Only visible on lg+ screens */}
        <div className="hidden lg:block w-[30%] flex-shrink-0">
          <div className="h-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Right Column - Step Content (70% on lg+, 100% on mobile) */}
        <div className="w-full lg:w-[70%] flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <div className={`w-full transition-all duration-300 ${isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
              {getStepContent()}
            </div>
          </div>
          
          {/* Step Navigation Buttons - Fixed at bottom of right column */}
          <div className="flex justify-between items-center pt-3 lg:pt-4 border-t border-gray-200 flex-shrink-0 bg-white">
            <button className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg text-gray-600 cursor-default">
              Indietro
            </button>
            <div className="flex gap-1.5 lg:gap-2">
              {shouldShowSkipButton() && (
                <button className="px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm border border-gray-300 rounded-lg text-gray-600 cursor-default">
                  Salta
                </button>
              )}
              <button className="px-4 py-1.5 lg:px-6 lg:py-2 text-xs lg:text-sm bg-blue-600 text-white rounded-lg cursor-default">
                Continua
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
