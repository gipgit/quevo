// Unified Action System
// Combines action templates, configurations, and utilities in one place

import { ActionConfig, getActionConfig, getAvailableActionsForPlan, getPlanLimits, getAllActionConfigs } from './action-configs';

// Action type to icon mapping
export const ACTION_TYPE_ICONS: Record<string, string> = {
  'generic_message': '/icons/sanity/info-outline.svg',
  'payment_request': '/icons/payments/credit-card.svg',
  'appointment_scheduling': '/icons/sanity/calendar.svg',
  'information_request': '/icons/sanity/help-circle.svg',
  'document_download': '/icons/sanity/download.svg',
  'signature_request': '/icons/sanity/edit.svg',
  'approval_request': '/icons/sanity/checkmark-circle.svg',
  'feedback_request': '/icons/sanity/comment.svg',
  'milestone_update': '/icons/sanity/trend-upward.svg',
  'resource_link': '/icons/sanity/link.svg',
  'checklist': '/icons/sanity/checkmark.svg',

  'opt_in_request': '/icons/sanity/checkmark.svg'
};

// Action type to color mapping
export const ACTION_TYPE_COLORS: Record<string, string> = {
  'generic_message': 'bg-blue-100',
  'payment_request': 'bg-green-100',
  'appointment_scheduling': 'bg-purple-100',
  'information_request': 'bg-yellow-100',
  'document_download': 'bg-indigo-100',
  'signature_request': 'bg-red-100',
  'approval_request': 'bg-orange-100',
  'feedback_request': 'bg-blue-100',
  'milestone_update': 'bg-green-100',
  'resource_link': 'bg-cyan-100',
  'checklist': 'bg-pink-100',

  'opt_in_request': 'bg-lime-100'
};

// Action template translations - SHORT descriptions for AddActionModal
export const actionTemplateTranslations = {
  'appointment_scheduling': {
    it: { title: 'Pianificazione Appuntamento', description: 'Crea appuntamenti e gestisci prenotazioni con i tuoi clienti.' },
    en: { title: 'Appointment Scheduling', description: 'Create appointments and manage bookings with your clients.' },
    es: { title: 'Programación de Citas', description: 'Crea citas y gestiona reservas con tus clientes.' }
  },
  'payment_request': {
    it: { title: 'Richiesta Pagamento', description: 'Invia richieste di pagamento sicure ai tuoi clienti.' },
    en: { title: 'Payment Request', description: 'Send secure payment requests to your clients.' },
    es: { title: 'Solicitud de Pago', description: 'Envía solicitudes de pago seguras a tus clientes.' }
  },
  'information_request': {
    it: { title: 'Richiesta Informazioni', description: 'Raccogli informazioni dai tuoi clienti tramite moduli personalizzati.' },
    en: { title: 'Information Request', description: 'Collect information from your clients through custom forms.' },
    es: { title: 'Solicitud de Información', description: 'Recopila información de tus clientes a través de formularios personalizados.' }
  },
  'document_download': {
    it: { title: 'Download Documento', description: 'Condividi documenti e file in modo sicuro con i tuoi clienti.' },
    en: { title: 'Document Download', description: 'Securely share documents and files with your clients.' },
    es: { title: 'Descarga de Documento', description: 'Comparte documentos y archivos de forma segura con tus clientes.' }
  },
  'media_upload': {
    it: { title: 'Carica Foto/Video', description: 'Richiedi al cliente di caricare foto o video per documentare il servizio.' },
    en: { title: 'Media Upload', description: 'Request clients to upload photos or videos to document the service.' },
    es: { title: 'Carga de Medios', description: 'Solicita a los clientes que suban fotos o videos para documentar el servicio.' }
  },
  'milestone_update': {
    it: { title: 'Aggiornamento Milestone', description: 'Comunica i progressi del progetto ai tuoi clienti.' },
    en: { title: 'Milestone Update', description: 'Communicate project progress to your clients.' },
    es: { title: 'Actualización de Hito', description: 'Comunica el progreso del proyecto a tus clientes.' }
  },
  'feedback_request': {
    it: { title: 'Richiesta Feedback', description: 'Raccogli feedback e opinioni dai tuoi clienti.' },
    en: { title: 'Feedback Request', description: 'Gather feedback and opinions from your clients.' },
    es: { title: 'Solicitud de Comentarios', description: 'Recopila comentarios y opiniones de tus clientes.' }
  },
  'signature_request': {
    it: { title: 'Richiesta Firma', description: 'Ottieni firme digitali su contratti e documenti.' },
    en: { title: 'Signature Request', description: 'Get digital signatures on contracts and documents.' },
    es: { title: 'Solicitud de Firma', description: 'Obtén firmas digitales en contratos y documentos.' }
  },
  'generic_message': {
    it: { title: 'Messaggio Generico', description: 'Invia messaggi informativi ai tuoi clienti.' },
    en: { title: 'Generic Message', description: 'Send informational messages to your clients.' },
    es: { title: 'Mensaje Genérico', description: 'Envía mensajes informativos a tus clientes.' }
  },
  'approval_request': {
    it: { title: 'Richiesta Approvazione', description: 'Richiedi approvazioni per decisioni importanti.' },
    en: { title: 'Approval Request', description: 'Request approvals for important decisions.' },
    es: { title: 'Solicitud de Aprobación', description: 'Solicita aprobaciones para decisiones importantes.' }
  },
  'checklist': {
    it: { title: 'Checklist', description: 'Crea liste di controllo per i tuoi clienti.' },
    en: { title: 'Checklist', description: 'Create checklists for your clients.' },
    es: { title: 'Lista de Verificación', description: 'Crea listas de verificación para tus clientes.' }
  },
  'resource_link': {
    it: { title: 'Link Risorsa', description: 'Condividi link a risorse utili con i tuoi clienti.' },
    en: { title: 'Resource Link', description: 'Share useful resource links with your clients.' },
    es: { title: 'Enlace de Recurso', description: 'Comparte enlaces de recursos útiles con tus clientes.' }
  },

};

