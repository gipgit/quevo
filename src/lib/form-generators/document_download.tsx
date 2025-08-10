import React from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define the field configuration for document_download
const documentDownloadFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le forniamo il documento...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente il contenuto del documento'
  }),
  createFieldConfig('document_file', 'file_upload', true, {
    label: 'Carica documento',
    placeholder: 'Trascina qui il file o clicca per selezionare (PDF, DOCX, XLSX • max 10 MB)',
    fileUpload: {
      acceptedTypes: ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/msword','application/vnd.ms-excel'],
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: false
    }
  }),
  createFieldConfig('document_title', 'text', true, {
    label: 'Titolo del documento',
    placeholder: 'Inserisci il titolo del documento'
  }),
  createFieldConfig('add_password', 'checkbox', false, {
    label: 'Aggiungi password'
  }),
  createFieldConfig('download_password', 'text', false, {
    label: 'Password di download (opzionale)',
    placeholder: 'Imposta una password per proteggere il download',
    ui: { helpText: 'Se impostata, servirà per scaricare il documento dal board' },
    conditional: {
      dependsOn: 'add_password',
      showWhen: (v: any) => v === true
    }
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'document_download',
  'Download Documento',
  'Fornisci al cliente un documento da scaricare',
  '/icons/sanity/document.svg',
  'bg-orange-100',
  [1, 2, 3],
  documentDownloadFields
));

export interface DocumentDownloadFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DocumentDownloadForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: DocumentDownloadFormProps) {
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

  // Prefill document_title with the selected file name (without extension)
  React.useEffect(() => {
    const files: File[] = Array.isArray(formData.document_file) ? formData.document_file : [];
    if (files.length > 0) {
      const name = files[0]?.name || '';
      const base = name.replace(/\.[^.]+$/, '') || name;
      if (!formData.document_title) {
        handleFieldChange('document_title', base);
      }
    }
  }, [formData.document_file, formData.document_title, handleFieldChange]);

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
