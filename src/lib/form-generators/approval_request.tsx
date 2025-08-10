import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for approval_request
const approvalRequestFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le richiediamo l\'approvazione per...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente cosa deve approvare'
  }),
  createFieldConfig('approval_type', 'select_cards', true, {
    label: 'Tipo di approvazione',
    placeholder: 'Seleziona il tipo di approvazione',
    cardOptions: [
      { 
        key: 'document', 
        label: 'Documento'
      },
      { 
        key: 'proposal', 
        label: 'Proposta'
      },
      { 
        key: 'change', 
        label: 'Modifica'
      },
      { 
        key: 'decision', 
        label: 'Decisione'
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
        description: 'Non urgente, può attendere',
        color: 'bg-green-100 hover:bg-green-200'
      },
      { 
        key: 'medium', 
        label: 'Media',
        description: 'Da completare entro breve',
        color: 'bg-yellow-100 hover:bg-yellow-200'
      },
      { 
        key: 'high', 
        label: 'Alta',
        description: 'Richiede attenzione immediata',
        color: 'bg-red-100 hover:bg-red-200'
      }
    ]
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'approval_request',
  'Richiesta Approvazione',
  'Richiedi al cliente l\'approvazione di qualcosa',
  '/icons/sanity/approval.svg',
  'bg-red-100',
  [1, 2, 3],
  approvalRequestFields
));

export interface ApprovalRequestFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ApprovalRequestForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: ApprovalRequestFormProps) {
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
          .map((field: { name: string }) => renderField(field))}

        {/* Submit button */}
        <SubmitButton isSubmitting={isSubmitting} disabled={disabled} />
      </div>
    </form>
  );
}