// Form field placeholders - localized
export const formFieldPlaceholders = {
  'generic_message': {
    it: {
      action_title: 'Messaggio per il cliente',
      action_description: 'Gentile Cliente, Le comunichiamo che...'
    },
    en: {
      action_title: 'Message for the client',
      action_description: 'Dear Client, We would like to inform you that...'
    },
    es: {
      action_title: 'Mensaje para el cliente',
      action_description: 'Estimado Cliente, Le informamos que...'
    }
  },
  'payment_request': {
    it: {
      action_title: 'Richiesta di pagamento',
      action_description: 'Gentile Cliente, Le richiediamo il pagamento per...'
    },
    en: {
      action_title: 'Payment request',
      action_description: 'Dear Client, We request payment for...'
    },
    es: {
      action_title: 'Solicitud de pago',
      action_description: 'Estimado Cliente, Solicitamos el pago por...'
    }
  },
  'information_request': {
    it: {
      action_title: 'Richiesta di informazioni',
      action_description: 'Gentile Cliente, Le chiediamo di fornirci...'
    },
    en: {
      action_title: 'Information request',
      action_description: 'Dear Client, We ask you to provide us with...'
    },
    es: {
      action_title: 'Solicitud de información',
      action_description: 'Estimado Cliente, Le pedimos que nos proporcione...'
    }
  },
  'document_download': {
    it: {
      action_title: 'Download documento',
      action_description: 'Gentile Cliente, Le forniamo il documento...'
    },
    en: {
      action_title: 'Document download',
      action_description: 'Dear Client, We provide you with the document...'
    },
    es: {
      action_title: 'Descarga de documento',
      action_description: 'Estimado Cliente, Le proporcionamos el documento...'
    }
  },
  'signature_request': {
    it: {
      action_title: 'Richiesta di firma',
      action_description: 'Gentile Cliente, Le richiediamo la firma sul documento...'
    },
    en: {
      action_title: 'Signature request',
      action_description: 'Dear Client, We request your signature on the document...'
    },
    es: {
      action_title: 'Solicitud de firma',
      action_description: 'Estimado Cliente, Solicitamos su firma en el documento...'
    }
  },
  'resource_link': {
    it: {
      action_title: 'Condivisione risorsa',
      action_description: 'Gentile Cliente, Le condividiamo questa risorsa...'
    },
    en: {
      action_title: 'Resource sharing',
      action_description: 'Dear Client, We share this resource with you...'
    },
    es: {
      action_title: 'Compartir recurso',
      action_description: 'Estimado Cliente, Compartimos este recurso con usted...'
    }
  },
  'checklist': {
    it: {
      action_title: 'Checklist da completare',
      action_description: 'Gentile Cliente, Le forniamo questa checklist per...'
    },
    en: {
      action_title: 'Checklist to complete',
      action_description: 'Dear Client, We provide you with this checklist for...'
    },
    es: {
      action_title: 'Lista de verificación para completar',
      action_description: 'Estimado Cliente, Le proporcionamos esta lista de verificación para...'
    }
  },
  'feedback_request': {
    it: {
      action_title: 'Richiesta di feedback',
      action_description: 'Gentile Cliente, Le chiediamo il suo feedback su...'
    },
    en: {
      action_title: 'Feedback request',
      action_description: 'Dear Client, We ask for your feedback on...'
    },
    es: {
      action_title: 'Solicitud de comentarios',
      action_description: 'Estimado Cliente, Le pedimos sus comentarios sobre...'
    }
  },
  'approval_request': {
    it: {
      action_title: 'Richiesta di approvazione',
      action_description: 'Gentile Cliente, Le richiediamo l\'approvazione per...'
    },
    en: {
      action_title: 'Approval request',
      action_description: 'Dear Client, We request your approval for...'
    },
    es: {
      action_title: 'Solicitud de aprobación',
      action_description: 'Estimado Cliente, Solicitamos su aprobación para...'
    }
  },
  'milestone_update': {
    it: {
      action_title: 'Aggiornamento milestone',
      action_description: 'Gentile Cliente, Le comunichiamo l\'aggiornamento del milestone...'
    },
    en: {
      action_title: 'Milestone update',
      action_description: 'Dear Client, We inform you of the milestone update...'
    },
    es: {
      action_title: 'Actualización de hito',
      action_description: 'Estimado Cliente, Le informamos de la actualización del hito...'
    }
  },
  'appointment_scheduling': {
    it: {
      action_title: 'Proposta appuntamento',
      action_description: 'Gentile Cliente, Le proponiamo un appuntamento per...'
    },
    en: {
      action_title: 'Appointment proposal',
      action_description: 'Dear Client, We propose an appointment for...'
    },
    es: {
      action_title: 'Propuesta de cita',
      action_description: 'Estimado Cliente, Le proponemos una cita para...'
    }
  },
  'media_upload': {
    it: {
      action_title: 'Richiesta di caricamento',
      action_description: 'Gentile Cliente, Le chiediamo di caricare...'
    },
    en: {
      action_title: 'Upload request',
      action_description: 'Dear Client, We ask you to upload...'
    },
    es: {
      action_title: 'Solicitud de carga',
      action_description: 'Estimado Cliente, Le pedimos que suba...'
    }
  }
};

