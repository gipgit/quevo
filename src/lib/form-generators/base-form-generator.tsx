import React, { useState } from 'react';
import { getFormFieldPlaceholders } from '../unified-action-system';
import { getActionConfig } from './shared/config';
import { FieldRenderer } from '../form-field-renderers';

export interface BaseFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface BaseFormState {
  formData: any;
  errors: Record<string, string>;
  handleFieldChange: (fieldName: string, value: unknown) => void;
  validateForm: () => boolean;
  handleSubmit: (e: React.FormEvent) => any;
  shouldShowField: (field: any) => boolean;
  renderField: (field: any) => JSX.Element;
  actionConfig: any;
  formPlaceholders: any;
}

export function useBaseForm(
  actionType: string,
  locale: string = 'it',
  additionalInitialData: any = {}
): BaseFormState {
  const actionConfig = getActionConfig(actionType);
  const formPlaceholders = React.useMemo(() => getFormFieldPlaceholders(actionType, locale), [actionType, locale]);
  
  // Initialize form data with placeholders
  const [formData, setFormData] = useState<any>(() => {
    const initialData: any = {
      action_title: formPlaceholders?.action_title || '',
      action_description: formPlaceholders?.action_description || '',
      ...additionalInitialData
    };
    
    // Initialize other fields with default values
    if (actionConfig) {
      actionConfig.fields.forEach(field => {
        if (!['action_title', 'action_description'].includes(field.name)) {
          switch (field.type) {
            case 'checkbox':
              initialData[field.name] = false;
              break;
            case 'item_array':
            case 'field_array':
            case 'question_array':
              initialData[field.name] = [];
              break;
            case 'select_cards':
              initialData[field.name] = field.validation?.multiSelect ? [] : '';
              break;
            case 'number':
              initialData[field.name] = field.validation?.min || 0;
              break;
            default:
              initialData[field.name] = '';
          }
        }
      });
    }
    
    return initialData;
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Helper: is field currently visible respecting conditional rules
    const isFieldVisible = (field: any): boolean => {
      if (!field?.conditional) return true;
      const dependsOnValue = formData[field.conditional.dependsOn];
      try {
        return field.conditional.showWhen(dependsOnValue);
      } catch {
        return true;
      }
    };

    // Validate required fields when visible
    actionConfig?.fields.forEach((field: any) => {
      if (!field.required) return;
      if (!isFieldVisible(field)) return; // skip hidden conditional fields

      const value = formData[field.name];

      let isEmpty = false;
      if (typeof value === 'string') {
        isEmpty = value.trim().length === 0;
      } else if (Array.isArray(value)) {
        isEmpty = value.length === 0;
      } else if (typeof value === 'number') {
        isEmpty = value === null || Number.isNaN(value);
      } else if (typeof value === 'boolean') {
        // For required checkboxes, require true
        isEmpty = value !== true;
      } else {
        isEmpty = value === null || value === undefined;
      }

      if (isEmpty) {
        newErrors[field.name] = `${field.label || field.name} è obbligatorio`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      return formData;
    }
    return null;
  };

  // Check if field should be shown based on conditional logic
  const shouldShowField = (field: any) => {
    if (!field.conditional) return true;
    
    const dependsOnValue = formData[field.conditional.dependsOn];
    return field.conditional.showWhen(dependsOnValue);
  };

  // Render individual field
  const renderField = (field: any) => {
    const fieldValue = formData[field.name] || '';
    const fieldError = errors[field.name];

    return (
      <div key={field.name} className="space-y-1">
        <FieldRenderer
          fieldName={field.name}
          config={field}
          value={fieldValue}
          onChange={(value) => handleFieldChange(field.name, value)}
          error={fieldError}
          disabled={false}
        />
      </div>
    );
  };

  return {
    formData,
    errors,
    handleFieldChange,
    validateForm,
    handleSubmit,
    shouldShowField,
    renderField,
    actionConfig,
    formPlaceholders
  };
}

// Shared form components
export const ActionTitleField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, placeholder, disabled }) => (
  <div>
    <label htmlFor="action_title" className="block text-sm font-medium text-gray-700 mb-1">
      Titolo dell'azione *
    </label>
    <input
      type="text"
      id="action_title"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      required
      placeholder={placeholder}
      disabled={disabled}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export const ActionDescriptionField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, placeholder, disabled }) => (
  <div>
    <label htmlFor="action_description" className="block text-sm font-medium text-gray-700 mb-1">
      Descrizione
    </label>
    <textarea
      id="action_description"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={2}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder={placeholder}
      disabled={disabled}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export const SubmitButton: React.FC<{
  isSubmitting?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}> = ({ isSubmitting = false, disabled = false, children = 'Crea Azione' }) => (
  <div className="flex justify-end pt-4 border-t border-gray-200">
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isSubmitting ? 'Salvataggio...' : children}
    </button>
  </div>
);
