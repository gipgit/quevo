import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for resource_link
const resourceLinkFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le forniamo il link a...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente il contenuto del link'
  }),
  createFieldConfig('resource_url', 'url', true, {
    label: 'URL della risorsa',
    placeholder: 'https://example.com/resource'
  }),
  createFieldConfig('resource_type', 'select_cards', false, {
    label: 'Tipo di risorsa',
    placeholder: 'Seleziona il tipo di risorsa',
    cardOptions: [
      { 
        key: 'website', 
        label: 'Sito web',
        description: 'Pagina web o portale online',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'video', 
        label: 'Video',
        description: 'Video tutorial o contenuto multimediale',
        color: 'bg-purple-50 hover:bg-purple-100'
      },
      { 
        key: 'document', 
        label: 'Documento',
        description: 'Documento di riferimento',
        color: 'bg-red-50 hover:bg-red-100'
      },
      { 
        key: 'tool', 
        label: 'Strumento',
        description: 'Strumento o applicazione online',
        color: 'bg-green-50 hover:bg-green-100'
      },
      { 
        key: 'other', 
        label: 'Altro',
        description: 'Altra tipologia di risorsa',
        color: 'bg-gray-50 hover:bg-gray-100'
      }
    ]
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'resource_link',
  'Link Risorsa',
  'Fornisci al cliente un link a una risorsa utile',
  '/icons/sanity/link.svg',
  'bg-yellow-100',
  [1, 2, 3],
  resourceLinkFields
));

export interface ResourceLinkFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ResourceLinkForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: ResourceLinkFormProps) {
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