// Helper functions
export function getActionIconAndColor(actionType: string) {
  return {
    icon: ACTION_TYPE_ICONS[actionType] || '/icons/sanity/info-outline.svg',
    color: ACTION_TYPE_COLORS[actionType] || 'bg-blue-100'
  };
}

export function getActionTemplateTranslation(templateNameKey: string, locale: string = 'it') {
  const template = actionTemplateTranslations[templateNameKey as keyof typeof actionTemplateTranslations];
  if (!template) {
    return {
      title: templateNameKey,
      description: ''
    };
  }
  
  return template[locale as keyof typeof template] || template.it;
}

export function getFormFieldPlaceholders(actionType: string, locale: string = 'it') {
  const placeholders = formFieldPlaceholders[actionType as keyof typeof formFieldPlaceholders];
  if (!placeholders) {
    return {
      action_title: locale === 'en' ? 'Message for the client' : locale === 'es' ? 'Mensaje para el cliente' : 'Messaggio per il cliente',
      action_description: locale === 'en' ? 'Dear Client, We would like to inform you that...' : locale === 'es' ? 'Estimado Cliente, Le informamos que...' : 'Gentile Cliente, Le comunichiamo che...'
    };
  }
  
  return placeholders[locale as keyof typeof placeholders] || placeholders.it;
}

