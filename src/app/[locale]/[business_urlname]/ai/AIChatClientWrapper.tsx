"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import AIChatMessage from './AIChatMessage';
import AIChatInput from './AIChatInput';
import AIChatSuggestions from './AIChatSuggestions';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import LocaleSwitcherButton from '@/components/ui/LocaleSwitcherButton';

// Contact parsing utilities
function parseContacts(contactsJson: string | null): Array<{ value: string }> {
  if (!contactsJson) return [];
  try {
    const parsed = JSON.parse(contactsJson);
    return Array.isArray(parsed) ? parsed.map(contact => ({ value: contact })) : [];
  } catch {
    return [];
  }
}

function hasValidContacts(contacts: Array<{ value: string }>): boolean {
  return contacts.length > 0 && contacts.some(contact => contact.value && contact.value.trim());
}

function createWhatsAppLink(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}`;
}

interface AIChatClientWrapperProps {
  initialData: {
    business: {
      id: string;
      name: string;
      description: string;
      email: string;
      phone: string;
      img_profile?: string;
    };
    services: any[];
    categories: any[];
    promotions: any[];
    rewards: any[];
    products: any[];
    themeColors: {
      background: string;
      text: string;
      button: string;
    };
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // For structured data like services, products, etc.
}

export default function AIChatClientWrapper({ initialData }: AIChatClientWrapperProps) {
  const t = useTranslations('Common');
  const businessContext = useBusinessProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);



  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
             content: `Ciao! Sono l'assistente virtuale di ${initialData.business.name}. Posso aiutarti a:
       
 • Esplorare i nostri servizi
 • Simulare preventivi
 • Fornire informazioni di contatto
 • Mostrare i nostri prodotti
 • Informarti su promozioni e premi
 • Controllare disponibilità

 Come posso aiutarti oggi?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [initialData.business.name]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const userMessageLower = message.toLowerCase();
      
      // Check if this is an availability request (dynamic data)
      const isAvailabilityRequest = userMessageLower.includes('disponibilità') || 
                                   userMessageLower.includes('disponibilita') || 
                                   userMessageLower.includes('controlla disponibilità') || 
                                   userMessageLower.includes('controlla disponibilita');

      if (isAvailabilityRequest) {
        // Use API for availability (dynamic data)
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            businessUrlname: window.location.pathname.split('/')[2],
            requestType: 'availability'
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get availability data: ${response.status}`);
        }

        const aiResponse = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date(),
          data: aiResponse.data,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Use cached data for static content (services, contacts, etc.)
        const cachedResponse = await generateAIResponse(message, initialData);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: cachedResponse.content,
          timestamp: new Date(),
          data: cachedResponse.data,
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to local response generation
      const fallbackResponse = await generateAIResponse(message, initialData);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date(),
        data: fallbackResponse.data,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleServiceRequestComplete = async (data: any) => {
    if (data.type === 'start_service_request') {
      // Start the service request flow
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'prenota',
          businessUrlname: window.location.pathname.split('/')[2],
          context: { messages: messages.slice(-5) }
        }),
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResponse.content,
          timestamp: new Date(),
          data: aiResponse.data,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } else if (data.type === 'start_service_request_with_service') {
      // Start the service request flow with a pre-selected service
      const selectedService = data.service;
      
      // Determine the next step based on service requirements
      let nextStep = 'customer_details';
      if (selectedService.date_selection) {
        nextStep = 'datetime_selection';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Perfetto! Hai scelto "${selectedService.service_name}". ${selectedService.date_selection ? 'Ora scegli data e ora per la prenotazione.' : 'Ora compila i tuoi dati per completare la prenotazione.'}`,
        timestamp: new Date(),
        data: { 
          type: 'service_request_init', 
          services: [selectedService], // Pass only the selected service
          step: nextStep,
          preselectedService: selectedService
        },
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } else if (data.type === 'service_request_complete') {
      // Handle service request completion
      const { service, dateTime, customerDetails } = data.data;
      
      let summaryText = `Perfetto! Ho ricevuto la tua prenotazione per:\n\n`;
      summaryText += `**Servizio:** ${service.service_name}\n`;
      summaryText += `**Prezzo:** €${service.price_base}\n`;
      
      if (dateTime) {
        summaryText += `**Data e ora:** ${dateTime.date.toLocaleDateString('it-IT')} alle ${dateTime.time}\n`;
      }
      
      summaryText += `**Nome:** ${customerDetails.customerName}\n`;
      summaryText += `**Email:** ${customerDetails.customerEmail}\n`;
      
      if (customerDetails.customerPhone) {
        summaryText += `**Telefono:** ${customerDetails.customerPhone}\n`;
      }
      
      summaryText += `\nLa tua richiesta è stata inviata con successo! Ti contatteremo presto per confermare la prenotazione.`;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: summaryText,
        timestamp: new Date(),
        data: { type: 'service_request_summary', service, dateTime, customerDetails },
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }
  };

           const handleQuotationComplete = async (data: any) => {
      if (data.type === 'quotation_service_selected') {
        // Handle service selection for quotation
        const { service } = data;
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Perfetto! Ora seleziona gli elementi per il preventivo di "${service.service_name}".`,
          timestamp: new Date(),
          data: { 
            type: 'quotation_service_selection', 
            services: [service], // Pass only the selected service
            selectedService: service
          },
        };
        
        setMessages(prev => [...prev, assistantMessage]);
             } else if (data.type === 'quotation_complete') {
         // Handle quotation completion
         const { selectedItems } = data;
         
         // Get the service from the previous message
         const previousMessage = messages[messages.length - 1];
         const service = previousMessage.data.selectedService;
         
         // Calculate total and create summary
         const serviceItems = Object.entries(selectedItems).map(([itemId, quantity]) => {
           const item = service.serviceitem.find((i: any) => i.service_item_id === parseInt(itemId));
           return {
             ...item,
             quantity: quantity
           };
         });
         
         const totalPrice = serviceItems.reduce((total: number, item: any) => {
           return total + (item.price_base * item.quantity);
         }, 0);
         
         let summaryText = `Perfetto! Ho generato il tuo preventivo per **${service.service_name}**:\n\n`;
         if (serviceItems.length > 0) {
           serviceItems.forEach((item: any) => {
             const subtotal = item.price_base * item.quantity;
             const unitInfo = item.price_type === 'per_unit' && item.price_unit ? ` (${item.quantity} ${item.price_unit})` : ` (x${item.quantity})`;
             summaryText += `• ${item.item_name}${unitInfo} - €${subtotal.toFixed(2)}\n`;
           });
         } else {
           summaryText += `• Servizio base - €${service.price_base}\n`;
         }
         summaryText += `\n**Totale:** €${totalPrice.toFixed(2)}\n\n`;
         summaryText += `Questo è un preventivo indicativo. Per un preventivo preciso e personalizzato, ti consigliamo di contattarci direttamente.`;

         const assistantMessage: ChatMessage = {
           id: (Date.now() + 1).toString(),
           type: 'assistant',
           content: summaryText,
           timestamp: new Date(),
           data: { type: 'quotation_summary', service, serviceItems, totalPrice },
         };
         
         setMessages(prev => [...prev, assistantMessage]);
      } else if (data.type === 'quotation_back') {
        // Handle back action - remove the last message (service items selection)
        setMessages(prev => prev.slice(0, -1));
      }
    };

       const handleAvailabilityComplete = async (data: any) => {
      if (data.type === 'availability_service_selected') {
        // Handle service selection for availability
        const { service } = data;
        
        // Create a new message with the events for the selected service
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `Perfetto! Ecco gli eventi disponibili per "${service.service_name}":`,
          timestamp: new Date(),
          data: { 
            type: 'availability_event_selection', 
            selectedService: service 
          },
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.type === 'availability_back') {
        // Handle back action - remove the last message (events message)
        setMessages(prev => prev.slice(0, -1));
      }
    };

                   return (
      <div 
        className="flex flex-col mx-auto w-full min-h-screen bg-white relative overflow-hidden"
        style={{ 
          background: `
            linear-gradient(135deg, 
              ${initialData.themeColors.background} 0%, 
              ${initialData.themeColors.background}dd 25%, 
              ${initialData.themeColors.background}99 50%, 
              ${initialData.themeColors.background}dd 75%, 
              ${initialData.themeColors.background} 100%
            ),
            linear-gradient(45deg, 
              ${initialData.themeColors.background}20 0%, 
              transparent 30%, 
              ${initialData.themeColors.background}10 60%, 
              transparent 70%, 
              ${initialData.themeColors.background}30 100%
            ),
            radial-gradient(circle at 20% 80%, ${initialData.themeColors.background}40 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${initialData.themeColors.background}30 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, ${initialData.themeColors.background}20 0%, transparent 50%),
            radial-gradient(ellipse at top left, ${initialData.themeColors.background}25 0%, transparent 70%),
            radial-gradient(ellipse at bottom right, ${initialData.themeColors.background}15 0%, transparent 70%)
          `,
          position: 'relative'
        }}
      >
                 {/* Moving Shine Effects */}
         <div 
           className="absolute inset-0 opacity-30 z-0"
           style={{
             background: `
               radial-gradient(circle at 30% 20%, ${initialData.themeColors.text}15 0%, transparent 50%),
               radial-gradient(circle at 70% 80%, ${initialData.themeColors.text}10 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, ${initialData.themeColors.text}20 0%, transparent 60%)
             `,
             animation: 'shineMove 15s ease-in-out infinite'
           }}
         />
        
                 {/* Fixed Grid Lines */}
         <div 
           className="absolute inset-0 opacity-5 z-0"
           style={{
             backgroundImage: `
               linear-gradient(${initialData.themeColors.text} 1px, transparent 1px),
               linear-gradient(90deg, ${initialData.themeColors.text} 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }}
         />
        
                 {/* Floating Particles */}
         <div className="absolute inset-0 overflow-hidden z-0">
           {[...Array(8)].map((_, i) => (
             <div
               key={i}
               className={`absolute rounded-full opacity-20 blur-sm ${
                 i % 3 === 0 ? 'w-4 h-4' : i % 2 === 0 ? 'w-3 h-3' : 'w-2 h-2'
               }`}
               style={{
                 background: initialData.themeColors.text,
                 left: `${20 + i * 12}%`,
                 top: `${30 + i * 8}%`,
                 animation: `particleFloat ${8 + i * 2}s ease-in-out infinite`,
                 animationDelay: `${i * 0.5}s`
               }}
             />
           ))}
         </div>
        
                 <style jsx>{`
           @keyframes shineMove {
             0%, 100% { 
               transform: translateX(-20px) translateY(-20px) scale(1);
               opacity: 0.3;
             }
             25% { 
               transform: translateX(20px) translateY(-40px) scale(1.1);
               opacity: 0.5;
             }
             50% { 
               transform: translateX(40px) translateY(-20px) scale(0.9);
               opacity: 0.2;
             }
             75% { 
               transform: translateX(20px) translateY(20px) scale(1.2);
               opacity: 0.4;
             }
           }
           

           
           @keyframes particleFloat {
             0%, 100% { 
               transform: translateY(0px) translateX(0px) scale(1);
               opacity: 0.2;
             }
             25% { 
               transform: translateY(-30px) translateX(10px) scale(1.2);
               opacity: 0.4;
             }
             50% { 
               transform: translateY(-60px) translateX(-5px) scale(0.8);
               opacity: 0.1;
             }
             75% { 
               transform: translateY(-30px) translateX(-15px) scale(1.1);
               opacity: 0.3;
             }
           }
         `}</style>
              {/* Header */}
        <div 
          className="grid grid-cols-3 items-center p-4 border-b relative z-10"
          style={{ 
            borderColor: initialData.themeColors.text + '20',
            color: initialData.themeColors.text 
          }}
        >
          {/* Left Column - Help Button */}
          <div className="flex items-center">
            <button
              className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
              style={{
                backgroundColor: initialData.themeColors.text + '10',
                color: initialData.themeColors.text
              }}
              onClick={() => {
                // TODO: Implement help functionality
                console.log('Help button clicked');
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>

          {/* Center Column - Logo + Title */}
          <div className="flex items-center justify-center">
            {(businessContext as any).businessData?.business_img_profile ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={(businessContext as any).businessData.business_img_profile} 
                  alt={(businessContext as any).businessData.business_name}
                  className="w-full h-full object-cover"
                  
                  onLoad={() => {
                    console.log('✅ Header image loaded successfully:', (businessContext as any).businessData.business_img_profile);
                  }}
                />
              </div>
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: initialData.themeColors.button }}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Right Column - Locale Switcher + Menu */}
          <div className="flex items-center justify-end gap-2">
            <div
              className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
              style={{
                backgroundColor: initialData.themeColors.text + '10',
                color: initialData.themeColors.text
              }}
            >
              <LocaleSwitcherButton
                onClick={() => {
                  // TODO: Implement locale switching functionality
                  console.log('Locale switcher clicked');
                }}
                className=""
              />
            </div>
            <button
              className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
              style={{
                backgroundColor: initialData.themeColors.text + '10',
                color: initialData.themeColors.text
              }}
              onClick={() => {
                // TODO: Implement menu functionality
                console.log('Menu button clicked');
              }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

             {/* Chat Container - Centered at start, fixed bottom when chat begins */}
       {messages.length === 1 ? (
         // Welcome layout
         <div className="max-w-[800px] mx-auto flex-1 flex items-center justify-center relative z-10">
           <div className="w-full max-w-xl mx-auto px-4">
                           <div className="text-center mb-4">
                <h2 
                  className="text-xl lg:text-2xl font-bold mb-2"
                  style={{ color: initialData.themeColors.text }}
                >
                  Ciao! Sono l'assistente di <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">{(businessContext as any).businessData?.business_name || initialData.business.name}</span>
                </h2>
               <p 
                 className="text-sm font-semibold opacity-70"
                 style={{ color: initialData.themeColors.text }}
               >
                 Come posso aiutarti oggi?
               </p>
             </div>
             
             {/* Suggestions */}
             <AIChatSuggestions
               onSuggestionClick={handleSuggestionClick}
               themeColors={initialData.themeColors}
             />
           </div>
         </div>
       ) : (
         // Regular chat layout with sticky input
         <div className="max-w-[1200px] mx-auto flex-1 flex flex-col relative z-10">
           {/* Messages Container - Scrollable */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-0">
                                                       {messages.map((message) => (
                                  <AIChatMessage
                     key={message.id}
                     message={message}
                     themeColors={initialData.themeColors}
                     businessProfileImage={(businessContext as any).businessData?.business_img_profile}
                     businessName={(businessContext as any).businessData?.business_name || initialData.business.name}
                     businessId={initialData.business.id}
                                           onServiceRequestComplete={handleServiceRequestComplete}
                      onQuotationComplete={handleQuotationComplete}
                      onAvailabilityComplete={handleAvailabilityComplete}
                      onSuggestionClick={handleSuggestionClick}
                   />
               ))}
             
                                                                                                               {isLoading && (
                  <div className="flex items-center gap-3 p-4">
                                         {(businessContext as any).businessData?.business_img_profile ? (
                       <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                         <img 
                           src={(businessContext as any).businessData.business_img_profile} 
                           alt={(businessContext as any).businessData.business_name}
                           className="w-full h-full object-cover"
                           
                           onLoad={() => {
                             console.log('✅ Loading image loaded successfully:', (businessContext as any).businessData.business_img_profile);
                           }}
                         />
                       </div>
                     ) : (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: initialData.themeColors.button }}
                      >
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm opacity-70">L'assistente sta scrivendo...</span>
                  </div>
                )}
             
             <div ref={messagesEndRef} />
           </div>
           
                       {/* Sticky Input at bottom */}
            <div 
              className="sticky bottom-0 border-t shadow-2xl relative z-10" 
              style={{ 
                borderColor: initialData.themeColors.text + '20',
                background: `linear-gradient(to top, ${initialData.themeColors.background}, ${initialData.themeColors.background}dd)`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <AIChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                themeColors={initialData.themeColors}
              />
            </div>
         </div>
       )}

       {/* Input - Only shown in welcome state */}
       {messages.length === 1 && (
         <AIChatInput
           onSendMessage={handleSendMessage}
           isLoading={isLoading}
           themeColors={initialData.themeColors}
         />
       )}
    </div>
  );
}

// AI Response Generator
async function generateAIResponse(userMessage: string, data: any) {
  const message = userMessage.toLowerCase();
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Services
  if (message.includes('servizi') || message.includes('service') || message.includes('cosa offrite')) {
    if (data.services.length === 0) {
      return {
        content: 'Al momento non abbiamo servizi disponibili. Contattaci direttamente per maggiori informazioni.',
        data: null
      };
    }

    return {
      content: 'Ecco i nostri servizi disponibili.',
      data: { type: 'services', services: data.services }
    };
  }

  // Quotation
  if (message.includes('preventivo') || message.includes('quotation') || message.includes('prezzo') || message.includes('costo')) {
    const availableServices = data.services.filter((service: any) => service.quotation_available === true);
    
    if (availableServices.length === 0) {
      return {
        content: 'Al momento non abbiamo servizi disponibili per preventivi automatici. Contattaci direttamente per un preventivo personalizzato.',
        data: null
      };
    }

    return {
      content: 'Perfetto! Seleziona il servizio per cui vuoi un preventivo dettagliato.',
      data: { 
        type: 'quotation_service_selection', 
        services: availableServices 
      }
    };
  }

  // Availability Check
  if (message.includes('disponibilità') || message.includes('disponibilita') || message.includes('controlla disponibilità') || message.includes('controlla disponibilita')) {
    const availableServices = data.services.filter((service: any) => service.date_selection === true);
    
    if (availableServices.length === 0) {
      return {
        content: 'Al momento non abbiamo servizi con disponibilità prenotabile. Contattaci direttamente per verificare la disponibilità.',
        data: null
      };
    }

    return {
      content: 'Perfetto! Ecco i servizi per cui puoi controllare la disponibilità. Scegli un servizio per vedere gli eventi disponibili.',
      data: { 
        type: 'availability_service_selection', 
        services: availableServices 
      }
    };
  }

  // Contact
  if (message.includes('contatto') || message.includes('chiamare') || message.includes('email') || message.includes('telefono') || message.includes('contatti')) {
    const phones = parseContacts(data.business.phone);
    const emails = parseContacts(data.business.email);
    
    if (!hasValidContacts(phones) && !hasValidContacts(emails)) {
      return {
        content: 'Al momento non abbiamo informazioni di contatto disponibili. Contattaci attraverso il nostro sito web.',
        data: null
      };
    }

    return {
      content: 'Ecco le nostre informazioni di contatto. Puoi cliccare sui pulsanti qui sotto per chiamare, inviare un\'email o copiare i contatti.',
      data: { 
        type: 'contacts', 
        phones: phones.map(phone => ({
          ...phone,
          whatsappLink: createWhatsAppLink(phone.value)
        })),
        emails: emails
      }
    };
  }

  // Products
  if (message.includes('prodotti') || message.includes('menu') || message.includes('cosa vendete')) {
    if (data.products.length === 0) {
      return {
        content: 'Al momento non abbiamo prodotti disponibili nel nostro menu.',
        data: null
      };
    }

    const productList = data.products.slice(0, 5).map((category: any) => 
      `📁 ${category.category_name} (${category.items.length} prodotti)`
    ).join('\n');

    return {
      content: `Ecco le nostre categorie di prodotti:\n\n${productList}\n\nVuoi vedere i dettagli di una categoria specifica?`,
      data: { type: 'products', products: data.products }
    };
  }

  // Promotions
  if (message.includes('promozioni') || message.includes('offerte') || message.includes('sconti')) {
    if (data.promotions.length === 0) {
      return {
        content: 'Al momento non abbiamo promozioni attive. Controlla regolarmente per nuove offerte!',
        data: null
      };
    }

    const promotionList = data.promotions.slice(0, 3).map((promo: any) => 
      `🎉 ${promo.promo_title}\n${promo.promo_text_full}`
    ).join('\n\n');

    return {
      content: `Ecco le nostre promozioni attive:\n\n${promotionList}`,
      data: { type: 'promotions', promotions: data.promotions }
    };
  }

  // Rewards
  if (message.includes('premi') || message.includes('rewards') || message.includes('punti')) {
    if (data.rewards.length === 0) {
      return {
        content: 'Al momento non abbiamo un programma premi attivo.',
        data: null
      };
    }

    const rewardList = data.rewards.slice(0, 3).map((reward: any) => 
      `🏆 ${reward.reward_description} (${reward.required_points} punti)`
    ).join('\n');

    return {
      content: `Ecco alcuni dei nostri premi disponibili:\n\n${rewardList}\n\nChiedi al nostro staff come accumulare punti!`,
      data: { type: 'rewards', rewards: data.rewards }
    };
  }

  // Default response
  return {
    content: `Non sono riuscito a trovare una soluzione al momento. Posso aiutarti con:`,
    data: { 
      type: 'fallback_suggestions',
      suggestions: [
        { text: 'Servizi', icon: '🔧' },
        { text: 'Preventivi', icon: '💰' },
        { text: 'Contatti', icon: '📞' },
        { text: 'Prodotti', icon: '🛍️' },
        { text: 'Promozioni', icon: '🎉' },
        { text: 'Programma premi', icon: '🏆' },
        { text: 'Controlla disponibilità', icon: '📅' }
      ],
      contacts: {
        phones: data.business.phone ? JSON.parse(data.business.phone) : [],
        emails: data.business.email ? JSON.parse(data.business.email) : []
      }
    }
  };
}
