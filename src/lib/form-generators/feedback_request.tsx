import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for feedback_request
const feedbackRequestFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le chiediamo un feedback su...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente perché chiedi questo feedback'
  }),
  createFieldConfig('feedback_source', 'select_cards', true, {
    label: 'Fonte del feedback',
    placeholder: 'Seleziona la fonte del feedback',
    cardOptions: [
      { 
        key: 'platform_reviews', 
        label: 'Recensioni piattaforma',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'survey', 
        label: 'Sondaggio',
        color: 'bg-green-50 hover:bg-green-100'
      }
    ]
  }),
  createFieldConfig('platform_type', 'select_cards', false, {
    label: 'Tipo di piattaforma',
    placeholder: 'Seleziona la piattaforma',
    conditional: {
      dependsOn: 'feedback_source',
      showWhen: (value) => value === 'platform_reviews'
    },
    cardOptions: [
      { 
        key: 'google', 
        label: 'Google Review',
        color: 'bg-red-50 hover:bg-red-100'
      },
      { 
        key: 'trustpilot', 
        label: 'Trustpilot',
        color: 'bg-green-50 hover:bg-green-100'
      },
      { 
        key: 'tripadvisor', 
        label: 'TripAdvisor',
        color: 'bg-blue-50 hover:bg-blue-100'
      }
    ]
  }),
  createFieldConfig('survey_type', 'select_cards', false, {
    label: 'Tipo di sondaggio',
    placeholder: 'Seleziona il tipo di sondaggio',
    conditional: {
      dependsOn: 'feedback_source',
      showWhen: (value) => value === 'survey'
    },
    cardOptions: [
      { 
        key: 'external_survey', 
        label: 'Sondaggio esterno',
        color: 'bg-purple-50 hover:bg-purple-100'
      },
      { 
        key: 'my_survey', 
        label: 'Il mio sondaggio',
        color: 'bg-pink-50 hover:bg-pink-100'
      }
    ]
  }),
  createFieldConfig('feedback_questions', 'question_array', false, {
    label: 'Domande di feedback',
    placeholder: 'Definisci le domande da porre',
    conditional: {
      dependsOn: 'survey_type',
      showWhen: (value) => value === 'my_survey'
    },
    planLimits: {
      maxQuestions: 10
    }
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'feedback_request',
  'Richiesta Feedback',
  'Chiedi al cliente un feedback su un servizio o prodotto',
  '/icons/sanity/feedback.svg',
  'bg-pink-100',
  [1, 2, 3],
  feedbackRequestFields
));

export interface FeedbackRequestFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FeedbackRequestForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: FeedbackRequestFormProps) {
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
