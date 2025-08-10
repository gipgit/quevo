/** @jsxImportSource react */
// Form Field Renderer System
// This system handles dynamic form field rendering based on database schemas

import React from 'react';
import { FieldConfig, FieldRendererProps } from './form-generators/shared/types';

// Base field renderer component
export function FieldRenderer({ 
  fieldName, 
  config, 
  value, 
  onChange, 
  error, 
  disabled = false,
  className = ''
}: FieldRendererProps): JSX.Element {
  const { type, required, label, placeholder, options, min, max, step, validation, ui } = config;
  
  const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base";
  const errorClasses = error ? "border-red-300 focus:ring-red-500" : "border-gray-300";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

  // Local UI state used for certain field types (e.g., file uploads)
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [fileLocalError, setFileLocalError] = React.useState<string | null>(null);

  const renderField = () => {
    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={classes}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
            pattern={validation?.pattern}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={ui?.rows || 3}
            className={classes}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            minLength={validation?.minLength}
            maxLength={validation?.maxLength}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={classes}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step || 1}
          />
        );

      case 'url':
        return (
          <input
            type="url"
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={classes}
            required={required}
            disabled={disabled}
            placeholder={placeholder || "https://example.com"}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={classes}
            required={required}
            disabled={disabled}
          />
        );

      case 'datetime_array':
        return (
          <div className="space-y-2">
            {value && value.length > 0 ? (
              <div className="space-y-2">
                {value.map((datetime: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <span className="text-sm">
                      {new Date(datetime).toLocaleString('it-IT')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = value.filter((_: string, i: number) => i !== index);
                        onChange(newValue);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Nessuna data selezionata
              </div>
            )}
          </div>
        );

      case 'file_upload':
        return (
          <div className="space-y-2">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : (Array.isArray(value) && value.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-gray-400')}`}
              onDragEnter={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); if (!disabled && !isDragOver) setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); if (!disabled) setIsDragOver(false); }}
              onDrop={(e) => {
                e.preventDefault()
                if (disabled) return
                const files = Array.from(e.dataTransfer.files || [])
                const accepted = new Set((config.fileUpload?.acceptedTypes || []).map(t => t.toLowerCase()))
                const maxSize = config.fileUpload?.maxSize ?? (10 * 1024 * 1024)
                const filtered = files.filter(f => (accepted.size === 0 || accepted.has((f.type || '').toLowerCase())) && f.size <= maxSize)
                setIsDragOver(false)
                if (filtered.length > 0) {
                  setFileLocalError(null)
                  onChange(filtered)
                } else {
                  const typesHint = accepted.size > 0 ? 'PDF, DOCX, XLSX' : 'formato supportato'
                  setFileLocalError(`File non accettato. Tipi consentiti: ${typesHint}${maxSize ? ` • Max ${(maxSize/(1024*1024)).toFixed(0)} MB` : ''}`)
                }
              }}
            >
              <input
                type="file"
                id={fieldName}
                multiple={config.fileUpload?.multiple}
                accept={config.fileUpload?.acceptedTypes?.join(',')}
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  const accepted = new Set((config.fileUpload?.acceptedTypes || []).map(t => t.toLowerCase()))
                  const maxSize = config.fileUpload?.maxSize ?? (10 * 1024 * 1024)
                  const filtered = files.filter(f => (accepted.size === 0 || accepted.has((f.type || '').toLowerCase())) && f.size <= maxSize)
                  if (filtered.length > 0) {
                    setFileLocalError(null)
                    onChange(filtered)
                  } else {
                    const typesHint = accepted.size > 0 ? 'PDF, DOCX, XLSX' : 'formato supportato'
                    setFileLocalError(`File non accettato. Tipi consentiti: ${typesHint}${maxSize ? ` • Max ${(maxSize/(1024*1024)).toFixed(0)} MB` : ''}`)
                  }
                }}
                className="hidden"
                disabled={disabled}
              />
              <label htmlFor={fieldName} className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {!(Array.isArray(value) && value.length > 0) && (
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  {Array.isArray(value) && value.length > 0 ? (
                    <div className="w-full max-w-md mx-auto text-left">
                      {Array.from(value).map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 mb-2 shadow-sm">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-base font-medium text-gray-900">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newValue = Array.from(value).filter((_: any, i: number) => i !== index)
                              onChange(newValue)
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        {config.placeholder || 'Trascina qui il file o clicca per selezionare'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Tipi: PDF, DOCX, XLSX • Max 10 MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            {fileLocalError && (
              <p className="text-xs text-red-600">{fileLocalError}</p>
            )}
          </div>
        )

      case 'rich_text':
        return (
          <div className="space-y-2">
            <textarea
              id={fieldName}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              rows={ui?.rows || 5}
              className={`${classes} font-mono text-sm`}
              required={required}
              disabled={disabled}
              placeholder={placeholder}
            />
            {ui?.helpText && (
              <p className="text-xs text-gray-500">{ui.helpText}</p>
            )}
          </div>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            <select
              id={fieldName}
              value={value || []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                onChange(selectedOptions);
              }}
              className={classes}
              required={required}
              disabled={disabled}
              multiple
            >
              {options?.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.key;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {ui?.helpText && (
              <p className="text-xs text-gray-500">{ui.helpText}</p>
            )}
          </div>
        );

      case 'date_range':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data inizio</label>
              <input
                type="date"
                value={value?.start || ''}
                onChange={(e) => onChange({ ...value, start: e.target.value })}
                className={classes}
                required={required}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Data fine</label>
              <input
                type="date"
                value={value?.end || ''}
                onChange={(e) => onChange({ ...value, end: e.target.value })}
                className={classes}
                required={required}
                disabled={disabled}
              />
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            id={fieldName}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={classes}
            required={required}
            disabled={disabled}
          >
            <option value="">{placeholder || 'Seleziona un\'opzione'}</option>
            {options?.map((option) => {
              // Handle both string options and object options
              const optionValue = typeof option === 'string' ? option : option.key;
              const optionLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              );
            })}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={fieldName}
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required={required}
              disabled={disabled}
            />
            {label && (
              <label htmlFor={fieldName} className="ml-2 block text-sm text-gray-700">
                {label} {required ? '*' : ''}
              </label>
            )}
          </div>
        );

      case 'time_slot':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ora inizio</label>
              <input
                type="time"
                value={value?.start || ''}
                onChange={(e) => onChange({ ...value, start: e.target.value })}
                className={classes}
                required={required}
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ora fine</label>
              <input
                type="time"
                value={value?.end || ''}
                onChange={(e) => onChange({ ...value, end: e.target.value })}
                className={classes}
                required={required}
                disabled={disabled}
              />
            </div>
          </div>
        );

      case 'select_cards':
        return (
          <div className={`${config.ui && config.ui.gridClass ? config.ui.gridClass : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2'}`}>
            {config.cardOptions?.map((option) => {
              const isSelected = validation?.multiSelect 
                ? Array.isArray(value) && value.includes(option.key)
                : value === option.key;
              
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    if (validation?.multiSelect) {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (isSelected) {
                        onChange(newValue.filter(v => v !== option.key));
                      } else {
                        onChange([...newValue, option.key]);
                      }
                    } else {
                      onChange(isSelected ? '' : option.key);
                    }
                  }}
                  className={`p-3 border-2 rounded-lg text-center transition-all relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={disabled}
                >
                  <div className="flex flex-col items-center gap-1">
                    {option.icon && (
                      <span className="text-lg">{option.icon}</span>
                    )}
                                         <div className="font-medium text-sm flex items-center justify-center gap-1">
                       <span>{option.label}</span>
                       {isSelected && (
                         <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                         </svg>
                       )}
                     </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case 'multi_select_pills':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {config.cardOptions?.map((option) => {
                const isSelected = Array.isArray(value) && value.includes(option.key);
                
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      const newValue = Array.isArray(value) ? [...value] : [];
                      if (isSelected) {
                        onChange(newValue.filter(v => v !== option.key));
                      } else {
                        onChange([...newValue, option.key]);
                      }
                    }}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={disabled}
                  >
                    {option.icon && <span className="mr-1">{option.icon}</span>}
                    {option.label}
                  </button>
                );
              })}
            </div>
            {Array.isArray(value) && value.length > 0 && (
              <div className="text-xs text-gray-500">
                Selezionati: {value.length} elemento{value.length !== 1 ? 'i' : ''}
              </div>
            )}
          </div>
        );

      case 'field_array':
        return (
          <InformationRequestFields
            fields={value || []}
            onChange={onChange}
            maxFields={config.planLimits?.maxFields || 10}
            disabled={disabled}
          />
        );

      case 'item_array':
        return (
          <ChecklistItemsField
            items={value || []}
            onChange={onChange}
            maxItems={config.planLimits?.maxItems || 20}
            disabled={disabled}
          />
        );

      case 'question_array':
        return (
          <FeedbackQuestionsField
            questions={value || []}
            onChange={onChange}
            maxQuestions={config.planLimits?.maxQuestions || 10}
            disabled={disabled}
          />
        );

      default:
        return (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Tipo di campo non supportato: {type}
            </p>
          </div>
        );
    }
  };

  return (
    <div>
      {label && type !== 'checkbox' && (
        <label htmlFor={fieldName} className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
          {label} {required ? '*' : ''}
        </label>
      )}
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {ui?.helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{ui.helpText}</p>
      )}
    </div>
  );
}

// Specialized field renderers for complex types
export interface ChecklistItemsFieldProps {
  items: string[];
  onChange: (items: string[]) => void;
  maxItems: number;
  disabled?: boolean;
}

export function ChecklistItemsField({ items, onChange, maxItems, disabled = false }: ChecklistItemsFieldProps): JSX.Element {
  const addItem = () => {
    if (items.length < maxItems) {
      onChange([...items, '']);
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs font-medium">
            {index + 1}
          </div>
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder={`Elemento ${index + 1}`}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      {items.length < maxItems && (
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm disabled:opacity-50"
        >
          + Aggiungi elemento
        </button>
      )}
      
      {items.length >= maxItems && (
        <p className="text-xs text-gray-500 text-center">
          Massimo {maxItems} elementi consentiti
        </p>
      )}
    </div>
  );
}

// Form validation utilities
export function validateField(value: any, config: FieldConfig): string | null {
  const { required, validation } = config;

  // Required field validation
  if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'Questo campo è obbligatorio';
  }

  // Custom validation
  if (validation?.custom) {
    return validation.custom(value);
  }

  // Pattern validation
  if (validation?.pattern && value) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return 'Formato non valido';
    }
  }

  // Length validation
  if (validation?.minLength && value && value.length < validation.minLength) {
    return `Minimo ${validation.minLength} caratteri`;
  }

  if (validation?.maxLength && value && value.length > validation.maxLength) {
    return `Massimo ${validation.maxLength} caratteri`;
  }

  return null;
}

// Form configuration parser
export function parseFormConfig(requiredFieldsJson: string | object): Record<string, FieldConfig> {
  const fields = typeof requiredFieldsJson === 'string' 
    ? JSON.parse(requiredFieldsJson) 
    : requiredFieldsJson;

  const parsedConfig: Record<string, FieldConfig> = {};

  Object.entries(fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
    parsedConfig[fieldName] = {
      name: fieldName,
      type: fieldConfig.type,
      required: fieldConfig.required,
      label: fieldConfig.label,
      placeholder: fieldConfig.placeholder,
      options: fieldConfig.options,
      min: fieldConfig.min,
      max: fieldConfig.max,
      step: fieldConfig.step,
      validation: fieldConfig.validation,
      ui: fieldConfig.ui,
      conditional: fieldConfig.conditional,
      fileUpload: fieldConfig.fileUpload
    };
  });

  return parsedConfig;
}

// Information Request Fields Component
export interface InformationRequestFieldsProps {
  fields: Array<{ field_name: string; field_type: string; required: boolean }>;
  onChange: (fields: Array<{ field_name: string; field_type: string; required: boolean }>) => void;
  maxFields: number;
  disabled?: boolean;
}

export function InformationRequestFields({ fields, onChange, maxFields, disabled = false }: InformationRequestFieldsProps): JSX.Element {
  const addField = () => {
    if (fields.length < maxFields) {
      onChange([...fields, { field_name: '', field_type: 'text', required: false }]);
    }
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: { field_name: string; field_type: string; required: boolean }) => {
    const newFields = [...fields];
    newFields[index] = field;
    onChange(newFields);
  };

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
          <input
            type="text"
            value={field.field_name}
            onChange={(e) => updateField(index, { ...field, field_name: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Nome del campo"
            disabled={disabled}
          />
          <select
            value={field.field_type}
            onChange={(e) => updateField(index, { ...field, field_type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={disabled}
          >
            <option value="text">Testo</option>
            <option value="email">Email</option>
            <option value="phone">Telefono</option>
            <option value="textarea">Area di testo</option>
            <option value="number">Numero</option>
          </select>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(index, { ...field, required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={disabled}
            />
            <span>Obbligatorio</span>
          </label>
          <button
            type="button"
            onClick={() => removeField(index)}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      {fields.length < maxFields && (
        <button
          type="button"
          onClick={addField}
          disabled={disabled}
          className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm disabled:opacity-50"
        >
          + Aggiungi campo
        </button>
      )}
      
      {fields.length >= maxFields && (
        <p className="text-xs text-gray-500 text-center">
          Massimo {maxFields} campi consentiti nel tuo piano
        </p>
      )}
    </div>
  );
}

// Feedback Questions Field Component
export interface FeedbackQuestionsFieldProps {
  questions: Array<{ question_text: string; question_type: string }>;
  onChange: (questions: Array<{ question_text: string; question_type: string }>) => void;
  maxQuestions: number;
  disabled?: boolean;
}

export function FeedbackQuestionsField({ questions, onChange, maxQuestions, disabled = false }: FeedbackQuestionsFieldProps): JSX.Element {
  const addQuestion = () => {
    if (questions.length < maxQuestions) {
      onChange([...questions, { question_text: '', question_type: 'text' }]);
    }
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, question: { question_text: string; question_type: string }) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    onChange(newQuestions);
  };

  return (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => updateQuestion(index, { ...question, question_text: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Testo della domanda"
            disabled={disabled}
          />
          <select
            value={question.question_type}
            onChange={(e) => updateQuestion(index, { ...question, question_type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={disabled}
          >
            <option value="text">Testo libero</option>
            <option value="rating">Valutazione (1-5)</option>
            <option value="yes_no">Sì/No</option>
            <option value="multiple_choice">Scelta multipla</option>
          </select>
          <button
            type="button"
            onClick={() => removeQuestion(index)}
            disabled={disabled}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      
      {questions.length < maxQuestions && (
        <button
          type="button"
          onClick={addQuestion}
          disabled={disabled}
          className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm disabled:opacity-50"
        >
          + Aggiungi domanda
        </button>
      )}
      
      {questions.length >= maxQuestions && (
        <p className="text-xs text-gray-500 text-center">
          Massimo {maxQuestions} domande consentite nel tuo piano
        </p>
      )}
    </div>
  );
} 