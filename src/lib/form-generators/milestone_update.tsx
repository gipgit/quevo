import React, { useEffect } from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for milestone_update
const milestoneUpdateFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le comunichiamo l\'aggiornamento...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente il contenuto dell\'aggiornamento'
  }),
  createFieldConfig('milestone_name', 'text', true, {
    label: 'Nome del traguardo',
    placeholder: 'Inserisci il nome del traguardo'
  }),
  createFieldConfig('milestone_status', 'select', true, {
    label: 'Stato',
    placeholder: 'Seleziona lo stato',
    options: [
      { key: 'started', label: 'Iniziato' },
      { key: 'in_progress', label: 'In corso' },
      { key: 'completed', label: 'Completato' },
      { key: 'delayed', label: 'Ritardato' },
      { key: 'cancelled', label: 'Annullato' }
    ]
  }),
  createFieldConfig('start_date', 'datetime', false, {
    label: 'Data inizio',
    placeholder: 'Seleziona la data di inizio',
    conditional: {
      dependsOn: 'milestone_status',
      showWhen: (value) => value === 'started'
    }
  }),
  createFieldConfig('completion_percentage', 'number', false, {
    label: 'Percentuale di completamento',
    placeholder: 'Inserisci la percentuale (0-100)',
    validation: {
      min: 0,
      max: 100
    },
    conditional: {
      dependsOn: 'milestone_status',
      showWhen: (value) => value === 'in_progress' || value === 'delayed'
    }
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'milestone_update',
  'Aggiornamento Milestone',
  'Comunica al cliente l\'aggiornamento di un milestone',
  '/icons/sanity/milestone.svg',
  'bg-violet-100',
  [1, 2, 3],
  milestoneUpdateFields
));

export interface MilestoneUpdateFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MilestoneUpdateForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: MilestoneUpdateFormProps) {
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

  // Auto-derive completion percentage based on status selection
  useEffect(() => {
    const status = (formData as any).milestone_status;
    if (status === 'started') {
      handleFieldChange('completion_percentage', 0);
      // Auto-fill start date to now when status is started
      handleFieldChange('start_date', new Date().toISOString());
    } else if (status === 'completed') {
      handleFieldChange('completion_percentage', 100);
    } else if (status === 'cancelled') {
      handleFieldChange('completion_percentage', '');
      handleFieldChange('start_date', '');
    } else if (status === 'in_progress') {
      // No start date field for in_progress per requirement
      handleFieldChange('start_date', '');
    }
  }, [(formData as any).milestone_status]);

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
