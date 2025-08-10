import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for media_upload
const mediaUploadFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le chiediamo di caricare...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente cosa deve caricare'
  }),
  createFieldConfig('upload_type', 'select_cards', true, {
    label: 'Tipo di upload',
    placeholder: 'Seleziona il tipo di file',
    cardOptions: [
      { 
        key: 'image', 
        label: 'Immagine',
        color: 'bg-indigo-50 hover:bg-indigo-100'
      },
      { 
        key: 'document', 
        label: 'Documento',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'video', 
        label: 'Video',
        color: 'bg-purple-50 hover:bg-purple-100'
      },
      { 
        key: 'audio', 
        label: 'Audio',
        color: 'bg-pink-50 hover:bg-pink-100'
      }
    ]
  }),
  createFieldConfig('file_upload', 'file_upload', true, {
    label: 'Carica file',
    placeholder: 'Trascina qui i file o clicca per selezionare',
    fileUpload: {
      acceptedTypes: ['image/*', 'application/pdf', 'video/*'],
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: true
    }
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'media_upload',
  'Upload Media',
  'Chiedi al cliente di caricare file o media',
  '/icons/sanity/upload.svg',
  'bg-teal-100',
  [1, 2, 3],
  mediaUploadFields
));

export interface MediaUploadFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MediaUploadForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: MediaUploadFormProps) {
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