// Main function to get action templates for AddActionModal
export function getActionTemplatesForModal(plan: number = 1, locale: string = 'it') {
  // Get all actions, not just available ones for the plan
  const allActions = getAllActionConfigs();
  
  return allActions.map((config: ActionConfig) => {
    const translation = getActionTemplateTranslation(config.actionType, locale);
    const isAvailableForPlan = config.availablePlans.includes(plan);
    
    return {
      template_id: config.actionType,
      template_name_key: config.actionType,
      action_type: config.actionType,
      translated_title: translation.title,
      translated_description: translation.description,
      icon: config.icon,
      color: config.color,
      is_available_for_current_plan: true, // Make all actions selectable for testing
      plan_limits: getPlanLimits(config.actionType, plan),
      display_order: 0,
      // Add premium indicator for actions not available in current plan
      is_premium: !isAvailableForPlan,
      premium_label: !isAvailableForPlan ? 'Upgrade' : undefined
    };
  });
}

// Landing page translations - LONGER descriptions with metadata
export const landingPageTranslations = {
  'appointment_scheduling': {
    it: {
      title: 'Pianificazione Appuntamento',
      description: 'Lascia che i tuoi clienti prenotino appuntamenti 24/7. Il nostro sistema di prenotazione si integra perfettamente con il tuo calendario e invia conferme e promemoria automatici.'
    },
    en: {
      title: 'Appointment Scheduling',
      description: 'Let your customers book appointments 24/7. Our booking system integrates seamlessly with your calendar and sends automatic confirmations and reminders.'
    },
    es: {
      title: 'Programación de Citas',
      description: 'Permite que tus clientes reserven citas 24/7. Nuestro sistema de reservas se integra perfectamente con tu calendario y envía confirmaciones y recordatorios automáticos.'
    }
  },
  'payment_request': {
    it: {
      title: 'Richiesta Pagamento',
      description: 'Invia richieste di pagamento sicure ai tuoi clienti. Accetta più metodi di pagamento e monitora lo stato del pagamento in tempo reale.'
    },
    en: {
      title: 'Payment Request',
      description: 'Send secure payment requests to your clients. Accept multiple payment methods and track payment status in real-time.'
    },
    es: {
      title: 'Solicitud de Pago',
      description: 'Envía solicitudes de pago seguras a tus clientes. Acepta múltiples métodos de pago y rastrea el estado del pago en tiempo real.'
    }
  },
  'information_request': {
    it: {
      title: 'Richiesta Informazioni',
      description: 'Raccogli informazioni importanti dai tuoi clienti attraverso moduli personalizzati. Semplifica il processo di raccolta dati.'
    },
    en: {
      title: 'Information Request',
      description: 'Collect important information from your clients through customized forms. Streamline your data collection process.'
    },
    es: {
      title: 'Solicitud de Información',
      description: 'Recopila información importante de tus clientes a través de formularios personalizados. Optimiza tu proceso de recopilación de datos.'
    }
  },
  'document_download': {
    it: {
      title: 'Download Documento',
      description: 'Condividi in modo sicuro documenti, contratti e file con i tuoi clienti. Monitora i download e mantieni il controllo delle versioni.'
    },
    en: {
      title: 'Document Download',
      description: 'Securely share documents, contracts, and files with your clients. Track downloads and maintain version control.'
    },
    es: {
      title: 'Descarga de Documento',
      description: 'Comparte de forma segura documentos, contratos y archivos con tus clientes. Rastrea las descargas y mantén el control de versiones.'
    }
  },
  'milestone_update': {
    it: {
      title: 'Aggiornamento Milestone',
      description: 'Mantieni i tuoi clienti informati sui progressi del progetto con aggiornamenti sui milestone. Celebra i successi insieme.'
    },
    en: {
      title: 'Milestone Update',
      description: 'Keep your clients informed about project progress with milestone updates. Celebrate achievements together.'
    },
    es: {
      title: 'Actualización de Hito',
      description: 'Mantén a tus clientes informados sobre el progreso del proyecto con actualizaciones de hitos. Celebra los logros juntos.'
    }
  },
  'feedback_request': {
    it: {
      title: 'Richiesta Feedback',
      description: 'Raccogli feedback prezioso dai tuoi clienti per migliorare i tuoi servizi. Crea moduli di feedback e sondaggi personalizzati.'
    },
    en: {
      title: 'Feedback Request',
      description: 'Gather valuable feedback from your clients to improve your services. Create custom feedback forms and surveys.'
    },
    es: {
      title: 'Solicitud de Comentarios',
      description: 'Recopila comentarios valiosos de tus clientes para mejorar tus servicios. Crea formularios de comentarios y encuestas personalizadas.'
    }
  },
  'signature_request': {
    it: {
      title: 'Richiesta Firma',
      description: 'Ottieni firme digitali su contratti e documenti. Sicuro, legalmente vincolante e facile da usare.'
    },
    en: {
      title: 'Signature Request',
      description: 'Get digital signatures on contracts and documents. Secure, legally binding, and easy to use.'
    },
    es: {
      title: 'Solicitud de Firma',
      description: 'Obtén firmas digitales en contratos y documentos. Seguro, legalmente vinculante y fácil de usar.'
    }
  },
  'generic_message': {
    it: {
      title: 'Messaggio Generico',
      description: 'Comunica informazioni importanti ai tuoi clienti con messaggi chiari e diretti. Mantieni tutti aggiornati su novità, cambiamenti o informazioni essenziali.'
    },
    en: {
      title: 'Generic Message',
      description: 'Communicate important information to your clients with clear and direct messages. Keep everyone updated on news, changes, or essential information.'
    },
    es: {
      title: 'Mensaje Genérico',
      description: 'Comunica información importante a tus clientes con mensajes claros y directos. Mantén a todos actualizados sobre noticias, cambios o información esencial.'
    }
  },
  'approval_request': {
    it: {
      title: 'Richiesta Approvazione',
      description: 'Gestisci il processo di approvazione in modo strutturato. Richiedi approvazioni per decisioni importanti e mantieni traccia dello stato di ogni richiesta.'
    },
    en: {
      title: 'Approval Request',
      description: 'Manage the approval process in a structured way. Request approvals for important decisions and track the status of each request.'
    },
    es: {
      title: 'Solicitud de Aprobación',
      description: 'Gestiona el proceso de aprobación de manera estructurada. Solicita aprobaciones para decisiones importantes y rastrea el estado de cada solicitud.'
    }
  },
  'checklist': {
    it: {
      title: 'Checklist',
      description: 'Crea liste di controllo personalizzate per guidare i tuoi clienti attraverso processi complessi. Assicurati che nulla venga dimenticato.'
    },
    en: {
      title: 'Checklist',
      description: 'Create custom checklists to guide your clients through complex processes. Ensure nothing gets forgotten.'
    },
    es: {
      title: 'Lista de Verificación',
      description: 'Crea listas de verificación personalizadas para guiar a tus clientes a través de procesos complejos. Asegúrate de que nada se olvide.'
    }
  },
  'resource_link': {
    it: {
      title: 'Link Risorsa',
      description: 'Condividi risorse utili, documenti, video e link con i tuoi clienti. Centralizza l\'accesso a tutto ciò che serve per completare il servizio.'
    },
    en: {
      title: 'Resource Link',
      description: 'Share useful resources, documents, videos, and links with your clients. Centralize access to everything needed to complete the service.'
    },
    es: {
      title: 'Enlace de Recurso',
      description: 'Comparte recursos útiles, documentos, videos y enlaces con tus clientes. Centraliza el acceso a todo lo necesario para completar el servicio.'
    }
  },

  'media_upload': {
    it: {
      title: 'Carica Foto/Video',
      description: 'Richiedi ai tuoi clienti di caricare foto o video per documentare il servizio. Semplifica la raccolta di prove visive e documentazione.'
    },
    en: {
      title: 'Media Upload',
      description: 'Request your clients to upload photos or videos to document the service. Simplify the collection of visual evidence and documentation.'
    },
    es: {
      title: 'Carga de Medios',
      description: 'Solicita a tus clientes que suban fotos o videos para documentar el servicio. Simplifica la recopilación de evidencia visual y documentación.'
    }
  }
};

