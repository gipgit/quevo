// Action Configuration System
// Replaces ServiceBoardActionTemplate table with app-only configuration

export interface ActionFieldConfig {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'datetime' | 'select' | 'checkbox' | 'select_cards' | 'multi_select_pills' | 'item_array' | 'field_array' | 'question_array' | 'datetime_array' | 'file_upload';
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: Array<{ key: string; label: string; icon?: string; description?: string }>;
  conditional?: {
    dependsOn: string;
    showWhen: (value: any) => boolean;
  };
  dynamicOptions?: {
    source: 'business_payment_methods' | 'business_platforms' | 'custom';
    defaultOptions?: Array<{ key: string; label: string; icon?: string }>;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
    multiSelect?: boolean;
  };
  planLimits?: {
    maxItems?: number;
    maxFields?: number;
    maxQuestions?: number;
  };
  fileUpload?: {
    acceptedTypes: string[];
    maxSize: number; // in bytes
    multiple?: boolean;
  };
}

export interface ActionConfig {
  actionType: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  availablePlans: number[]; // [1, 2, 3] for all plans
  fields: ActionFieldConfig[];
  planLimits?: {
    maxChecklistItems?: number;
    maxInformationFields?: number;
    maxFeedbackQuestions?: number;
  };
}

// Action configurations - replaces ServiceBoardActionTemplate table
export const ACTION_CONFIGS: Record<string, ActionConfig> = {
  'generic_message': {
    actionType: 'generic_message',
    displayName: 'Messaggio Generico',
    description: 'Invia un messaggio informativo ai tuoi clienti',
    icon: '/icons/sanity/message.svg',
    color: 'bg-blue-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le comunichiamo che...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Inserisci qui il messaggio che vuoi inviare al cliente'
      },
      {
        name: 'message_content',
        type: 'textarea',
        required: true,
        label: 'Contenuto del messaggio',
        placeholder: 'Inserisci il contenuto del messaggio da inviare'
      },
      {
        name: 'severity',
        type: 'select',
        required: false,
        label: 'Tipo di messaggio',
        placeholder: 'Seleziona il tipo di messaggio',
        options: [
          { key: 'info', label: 'Informazione' },
          { key: 'success', label: 'Successo' },
          { key: 'warning', label: 'Avviso' },
          { key: 'error', label: 'Errore' }
        ]
      },
      {
        name: 'requires_acknowledgment',
        type: 'checkbox',
        required: false,
        label: 'Richiede conferma di lettura'
      }
    ]
  },

  'payment_request': {
    actionType: 'payment_request',
    displayName: 'Richiesta Pagamento',
    description: 'Spiega al cliente il motivo del pagamento richiesto',
    icon: '/icons/sanity/credit-card.svg',
    color: 'bg-green-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le richiediamo il pagamento per...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente il motivo del pagamento richiesto'
      },
      {
        name: 'amount',
        type: 'number',
        required: true,
        label: 'Importo',
        placeholder: 'Inserisci l\'importo da pagare',
        validation: {
          min: 0
        }
      },
      {
        name: 'payment_reason',
        type: 'textarea',
        required: false,
        label: 'Motivo del pagamento',
        placeholder: 'Spiega il motivo del pagamento'
      },
      {
        name: 'payment_methods',
        type: 'select_cards',
        required: true,
        label: 'Metodi di pagamento accettati',
        dynamicOptions: {
          source: 'business_payment_methods'
        },
        validation: {
          multiSelect: true
        }
      }
    ]
  },

  'information_request': {
    actionType: 'information_request',
    displayName: 'Richiesta Informazioni',
    description: 'Spiega al cliente quali informazioni sono necessarie',
    icon: '/icons/sanity/form.svg',
    color: 'bg-yellow-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le chiediamo di fornirci...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente quali informazioni sono necessarie'
      },
      {
        name: 'request_fields',
        type: 'field_array',
        required: true,
        label: 'Campi richiesti',
        placeholder: 'Definisci i campi del form',
        planLimits: {
          maxFields: 3 // Plan 1 limit
        }
      }
    ],
    planLimits: {
      maxInformationFields: 3
    }
  },

  'document_download': {
    actionType: 'document_download',
    displayName: 'Download Documento',
    description: 'Spiega al cliente il contenuto del documento',
    icon: '/icons/sanity/document.svg',
    color: 'bg-purple-100',
    availablePlans: [2, 3], // Not available in plan 1
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le forniamo il documento...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente il contenuto del documento'
      },
      {
        name: 'document_name',
        type: 'text',
        required: true,
        label: 'Nome del documento',
        placeholder: 'Nome del documento'
      },
      {
        name: 'document_file',
        type: 'file_upload',
        required: true,
        label: 'Carica documento',
        placeholder: 'Trascina qui il documento (PDF, DOCX, XLS, XLSX) o clicca per selezionare',
        fileUpload: {
          acceptedTypes: ['.pdf', '.docx', '.xls', '.xlsx'],
          maxSize: 8 * 1024 * 1024, // 8MB in bytes
          multiple: false
        }
      }
    ]
  },

  'media_upload': {
    actionType: 'media_upload',
    displayName: 'Carica Foto/Video',
    description: 'Richiedi al cliente di caricare foto o video',
    icon: '/icons/sanity/camera.svg',
    color: 'bg-emerald-100',
    availablePlans: [2, 3], // Not available in plan 1
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le chiediamo di caricare...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente cosa deve caricare e perché'
      },
      {
        name: 'upload_title',
        type: 'text',
        required: true,
        label: 'Titolo del caricamento',
        placeholder: 'Es. Foto del danno, Video dimostrativo...'
      },
      {
        name: 'media_type',
        type: 'select_cards',
        required: true,
        label: 'Tipo di media richiesto',
        options: [
          { key: 'photo', label: 'Solo Foto', icon: '📷' },
          { key: 'video', label: 'Solo Video', icon: '🎥' },
          { key: 'both', label: 'Foto e Video', icon: '📱' }
        ]
      },
      {
        name: 'upload_instructions',
        type: 'textarea',
        required: false,
        label: 'Istruzioni per il caricamento',
        placeholder: 'Fornisci istruzioni specifiche su cosa e come caricare'
      },
      {
        name: 'required_count',
        type: 'number',
        required: false,
        label: 'Numero minimo di file',
        placeholder: 'Numero minimo di file da caricare',
        validation: {
          min: 1,
          max: 10
        }
      },
      {
        name: 'file_upload',
        type: 'file_upload',
        required: true,
        label: 'Carica file',
        placeholder: 'Trascina qui i file o clicca per selezionare',
        fileUpload: {
          acceptedTypes: ['image/*', 'video/*'],
          maxSize: 50 * 1024 * 1024, // 50MB
          multiple: true
        }
      }
    ]
  },

  'signature_request': {
    actionType: 'signature_request',
    displayName: 'Richiesta Firma',
    description: 'Spiega al cliente il documento da firmare',
    icon: '/icons/sanity/signature.svg',
    color: 'bg-orange-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le richiediamo la firma sul documento...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente il documento da firmare'
      },
      {
        name: 'document_name',
        type: 'text',
        required: true,
        label: 'Nome del documento',
        placeholder: 'Nome del documento'
      },
      {
        name: 'document_url',
        type: 'url',
        required: true,
        label: 'URL del documento',
        placeholder: 'https://example.com/documento-da-firmare.pdf'
      },
      {
        name: 'signature_deadline',
        type: 'datetime',
        required: false,
        label: 'Scadenza per la firma'
      }
    ]
  },

  'resource_link': {
    actionType: 'resource_link',
    displayName: 'Link Risorsa',
    description: 'Spiega al cliente l\'utilità della risorsa',
    icon: '/icons/sanity/link.svg',
    color: 'bg-indigo-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le condividiamo questa risorsa...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente l\'utilità della risorsa'
      },
      {
        name: 'resource_title',
        type: 'text',
        required: true,
        label: 'Titolo della risorsa',
        placeholder: 'Titolo della risorsa'
      },
      {
        name: 'resource_url',
        type: 'url',
        required: true,
        label: 'URL della risorsa',
        placeholder: 'https://example.com/risorsa'
      },
      {
        name: 'resource_type',
        type: 'select',
        required: false,
        label: 'Tipo di risorsa',
        placeholder: 'Seleziona il tipo di risorsa',
        options: [
          { key: 'document', label: 'Documento' },
          { key: 'video', label: 'Video' },
          { key: 'image', label: 'Immagine' },
          { key: 'link', label: 'Link' }
        ]
      }
    ]
  },

  'checklist': {
    actionType: 'checklist',
    displayName: 'Checklist',
    description: 'Spiega al cliente lo scopo della checklist',
    icon: '/icons/sanity/checklist.svg',
    color: 'bg-teal-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le forniamo questa checklist per...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente lo scopo della checklist'
      },
      {
        name: 'checklist_title',
        type: 'text',
        required: true,
        label: 'Titolo della checklist',
        placeholder: 'Titolo della checklist'
      },
      {
        name: 'checklist_items',
        type: 'item_array',
        required: true,
        label: 'Elementi checklist',
        placeholder: 'Aggiungi elementi alla checklist',
        planLimits: {
          maxItems: 5 // Plan 1 limit
        }
      }
    ],
    planLimits: {
      maxChecklistItems: 5
    }
  },

  'feedback_request': {
    actionType: 'feedback_request',
    displayName: 'Richiesta Feedback',
    description: 'Spiega al cliente perché il suo feedback è importante',
    icon: '/icons/sanity/feedback.svg',
    color: 'bg-pink-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le chiediamo il suo feedback su...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente perché il suo feedback è importante'
      },
      {
        name: 'survey_title',
        type: 'text',
        required: true,
        label: 'Titolo del sondaggio',
        placeholder: 'Titolo del sondaggio'
      },
      {
        name: 'survey_url',
        type: 'url',
        required: false,
        label: 'URL del sondaggio',
        placeholder: 'https://forms.google.com/sondaggio'
      },
      {
        name: 'questions',
        type: 'question_array',
        required: false,
        label: 'Domande',
        placeholder: 'Aggiungi domande al sondaggio',
        planLimits: {
          maxQuestions: 2 // Plan 1 limit
        }
      }
    ],
    planLimits: {
      maxFeedbackQuestions: 2
    }
  },

  'approval_request': {
    actionType: 'approval_request',
    displayName: 'Richiesta Approvazione',
    description: 'Richiedi approvazioni per decisioni importanti',
    icon: '/icons/sanity/approval.svg',
    color: 'bg-red-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Gentile Cliente, Le richiediamo l\'approvazione per...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Spiega al cliente cosa richiede la sua approvazione'
      },
      {
        name: 'approval_type',
        type: 'text',
        required: true,
        label: 'Tipo di approvazione richiesta',
        placeholder: 'Tipo di approvazione richiesta'
      },
      {
        name: 'approval_details',
        type: 'textarea',
        required: true,
        label: 'Dettagli dell\'approvazione',
        placeholder: 'Dettagli dell\'approvazione'
      },
      {
        name: 'approval_deadline',
        type: 'datetime',
        required: false,
        label: 'Scadenza per l\'approvazione'
      }
    ]
  },

  'milestone_update': {
    actionType: 'milestone_update',
    displayName: 'Aggiornamento Milestone',
    description: 'Comunica i progressi del progetto',
    icon: '/icons/sanity/milestone.svg',
    color: 'bg-amber-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Es. Milestone completata, Progresso...'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Descrivi l\'aggiornamento del milestone'
      },
      {
        name: 'milestone_name',
        type: 'text',
        required: true,
        label: 'Nome del milestone',
        placeholder: 'Nome del milestone'
      },
      {
        name: 'progress_percentage',
        type: 'number',
        required: true,
        label: 'Percentuale di completamento',
        placeholder: 'Percentuale di completamento (0-100)',
        validation: {
          min: 0,
          max: 100
        }
      }
    ]
  },



  'appointment_scheduling': {
    actionType: 'appointment_scheduling',
    displayName: 'Pianificazione Appuntamento',
    description: 'Crea appuntamenti e gestisci prenotazioni',
    icon: '/icons/sanity/calendar.svg',
    color: 'bg-purple-100',
    availablePlans: [1, 2, 3],
    fields: [
      {
        name: 'action_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'azione',
        placeholder: 'Proposta appuntamento'
      },
      {
        name: 'action_description',
        type: 'textarea',
        required: false,
        label: 'Descrizione',
        placeholder: 'Gentile Cliente, Le proponiamo un appuntamento per...'
      },
      {
        name: 'appointment_title',
        type: 'text',
        required: true,
        label: 'Titolo dell\'appuntamento',
        placeholder: 'Es. Consulenza, Controllo, Visita...'
      },
      {
        name: 'appointment_type',
        type: 'select_cards',
        required: true,
        label: 'Tipo di appuntamento',
        options: [
          { key: 'in_person', label: 'In presenza', icon: '🏢' },
          { key: 'online', label: 'Online', icon: '💻' }
        ]
      },
      {
        name: 'address',
        type: 'text',
        required: true,
        label: 'Indirizzo',
        placeholder: 'Inserisci l\'indirizzo dell\'appuntamento',
        conditional: {
          dependsOn: 'appointment_type',
          showWhen: (value) => value === 'in_person'
        }
      },
      {
        name: 'platform_options',
        type: 'multi_select_pills',
        required: true,
        label: 'Piattaforme disponibili',
        dynamicOptions: {
          source: 'business_platforms',
          defaultOptions: [
            { key: 'Google Meet', label: 'Google Meet', icon: '🔗' },
            { key: 'Zoom', label: 'Zoom', icon: '📹' },
            { key: 'Microsoft Teams', label: 'Microsoft Teams', icon: '💼' },
            { key: 'Skype', label: 'Skype', icon: '📞' },
            { key: 'WhatsApp', label: 'WhatsApp', icon: '📱' },
            { key: 'Telegram', label: 'Telegram', icon: '📨' }
          ]
        },
        conditional: {
          dependsOn: 'appointment_type',
          showWhen: (value) => value === 'online'
        }
      },
      {
        name: 'appointment_mode',
        type: 'select_cards',
        required: true,
        label: 'Modalità Appuntamento',
        options: [
          { key: 'fixed_confirmed', label: 'Data fissa confermata', description: 'La data e ora sono già impostate e confermate', icon: '✓' },
          { key: 'fixed_pending_confirmation', label: 'Data fissa in attesa di conferma', description: 'La data e ora sono impostate ma necessitano conferma del cliente', icon: '⏳' },
          { key: 'multiple_choice', label: 'Lista di date da scegliere', description: 'Il cliente può scegliere tra più date e orari suggeriti', icon: '📅' }
        ]
      }
    ]
  }
};

// Helper functions
export function getActionConfig(actionType: string): ActionConfig | null {
  return ACTION_CONFIGS[actionType] || null;
}

export function getAllActionConfigs(): ActionConfig[] {
  return Object.values(ACTION_CONFIGS);
}

export function getAvailableActionsForPlan(plan: number): ActionConfig[] {
  return getAllActionConfigs().filter(config => 
    config.availablePlans.includes(plan)
  );
}

export function getPlanLimits(actionType: string, plan: number): any {
  const config = getActionConfig(actionType);
  if (!config) return null;

  // Default limits for each plan
  const defaultLimits = {
    1: { maxChecklistItems: 5, maxInformationFields: 3, maxFeedbackQuestions: 2 },
    2: { maxChecklistItems: 10, maxInformationFields: 8, maxFeedbackQuestions: 5 },
    3: { maxChecklistItems: 20, maxInformationFields: 15, maxFeedbackQuestions: 10 }
  };

  return {
    ...defaultLimits[plan as keyof typeof defaultLimits],
    ...config.planLimits
  };
} 