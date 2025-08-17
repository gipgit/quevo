"use client";

import React from 'react';
import { createWhatsAppLink } from '@/lib/utils/contacts';
import AIChatServiceRequest from './AIChatServiceRequest';
import AIChatQuotation from './AIChatQuotation';
import AIChatAvailability from './AIChatAvailability';
import AIChatServices from './AIChatServices';
import AIChatFallbackSuggestions from './AIChatFallbackSuggestions';

interface AIChatMessageProps {
  message: {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
  };
  themeColors: {
    background: string;
    text: string;
    button: string;
  };
  businessProfileImage?: string;
  businessName?: string;
  businessId?: string;
  onServiceRequestComplete?: (data: any) => void;
  onQuotationComplete?: (data: any) => void;
  onAvailabilityComplete?: (data: any) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

export default function AIChatMessage({ message, themeColors, businessProfileImage, businessName, businessId, onServiceRequestComplete, onQuotationComplete, onAvailabilityComplete, onSuggestionClick }: AIChatMessageProps) {
  const isUser = message.type === 'user';
  const formattedTime = message.timestamp.toLocaleTimeString('it-IT', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });



  const handleCopy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(message);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Impossibile copiare il testo.');
    }
  };

     return (
     <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full relative z-10`}>
       <div className={`flex ${isUser ? 'flex-col items-end' : 'flex-col items-start'} w-full ${message.data?.type === 'services' ? '' : 'max-w-lg lg:max-w-2xl'} relative z-10`}>
                 {/* Profile Image for Assistant - Above message */}
         {!isUser && (
           <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-2">
                           {businessProfileImage ? (
                <img 
                  src={businessProfileImage} 
                  alt={businessName || 'Assistant'}
                  className="w-full h-full object-cover"
                  
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', businessProfileImage);
                  }}
                />
              ) : (
               <div 
                 className="w-full h-full flex items-center justify-center"
                 style={{ backgroundColor: themeColors.button }}
               >
                 <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                 </svg>
               </div>
             )}
           </div>
         )}
        
        {/* Message Content */}
                 <div 
           className={`rounded-2xl px-4 py-3 relative z-10 ${
             isUser 
               ? 'rounded-br-md' 
               : 'rounded-bl-md'
           } ${message.data?.type === 'services' ? 'w-full lg:max-w-2xl xl:max-w-3xl' : ''}`}
                       style={{
              backgroundColor: isUser ? themeColors.button : themeColors.background,
              color: isUser ? '#FFFFFF' : themeColors.text,
              border: isUser ? 'none' : `1px solid ${themeColors.text + '20'}`,
            }}
         >
          {/* Message content with line breaks */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
          
          {/* Structured data display */}
          {message.data && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: themeColors.text + '20' }}>
                             {message.data.type === 'services' && (
                 <AIChatServices
                   data={message.data}
                   themeColors={themeColors}
                   onServiceSelect={(service) => {
                     if (onServiceRequestComplete) {
                       onServiceRequestComplete({ 
                         type: 'start_service_request_with_service', 
                         service: service 
                       });
                     }
                   }}
                 />
               )}

            {message.data.type === 'service_request_init' && (
              <AIChatServiceRequest
                data={message.data}
                themeColors={themeColors}
                onStepComplete={(step, data) => {
                  if (onServiceRequestComplete) {
                    onServiceRequestComplete({ type: 'service_request_complete', step, data });
                  }
                }}
                onBack={() => {
                  if (onServiceRequestComplete) {
                    onServiceRequestComplete({ type: 'service_request_back' });
                  }
                }}
              />
            )}

            {message.data.type === 'service_request_summary' && (
              <div className="p-4 rounded-lg border mt-3" style={{ 
                backgroundColor: themeColors.text + '05',
                borderColor: themeColors.text + '20'
              }}>
                <h4 className="font-semibold text-sm mb-3" style={{ color: themeColors.button }}>
                  ✅ Prenotazione confermata
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Servizio:</strong> {message.data.service.service_name}</div>
                  <div><strong>Prezzo:</strong> €{message.data.service.price_base}</div>
                  {message.data.dateTime && (
                    <div><strong>Data e ora:</strong> {message.data.dateTime.date.toLocaleDateString('it-IT')} alle {message.data.dateTime.time}</div>
                  )}
                  <div><strong>Nome:</strong> {message.data.customerDetails.customerName}</div>
                  <div><strong>Email:</strong> {message.data.customerDetails.customerEmail}</div>
                  {message.data.customerDetails.customerPhone && (
                    <div><strong>Telefono:</strong> {message.data.customerDetails.customerPhone}</div>
                  )}
                </div>
                <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: themeColors.button + '10' }}>
                  Ti contatteremo presto per confermare la prenotazione!
                </div>
              </div>
            )}

                         {message.data.type === 'quotation_service_selection' && (
               <AIChatQuotation
                 data={message.data}
                 themeColors={themeColors}
                 onServiceSelect={(service) => {
                   if (onQuotationComplete) {
                     onQuotationComplete({ type: 'quotation_service_selected', service });
                   }
                 }}
                 onBack={() => {
                   if (onQuotationComplete) {
                     onQuotationComplete({ type: 'quotation_back' });
                   }
                 }}
                 onSubmit={(selectedItems) => {
                   if (onQuotationComplete) {
                     onQuotationComplete({ type: 'quotation_complete', selectedItems });
                   }
                 }}
               />
             )}

                         {message.data.type === 'quotation_summary' && (
               <div className="p-4 rounded-lg border mt-3" style={{ 
                 backgroundColor: themeColors.text + '05',
                 borderColor: themeColors.text + '20'
               }}>
                 <h4 className="font-semibold text-sm mb-3" style={{ color: themeColors.button }}>
                   💰 Preventivo generato
                 </h4>
                 <div className="space-y-2 text-sm">
                   <div className="font-medium mb-2">{message.data.service.service_name}</div>
                   {message.data.serviceItems && message.data.serviceItems.length > 0 ? (
                     message.data.serviceItems.map((item: any, index: number) => (
                       <div key={index} className="flex justify-between">
                         <span>{item.item_name} (x{item.quantity || 1})</span>
                         <span>€{((item.price_base || 0) * (item.quantity || 1)).toFixed(2)}</span>
                       </div>
                     ))
                   ) : (
                     <div className="flex justify-between">
                       <span>Servizio base</span>
                       <span>€{message.data.service.price_base}</span>
                     </div>
                   )}
                   <div className="border-t pt-2 mt-2" style={{ borderColor: themeColors.text + '20' }}>
                     <div className="flex justify-between font-bold">
                       <span>Totale:</span>
                       <span style={{ color: themeColors.button }}>€{message.data.totalPrice.toFixed(2)}</span>
                     </div>
                   </div>
                 </div>
                 <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: themeColors.button + '10' }}>
                   Questo è un preventivo indicativo. Contattaci per un preventivo preciso e personalizzato!
                 </div>
               </div>
             )}

            {(message.data.type === 'availability_service_selection' || message.data.type === 'availability_event_selection') && (
              <AIChatAvailability
                data={message.data}
                themeColors={themeColors}
                businessId={businessId || ''}
                onServiceSelect={(service) => {
                  if (onAvailabilityComplete) {
                    onAvailabilityComplete({ 
                      type: 'availability_service_selected', 
                      service: service 
                    });
                  }
                }}
                onBack={() => {
                  if (onAvailabilityComplete) {
                    onAvailabilityComplete({ type: 'availability_back' });
                  }
                }}
              />
            )}
            
            {message.data.type === 'products' && (
              <div className="space-y-2">
                <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
                  Categorie Prodotti
                </h4>
                <div className="grid gap-2">
                  {message.data.products.slice(0, 3).map((category: any, index: number) => (
                    <div 
                      key={index}
                      className="p-2 rounded-lg text-xs"
                      style={{ backgroundColor: themeColors.text + '10' }}
                    >
                      <div className="font-medium">{category.category_name}</div>
                      <div className="opacity-70">{category.items.length} prodotti</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {message.data.type === 'promotions' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
                  Promozioni Attive
                </h4>
                <div className="space-y-3">
                  {message.data.promotions.map((promo: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: themeColors.text + '05',
                        borderColor: themeColors.text + '20'
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="text-lg">🎉</div>
                        <div className="font-semibold text-sm">{promo.promo_title}</div>
                      </div>
                      <div className="text-xs opacity-70 mb-3 leading-relaxed">
                        {promo.promo_text_full}
                      </div>
                      {promo.promo_conditions && (
                        <div className="text-xs opacity-60 mb-2">
                          <strong>Condizioni:</strong> {promo.promo_conditions}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs opacity-60">
                        {promo.date_start && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            Dal {new Date(promo.date_start).toLocaleDateString('it-IT')}
                          </div>
                        )}
                        {promo.date_end && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            Al {new Date(promo.date_end).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {message.data.type === 'rewards' && (
              <div className="space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
                  Premi Disponibili
                </h4>
                <div className="space-y-3">
                  {message.data.rewards.map((reward: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: themeColors.text + '05',
                        borderColor: themeColors.text + '20'
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="text-lg">🏆</div>
                        <div className="font-semibold text-sm">{reward.reward_description}</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs opacity-60">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {reward.required_points} punti
                        </div>
                        {reward.reward_start_date && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            Dal {new Date(reward.reward_start_date).toLocaleDateString('it-IT')}
                          </div>
                        )}
                        {reward.reward_end_date && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            Al {new Date(reward.reward_end_date).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                         {message.data.type === 'fallback_suggestions' && (
               <AIChatFallbackSuggestions
                 data={message.data}
                 themeColors={themeColors}
                 onSuggestionClick={(suggestion) => {
                   if (onSuggestionClick) {
                     onSuggestionClick(suggestion);
                   }
                 }}
               />
             )}

             {message.data.type === 'contacts' && (
               <div className="space-y-4">
                 {/* Phones */}
                 {message.data.phones && message.data.phones.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
                      📞 Telefoni
                    </h4>
                    <div className="space-y-3">
                      {message.data.phones.map((phone: any, index: number) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{ 
                            backgroundColor: themeColors.text + '05',
                            borderColor: themeColors.text + '20'
                          }}
                        >
                          {phone.title && (
                            <div className="text-xs font-medium opacity-70 mb-1">
                              {phone.title}
                            </div>
                          )}
                          <div className="font-medium text-sm mb-2">
                            {phone.value}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <a
                              href={`tel:${phone.value}`}
                              className="button btn-sm call-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: 'rgb(45, 205, 82)', color: '#fff' }}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                              </svg>
                              Chiama
                            </a>
                            <a
                              href={phone.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button btn-sm whatsapp-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: '#25d366', color: '#fff' }}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              WhatsApp
                            </a>
                            <button
                              className="button btn-sm copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: '#6c757d', color: '#fff' }}
                              onClick={() => handleCopy(phone.value, 'Telefono copiato!')}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                              </svg>
                              Copia
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emails */}
                {message.data.emails && message.data.emails.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs uppercase tracking-wide opacity-70">
                      📧 Email
                    </h4>
                    <div className="space-y-3">
                      {message.data.emails.map((email: any, index: number) => (
                        <div 
                          key={index}
                          className="p-3 rounded-lg border"
                          style={{ 
                            backgroundColor: themeColors.text + '05',
                            borderColor: themeColors.text + '20'
                          }}
                        >
                          {email.title && (
                            <div className="text-xs font-medium opacity-70 mb-1">
                              {email.title}
                            </div>
                          )}
                          <div className="font-medium text-sm mb-2 break-all">
                            {email.value}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <a
                              href={`mailto:${email.value}`}
                              className="button btn-sm email-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: 'rgb(15, 107, 255)', color: '#fff' }}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                              </svg>
                              Invia Email
                            </a>
                            <button
                              className="button btn-sm copy-button px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"
                              style={{ backgroundColor: '#6c757d', color: '#fff' }}
                              onClick={() => handleCopy(email.value, 'Email copiata!')}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                              </svg>
                              Copia Email
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Timestamp - Below the message bubble */}
      <div 
        className={`text-xs opacity-50 mt-2 ${
          isUser ? 'text-right' : 'text-left'
        }`}
        style={{ color: themeColors.text }}
      >
        {formattedTime}
      </div>
    </div>
  </div>
  );
}