// Feature metadata for landing page
export const featureMetadata = {
  'appointment_scheduling': {
    image: "/landing/features/appointment-feature.webp",
    gradient: "from-gray-400 to-gray-600"
  },
  'payment_request': {
    image: "/landing/features/payment-feature.webp",
    gradient: "from-gray-500 to-gray-700"
  },
  'information_request': {
    image: "/landing/features/info-feature.webp",
    gradient: "from-gray-300 to-gray-500"
  },
  'document_download': {
    image: "/landing/features/document-feature.webp",
    gradient: "from-gray-600 to-gray-800"
  },
  'milestone_update': {
    image: "/landing/features/milestone-feature.webp",
    gradient: "from-gray-400 to-gray-600"
  },
  'feedback_request': {
    image: "/landing/features/feedback-feature.webp",
    gradient: "from-gray-500 to-gray-700"
  },
  'signature_request': {
    image: "/landing/features/signature-feature.webp",
    gradient: "from-gray-300 to-gray-500"
  },
  'generic_message': {
    image: "/landing/features/message-feature.webp",
    gradient: "from-gray-400 to-gray-600"
  },
  'approval_request': {
    image: "/landing/features/approval-feature.webp",
    gradient: "from-gray-500 to-gray-700"
  },
  'checklist': {
    image: "/landing/features/checklist-feature.webp",
    gradient: "from-gray-300 to-gray-500"
  },
  'resource_link': {
    image: "/landing/features/resource-feature.webp",
    gradient: "from-gray-600 to-gray-800"
  },

  'media_upload': {
    image: "/landing/features/media-upload-feature.webp",
    gradient: "from-gray-500 to-gray-700"
  }
};

