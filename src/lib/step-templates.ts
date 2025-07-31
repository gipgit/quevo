// Step template translations and data
export const stepTemplateTranslations = {
  'step_1': {
    it: {
      title: 'Invio Richiesta',
      description: 'Il cliente invia una richiesta di servizio, indicando come contatto anche solo un indirizzo email (non servono registrazioni o altre applicazioni).',
      image: '/landing/steps/it/1.webp',
      gradient: 'from-gray-400 to-gray-600'
    },
    en: {
      title: 'Request Submission',
      description: 'The customer submits a service request, providing just an email address as contact (no registrations or other applications needed).',
      image: '/landing/steps/en/1.webp',
      gradient: 'from-gray-400 to-gray-600'
    },
    es: {
      title: 'Envío de Solicitud',
      description: 'El cliente envía una solicitud de servicio, proporcionando solo una dirección de email como contacto (no se necesitan registraciones u otras aplicaciones).',
      image: '/landing/steps/es/1.webp',
      gradient: 'from-gray-400 to-gray-600'
    }
  },
  'step_2': {
    it: {
      title: 'Board ed Email Automatiche',
      description: 'Senza fare nulla, una Service Board viene automaticamente creata e il cliente verrà subito reindirizzato alla Board, dove potrà subito vedere il riepilogo della richiesta. Sia cliente che Business, ricevono un\'email con il link della board.',
      image: '/landing/steps/it/2.webp',
      gradient: 'from-gray-500 to-gray-700'
    },
    en: {
      title: 'Automatic Board and Emails',
      description: 'Without doing anything, a Service Board is automatically created and the customer will be immediately redirected to the Board, where they can immediately see the request summary. Both customer and Business receive an email with the board link.',
      image: '/landing/steps/en/2.webp',
      gradient: 'from-gray-500 to-gray-700'
    },
    es: {
      title: 'Board y Emails Automáticos',
      description: 'Sin hacer nada, se crea automáticamente una Service Board y el cliente será inmediatamente redirigido a la Board, donde podrá ver inmediatamente el resumen de la solicitud. Tanto el cliente como el Business reciben un email con el enlace de la board.',
      image: '/landing/steps/es/2.webp',
      gradient: 'from-gray-500 to-gray-700'
    }
  },
  'step_3': {
    it: {
      title: 'Tutto Pronto',
      description: 'Fatto. Il cliente ha già il link e la Service Board è a disposizione, accessibile da qualsiasi dispositivo, usando il link che ricevi via email o ritrovando la board nella tua Area Riservata.',
      image: '/landing/steps/it/3.webp',
      gradient: 'from-gray-600 to-gray-800'
    },
    en: {
      title: 'Everything Ready',
      description: 'Done. The customer already has the link and the Service Board is available, accessible from any device, using the link you receive via email or finding the board in your Reserved Area.',
      image: '/landing/steps/en/3.webp',
      gradient: 'from-gray-600 to-gray-800'
    },
    es: {
      title: 'Todo Listo',
      description: 'Listo. El cliente ya tiene el enlace y la Service Board está disponible, accesible desde cualquier dispositivo, usando el enlace que recibes por email o encontrando la board en tu Área Reservada.',
      image: '/landing/steps/es/3.webp',
      gradient: 'from-gray-600 to-gray-800'
    }
  }
};

// Helper function to get step translation
export function getStepTranslation(stepKey: string, locale: string = 'it') {
  const step = stepTemplateTranslations[stepKey as keyof typeof stepTemplateTranslations];
  if (!step) {
    console.warn(`Step template not found for key: ${stepKey}`);
    return stepTemplateTranslations.step_1.it; // Fallback to first step in Italian
  }
  
  const translation = step[locale as keyof typeof step] || step.it;
  return translation;
}

// Helper function to get all steps for a locale
export function getStepsData(locale: string = 'it') {
  return [
    {
      id: 1,
      ...getStepTranslation('step_1', locale)
    },
    {
      id: 2,
      ...getStepTranslation('step_2', locale)
    },
    {
      id: 3,
      ...getStepTranslation('step_3', locale)
    }
  ];
} 