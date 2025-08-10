import React, { useEffect } from 'react';
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
  createFieldConfig('document_method', 'select_cards', true, {
    label: 'Metodo documento',
    placeholder: 'Seleziona come fornire il documento',
    cardOptions: [
      { 
        key: 'upload', 
        label: 'Carica Documento',
        color: 'bg-blue-50 hover:bg-blue-100'
      },
      { 
        key: 'email', 
        label: 'Documento Via Email',
        color: 'bg-green-50 hover:bg-green-100'
      }
    ]
  }),
  createFieldConfig('document_file', 'file_upload', true, {
    label: 'Carica documento',
    placeholder: 'Trascina qui il file o clicca per selezionare (PDF, DOCX, XLSX • max 10 MB)',
    fileUpload: {
      acceptedTypes: ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/msword','application/vnd.ms-excel'],
      maxSize: 10 * 1024 * 1024, // 10MB
      multiple: false
    },
    conditional: {
      dependsOn: 'document_method',
      showWhen: (v: any) => v === 'upload'
    }
  }),
  createFieldConfig('email_address', 'text', true, {
    label: 'Indirizzo email',
    placeholder: 'Inserisci l\'indirizzo email dove è stato inviato il documento',
    conditional: {
      dependsOn: 'document_method',
      showWhen: (v: any) => v === 'email'
    }
  }),
  createFieldConfig('email_date', 'text', true, {
    label: 'Data invio email',
    placeholder: 'YYYY-MM-DD',
    inputType: 'date',
    conditional: {
      dependsOn: 'document_method',
      showWhen: (v: any) => v === 'email'
    }
  }),
  createFieldConfig('add_urgency', 'checkbox', false, {
    label: 'Aggiungi livello di urgenza'
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
    ],
    conditional: {
      dependsOn: 'add_urgency',
      showWhen: (v: any) => v === true
    }
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
  boardRef?: string; // Optional board reference for service board context
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
  boardRef,
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

  // Set default document method to 'upload' if not set
  useEffect(() => {
    if (!formData.document_method) {
      handleFieldChange('document_method', 'upload');
    }
  }, [formData.document_method, handleFieldChange]);

  // Prefill document_title with the selected file name (without extension)
  useEffect(() => {
    const files: File[] = Array.isArray(formData.document_file) ? formData.document_file : [];
    if (files.length > 0) {
      const name = files[0]?.name || '';
      const base = name.replace(/\.[^.]+$/, '') || name;
      if (!formData.document_title) {
        handleFieldChange('document_title', base);
      }
    }
  }, [formData.document_file, formData.document_title, handleFieldChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Handle based on document method
    if (formData.document_method === 'upload') {
      // Handle file upload if document_file is present
      if (formData.document_file && Array.isArray(formData.document_file) && formData.document_file.length > 0) {
        try {
          // For service board context, we need to create the action first, then upload the file
          if (boardRef) {
            // Create placeholder action first
            const initialDetails = {
              document_name: formData.document_title || 'Documento',
              document_method: 'upload',
              signature_status: 'pending'
            };
            
            const createResp = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action_type: 'signature_request',
                action_details: initialDetails,
                action_title: formData.action_title || 'Richiesta Firma',
                action_description: formData.action_description || 'Documento da firmare'
              }),
            });
            
            if (!createResp.ok) {
              const err = await createResp.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to create action for document upload');
            }
            
            const created = await createResp.json();

            // Upload the file using the action_id
            const file = formData.document_file[0];
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('board_ref', boardRef);

            const uploadResponse = await fetch(`/api/service-board/actions/${created.action_id}/document-upload`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              console.error('File upload failed:', errorData);
              return;
            }

            const uploadResult = await uploadResponse.json();
            
            // Update form data with uploaded file info and action details
            const updatedFormData = {
              ...formData,
              document_file: uploadResult.action_details?.download_url || uploadResult.document_url,
              document_title: formData.document_title || uploadResult.document_name,
              action_id: created.action_id,
              action_details: uploadResult.action_details
            };

            onSubmit(updatedFormData);
          } else {
            // For business dashboard context, use the old flow
            const file = formData.document_file[0];
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('actionType', 'signature_request');

            const uploadResponse = await fetch(`/api/business/${businessId}/document-upload`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              console.error('File upload failed:', errorData);
              return;
            }

            const uploadResult = await uploadResponse.json();
            
            // Update form data with uploaded file info
            const updatedFormData = {
              ...formData,
              document_file: uploadResult.document_url,
              document_title: formData.document_title || uploadResult.document_name
            };

            onSubmit(updatedFormData);
          }
        } catch (error) {
          console.error('File upload error:', error);
          return;
        }
      } else {
        // No file to upload, submit directly
        onSubmit(formData);
      }
    } else if (formData.document_method === 'email') {
      // For email method, submit with email details
      const emailFormData = {
        ...formData,
        document_method: 'email',
        email_address: formData.email_address,
        email_date: formData.email_date
      };
      onSubmit(emailFormData);
    } else {
      // Fallback
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