// Features array for the landing page
export const features = [
  { id: 1, key: 'information_request' },
  { id: 2, key: 'payment_request' },
  { id: 3, key: 'appointment_scheduling' },
  { id: 4, key: 'resource_link' },
  { id: 5, key: 'document_download' },

  { id: 7, key: 'approval_request' },
  { id: 8, key: 'signature_request' },
  { id: 9, key: 'checklist' },
  { id: 10, key: 'milestone_update' },
  { id: 11, key: 'generic_message' },
  { id: 12, key: 'feedback_request' },
  { id: 13, key: 'media_upload' }
];

// Helper function for SectionActions - LONGER descriptions with metadata
export function getFeatureData(featureKey: string, locale: string = 'it') {
  const translation = landingPageTranslations[featureKey as keyof typeof landingPageTranslations];
  if (!translation) {
    return {
      title: featureKey,
      description: '',
      image: '/landing/features/default-feature.webp',
      gradient: 'from-gray-400 to-gray-600'
    };
  }
  
  const localeTranslation = translation[locale as keyof typeof translation] || translation.it;
  const metadata = featureMetadata[featureKey as keyof typeof featureMetadata];
  
  return {
    ...localeTranslation,
    ...metadata
  };
}

// Export everything from action-configs for backward compatibility
export * from './action-configs'; 