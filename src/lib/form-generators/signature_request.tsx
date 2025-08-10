import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for signature_request
const signatureRequestFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le richiediamo di firmare...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente cosa deve firmare'
  }),
  createFieldConfig('document_title', 'text', true, {
    label: 'Titolo del documento',
    placeholder: 'Inserisci il titolo del documento da firmare'
  }),
  createFieldConfig('document_description', 'textarea', false, {
    label: 'Descrizione del documento',
    placeholder: 'Spiega il contenuto del documento',
    ui: {
      rows: 1
    }
  }),
  createFieldConfig('signature_type', 'select_cards', true, {
    label: 'Tipo di firma',
    placeholder: 'Seleziona il tipo di firma',
    cardOptions: [
      { 
        key: 'digital', 
        label: 'Firma digitale',
        description: 'Firma con certificato digitale qualificato',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'electronic', 
        label: 'Firma elettronica',
        description: 'Firma elettronica semplice',
        color: 'bg-green-50 hover:bg-green-100'
      },
      { 
        key: 'manual', 
        label: 'Firma manuale',
        description: 'Firma a mano sul documento stampato',
        color: 'bg-yellow-50 hover:bg-yellow-100'
      }
    ]
  }),
  createFieldConfig('urgency_level', 'select_cards', false, {
    label: 'Livello di urgenza',
    placeholder: 'Seleziona il livello di urgenza',
    cardOptions: [
      { 
        key: 'low', 
        label: 'Bassa',
        color: 'bg-green-50 hover:bg-green-100'
      },
      { 
        key: 'medium', 
        label: 'Media',
        color: 'bg-yellow-50 hover:bg-yellow-100'
      },
      { 
        key: 'high', 
        label: 'Alta',
        color: 'bg-red-50 hover:bg-red-100'
      }
    ]
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'signature_request',
  'Richiesta Firma',
  'Richiedi al cliente di firmare un documento',
  '/icons/sanity/signature.svg',
  'bg-purple-100',
  [1, 2, 3],
  signatureRequestFields
));

export interface SignatureRequestFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SignatureRequestForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: SignatureRequestFormProps) {
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
          .filter(field => !['action_title', 'action_description'].includes(field.name))
          .filter(shouldShowField)
          .map(field => renderField(field))
        }

        {/* Submit button */}
        <SubmitButton isSubmitting={isSubmitting} disabled={disabled} />
      </div>
    </form>
  );
}
