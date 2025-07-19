// Action template translations
export const actionTemplateTranslations = {
  'appointment_scheduling': {
    it: {
      title: 'Pianificazione Appuntamento',
      description: 'Programma un appuntamento con il cliente'
    },
    en: {
      title: 'Appointment Scheduling',
      description: 'Schedule an appointment with the client'
    }
  },
  'payment_request': {
    it: {
      title: 'Richiesta Pagamento',
      description: 'Richiedi un pagamento al cliente'
    },
    en: {
      title: 'Payment Request',
      description: 'Request a payment from the client'
    }
  },
  'information_request': {
    it: {
      title: 'Richiesta Informazioni',
      description: 'Richiedi informazioni specifiche al cliente'
    },
    en: {
      title: 'Information Request',
      description: 'Request specific information from the client'
    }
  },
  'document_download': {
    it: {
      title: 'Download Documento',
      description: 'Condividi un documento con il cliente'
    },
    en: {
      title: 'Document Download',
      description: 'Share a document with the client'
    }
  },
  'milestone_update': {
    it: {
      title: 'Aggiornamento Milestone',
      description: 'Aggiorna lo stato di un milestone'
    },
    en: {
      title: 'Milestone Update',
      description: 'Update the status of a milestone'
    }
  },
  'generic_message': {
    it: {
      title: 'Messaggio Generico',
      description: 'Invia un messaggio informativo al cliente'
    },
    en: {
      title: 'Generic Message',
      description: 'Send an informational message to the client'
    }
  },
  'signature_request': {
    it: {
      title: 'Richiesta Firma',
      description: 'Richiedi una firma su un documento'
    },
    en: {
      title: 'Signature Request',
      description: 'Request a signature on a document'
    }
  },
  'approval_request': {
    it: {
      title: 'Richiesta Approvazione',
      description: 'Richiedi l\'approvazione per qualcosa'
    },
    en: {
      title: 'Approval Request',
      description: 'Request approval for something'
    }
  },
  'feedback_request': {
    it: {
      title: 'Richiesta Feedback',
      description: 'Raccogli feedback dal cliente'
    },
    en: {
      title: 'Feedback Request',
      description: 'Collect feedback from the client'
    }
  },
  'resource_link': {
    it: {
      title: 'Link Risorsa',
      description: 'Condividi un link a una risorsa'
    },
    en: {
      title: 'Resource Link',
      description: 'Share a link to a resource'
    }
  },
  'checklist': {
    it: {
      title: 'Checklist',
      description: 'Crea una lista di controllo'
    },
    en: {
      title: 'Checklist',
      description: 'Create a checklist'
    }
  },
  'video_message': {
    it: {
      title: 'Messaggio Video',
      description: 'Condividi un messaggio video'
    },
    en: {
      title: 'Video Message',
      description: 'Share a video message'
    }
  },
  'opt_in_request': {
    it: {
      title: 'Richiesta Opt-in',
      description: 'Richiedi il consenso per un servizio'
    },
    en: {
      title: 'Opt-in Request',
      description: 'Request consent for a service'
    }
  }
};

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