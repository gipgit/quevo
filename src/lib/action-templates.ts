// Action template translations, icons, colors, and feature data
// Unified file combining action-templates.ts and action-icons.ts

// Action type to icon mapping
export const ACTION_TYPE_ICONS: Record<string, string> = {
  'generic_message': '/icons/sanity/info-outline.svg',
  'payment_request': '/icons/payments/pos.svg',
  'appointment_scheduling': '/icons/sanity/calendar.svg',
  'information_request': '/icons/sanity/help-circle.svg',
  'document_download': '/icons/sanity/download.svg',
  'signature_request': '/icons/sanity/edit.svg',
  'approval_request': '/icons/sanity/checkmark-circle.svg',
  'feedback_request': '/icons/sanity/comment.svg',
  'milestone_update': '/icons/sanity/trend-upward.svg',
  'resource_link': '/icons/sanity/link.svg',
  'checklist': '/icons/sanity/checkmark.svg',
  'share_video': '/icons/sanity/video.svg',
  'opt_in_request': '/icons/sanity/checkmark.svg'
};

// Action type to color mapping
export const ACTION_TYPE_COLORS: Record<string, string> = {
  'generic_message': 'bg-blue-100',
  'payment_request': 'bg-green-100',
  'appointment_scheduling': 'bg-purple-100',
  'information_request': 'bg-yellow-100',
  // Use commonly referenced colors to avoid purge issues
  'document_download': 'bg-blue-50',
  'signature_request': 'bg-red-100',
  'approval_request': 'bg-orange-100',
  'feedback_request': 'bg-blue-100',
  'milestone_update': 'bg-green-100',
  'resource_link': 'bg-cyan-100',
  'checklist': 'bg-blue-50',
  'share_video': 'bg-purple-100',
  'opt_in_request': 'bg-lime-100'
};

// Helper function to get icon and color for an action type
export const getActionIconAndColor = (actionType: string) => {
  return {
    icon: ACTION_TYPE_ICONS[actionType] || '/icons/sanity/info-outline.svg',
    color: ACTION_TYPE_COLORS[actionType] || 'bg-blue-100'
  };
};

// Action template translations - SHORT descriptions for AddActionModal (users already familiar)
export const actionTemplateTranslations = {
  'appointment_scheduling': {
    it: {
      title: 'Pianificazione Appuntamento',
      description: 'Crea appuntamenti e gestisci prenotazioni con i tuoi clienti.'
    },
    en: {
      title: 'Appointment Scheduling',
      description: 'Create appointments and manage bookings with your clients.'
    },
    es: {
      title: 'Programación de Citas',
      description: 'Crea citas y gestiona reservas con tus clientes.'
    }
  },
  'payment_request': {
    it: {
      title: 'Richiesta Pagamento',
      description: 'Invia richieste di pagamento sicure ai tuoi clienti.'
    },
    en: {
      title: 'Payment Request',
      description: 'Send secure payment requests to your clients.'
    },
    es: {
      title: 'Solicitud de Pago',
      description: 'Envía solicitudes de pago seguras a tus clientes.'
    }
  },
  'information_request': {
    it: {
      title: 'Richiesta Informazioni',
      description: 'Raccogli informazioni dai tuoi clienti tramite moduli personalizzati.'
    },
    en: {
      title: 'Information Request',
      description: 'Collect information from your clients through custom forms.'
    },
    es: {
      title: 'Solicitud de Información',
      description: 'Recopila información de tus clientes a través de formularios personalizados.'
    }
  },
  'document_download': {
    it: {
      title: 'Download Documento',
      description: 'Condividi documenti e file in modo sicuro con i tuoi clienti.'
    },
    en: {
      title: 'Document Download',
      description: 'Securely share documents and files with your clients.'
    },
    es: {
      title: 'Descarga de Documento',
      description: 'Comparte documentos y archivos de forma segura con tus clientes.'
    }
  },
  'milestone_update': {
    it: {
      title: 'Aggiornamento Traguardo',
      description: 'Comunica i progressi del progetto ai tuoi clienti.'
    },
    en: {
      title: 'Milestone Update',
      description: 'Communicate project progress to your clients.'
    },
    es: {
      title: 'Actualización de Hito',
      description: 'Comunica el progreso del proyecto a tus clientes.'
    }
  },
  'feedback_request': {
    it: {
      title: 'Richiesta Feedback',
      description: 'Raccogli feedback e opinioni dai tuoi clienti.'
    },
    en: {
      title: 'Feedback Request',
      description: 'Gather feedback and opinions from your clients.'
    },
    es: {
      title: 'Solicitud de Comentarios',
      description: 'Recopila comentarios y opiniones de tus clientes.'
    }
  },
  'signature_request': {
    it: {
      title: 'Richiesta Firma',
      description: 'Ottieni firme digitali su contratti e documenti.'
    },
    en: {
      title: 'Signature Request',
      description: 'Get digital signatures on contracts and documents.'
    },
    es: {
      title: 'Solicitud de Firma',
      description: 'Obtén firmas digitales en contratos y documentos.'
    }
  },
  'generic_message': {
    it: {
      title: 'Messaggio Generico',
      description: 'Invia messaggi informativi ai tuoi clienti.'
    },
    en: {
      title: 'Generic Message',
      description: 'Send informational messages to your clients.'
    },
    es: {
      title: 'Mensaje Genérico',
      description: 'Envía mensajes informativos a tus clientes.'
    }
  },
  'approval_request': {
    it: {
      title: 'Richiesta Approvazione',
      description: 'Richiedi approvazioni per decisioni importanti.'
    },
    en: {
      title: 'Approval Request',
      description: 'Request approvals for important decisions.'
    },
    es: {
      title: 'Solicitud de Aprobación',
      description: 'Solicita aprobaciones para decisiones importantes.'
    }
  },
  'checklist': {
    it: {
      title: 'Checklist',
      description: 'Crea liste di controllo per i tuoi clienti.'
    },
    en: {
      title: 'Checklist',
      description: 'Create checklists for your clients.'
    },
    es: {
      title: 'Lista de Verificación',
      description: 'Crea listas de verificación para tus clientes.'
    }
  },
  'resource_link': {
    it: {
      title: 'Link Risorsa',
      description: 'Condividi link a risorse utili con i tuoi clienti.'
    },
    en: {
      title: 'Resource Link',
      description: 'Share useful resource links with your clients.'
    },
    es: {
      title: 'Enlace de Recurso',
      description: 'Comparte enlaces de recursos útiles con tus clientes.'
    }
  },
  'share_video': {
    it: {
      title: 'Condividi Video',
      description: 'Condividi video informativi con i tuoi clienti.'
    },
    en: {
      title: 'Share Video',
      description: 'Share informational videos with your clients.'
    },
    es: {
      title: 'Compartir Video',
      description: 'Comparte videos informativos con tus clientes.'
    }
  }
};

