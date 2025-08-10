import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

export interface GenericMessageFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

// Define the field configuration for generic_message
const genericMessageFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le comunichiamo che...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Inserisci qui il messaggio che vuoi inviare al cliente'
  }),
  createFieldConfig('message_content', 'textarea', true, {
    label: 'Contenuto del messaggio',
    placeholder: 'Inserisci il contenuto del messaggio da inviare'
  }),
  createFieldConfig('severity', 'select_cards', true, {
    label: 'Tipo di messaggio',
    placeholder: 'Seleziona il tipo di messaggio',
    cardOptions: [
      { 
        key: 'info', 
        label: 'Informazione',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'success', 
        label: 'Successo',
        color: 'bg-green-50 hover:bg-green-100'
      },
      { 
        key: 'warning', 
        label: 'Avviso',
        color: 'bg-yellow-50 hover:bg-yellow-100'
      },
      { 
        key: 'error', 
        label: 'Errore',
        color: 'bg-red-50 hover:bg-red-100'
      }
    ]
  }),
  createFieldConfig('requires_acknowledgment', 'checkbox', false, {
    label: 'Richiede conferma di lettura'
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'generic_message',
  'Messaggio Generico',
  'Invia un messaggio informativo ai tuoi clienti',
  '/icons/sanity/message.svg',
  'bg-blue-100',
  [1, 2, 3],
  genericMessageFields
));

export function GenericMessageForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: GenericMessageFormProps) {
  const {
    formData,
    errors,
    handleFieldChange,
    validateForm,
    shouldShowField,
    renderField,
    actionConfig,
    formPlaceholders
  } = useBaseForm(actionType, locale);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!actionConfig) {
    return <div>Action type not found: {actionType}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="space-y-3">
        {/* Action Title - Always present */}
        <ActionTitleField
          value={formData.action_title || ''}
          onChange={(value) => handleFieldChange('action_title', value)}
          error={errors.action_title}
          placeholder={formPlaceholders.action_title}
          disabled={disabled}
        />

        {/* Action Description - Always present */}
        <ActionDescriptionField
          value={formData.action_description || ''}
          onChange={(value) => handleFieldChange('action_description', value)}
          error={errors.action_description}
          placeholder={formPlaceholders.action_description}
          disabled={disabled}
        />

        {/* Render dynamic fields from action config */}
        {actionConfig.fields
          .filter((field: { name: string }) => !['action_title', 'action_description'].includes(field.name))
          .filter(shouldShowField)
          .map((field: { name: string }) => renderField(field))
        }

        {/* Message-specific styling for submit button */}
        {/* Submit button */}
        <SubmitButton isSubmitting={isSubmitting} disabled={disabled} />
      </div>
    </form>
  );
}