// Landing page translations - LONGER descriptions for SectionActions (new visitors)
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
      title: 'Aggiornamento Traguardo',
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
  'share_video': {
    it: {
      title: 'Condividi Video',
      description: 'Condividi video informativi, tutorial e contenuti educativi con i tuoi clienti. Migliora la comprensione attraverso contenuti visivi coinvolgenti.'
    },
    en: {
      title: 'Share Video',
      description: 'Share informational videos, tutorials, and educational content with your clients. Improve understanding through engaging visual content.'
    },
    es: {
      title: 'Compartir Video',
      description: 'Comparte videos informativos, tutoriales y contenido educativo con tus clientes. Mejora la comprensión a través de contenido visual atractivo.'
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
  'share_video': {
    image: "/landing/features/share-video-feature.webp",
    gradient: "from-gray-400 to-gray-600"
  }
};

// Features array for the landing page
export const features = [
  {
    id: 1,
    key: 'information_request'
  },
  {
    id: 2,
    key: 'payment_request'
  },
  {
    id: 3,
    key: 'appointment_scheduling'
  },
  {
    id: 4,
    key: 'resource_link'
  },
  {
    id: 5,
    key: 'document_download'
  },
  {
    id: 6,
    key: 'share_video'
  },
  {
    id: 7,
    key: 'approval_request'
  },
  {
    id: 8,
    key: 'signature_request'
  },
  {
    id: 9,
    key: 'checklist'
  },
  {
    id: 10,
    key: 'milestone_update'
  },
  {
    id: 11,
    key: 'generic_message'
  },
  {
    id: 12,
    key: 'feedback_request'
  }
];

// Helper function for AddActionModal - SHORT descriptions
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

// Unified function to get action templates for AddActionModal
export function getActionTemplatesForModal(plan: number = 1, locale: string = 'it') {
  const { getAvailableActionsForPlan, getPlanLimits } = require('./form-generators/shared/config');
  
  const availableActions = getAvailableActionsForPlan(plan);
  
  return availableActions.map((config: any) => {
    const translation = getActionTemplateTranslation(config.actionType, locale);
    return {
      template_id: config.actionType,
      template_name_key: config.actionType,
      action_type: config.actionType,
      translated_title: translation.title,
      translated_description: translation.description,
      icon: config.icon,
      color: config.color,
      is_available_for_current_plan: true,
      plan_limits: getPlanLimits(config.actionType, plan),
      display_order: 0
    };
  });
}

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

// Form field placeholders - Messages from business to customer
// formFieldPlaceholders moved to unified-action-system.ts (localized). Legacy helpers removed.