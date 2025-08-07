// Dynamic Form Generator
// Generates forms based on app configurations and plan limitations

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, addHours, parse, startOfWeek, getDay } from 'date-fns';
import { FieldRenderer, FieldConfig, parseFormConfig, validateField, ChecklistItemsField, InformationRequestFields, FeedbackQuestionsField } from './form-field-renderers';
import { getFormFieldPlaceholders } from './unified-action-system';
import { getActionConfig, getPlanLimits, ActionConfig } from './action-configs';

// Calendar localizer - same as AddActionModal
const locales = {
  'it-IT': require('date-fns/locale/it'),
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Form generator interface
export interface DynamicFormProps {
  actionType: string; // Action type instead of template
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  // Appointment scheduling props
  suggestedDatetimes?: string[];
  onRemoveDateTime?: (datetime: string) => void;
  onAppointmentModeChange?: (mode: string) => void;
  fixedAppointmentDate?: Date | null;
  onClearFixedDate?: () => void;
  // Calendar props
  existingAppointments?: any[];
  selectedDate?: Date | null;
  selectedTimeSlot?: Date | null;
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (time: Date) => void;
  onAddDateTime?: () => void;
  generateTimeSlots?: (date: Date) => any[];
  appointmentMode?: string;
}

export function DynamicFormGenerator({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = '',
  suggestedDatetimes = [],
  onRemoveDateTime,
  onAppointmentModeChange,
  fixedAppointmentDate,
  onClearFixedDate,
  existingAppointments = [],
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onAddDateTime,
  generateTimeSlots,
  appointmentMode
}: DynamicFormProps) {
  // Get action configuration
  const actionConfig = getActionConfig(actionType);
  if (!actionConfig) {
    return <div>Action type not found: {actionType}</div>;
  }

  // Get plan limits
  const limits = getPlanLimits(actionType, currentPlan);

  // Get form field placeholders with locale
  const formPlaceholders = React.useMemo(() => getFormFieldPlaceholders(actionType, locale), [actionType, locale]);

  // Initialize form data immediately if placeholders are available
  const initialFormData = React.useMemo(() => {
    if (!formPlaceholders?.action_title || !formPlaceholders?.action_description) {
      return {};
    }
    
    const data: any = {
      action_title: formPlaceholders.action_title,
      action_description: formPlaceholders.action_description
    };
    
    if (actionConfig) {
      actionConfig.fields.forEach(field => {
        // Set default values based on field type
        switch (field.type) {
          case 'checkbox':
            data[field.name] = false;
            break;
          case 'item_array':
          case 'field_array':
          case 'question_array':
            data[field.name] = [];
            break;
          case 'select_cards':
            data[field.name] = field.validation?.multiSelect ? [] : '';
            break;
          case 'number':
            data[field.name] = field.validation?.min || 0;
            break;
          default:
            data[field.name] = '';
        }
      });
    }
    
    return data;
  }, [formPlaceholders, actionConfig]);

  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>({});

  // Fetch dynamic options (payment methods, platforms, etc.)
  useEffect(() => {
    const fetchDynamicOptions = async () => {
      const options: Record<string, any[]> = {};
      
      for (const field of actionConfig.fields) {
        if (field.dynamicOptions) {
          try {
            switch (field.dynamicOptions.source) {
              case 'business_payment_methods':
                const methodsResponse = await fetch(`/api/business/${businessId}/payment-methods`);
                if (methodsResponse.ok) {
                  const methodsData = await methodsResponse.json();
                  const methods = methodsData.paymentMethods || [];
                  options[field.name] = methods.map((method: any) => ({
                    key: method.label || method.method_name,
                    label: method.label || method.method_name,
                    icon: '💳',
                    description: method.details ? Object.values(method.details).join(', ') : ''
                  }));
                }
                break;
              case 'business_platforms':
                const platformsResponse = await fetch(`/api/businesses/${businessId}/platforms`);
                if (platformsResponse.ok) {
                  const platforms = await platformsResponse.json();
                  options[field.name] = platforms.map((platform: any) => ({
                    key: platform.platform_name,
                    label: platform.platform_name,
                    icon: '🔗'
                  }));
                }
                break;
            }
          } catch (error) {
            console.error(`Error fetching dynamic options for ${field.name}:`, error);
            // Use default options if available
            if (field.dynamicOptions.defaultOptions) {
              options[field.name] = field.dynamicOptions.defaultOptions;
            }
          }
        }
      }
      
      setDynamicOptions(options);
    };
    
    fetchDynamicOptions();
  }, [businessId, actionConfig]);

  // Update form data when initial data changes
  useEffect(() => {
    console.log('Initial form data changed:', initialFormData);
    console.log('Current form data:', formData);
    if (Object.keys(initialFormData).length > 0) {
      console.log('Setting form data from initial data:', initialFormData);
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  // Force set form data when placeholders are available
  useEffect(() => {
    if (formPlaceholders?.action_title && formPlaceholders?.action_description) {
      console.log('Force setting form data with placeholders:', formPlaceholders);
      setFormData((prev: any) => ({
        ...prev,
        action_title: formPlaceholders.action_title,
        action_description: formPlaceholders.action_description
      }));
    }
  }, [formPlaceholders]);

  // Handle field changes
  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [fieldName]: true }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [fieldName]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Debug: Log form data
    console.log('Validating form data:', formData);
    console.log('Action config fields:', actionConfig.fields);

    // Validate action title and description
    if (!formData.action_title || formData.action_title.trim() === '') {
      newErrors.action_title = 'Il titolo dell\'azione è obbligatorio';
    }

    // Validate other fields
    actionConfig.fields.forEach(field => {
      const value = formData[field.name];
      
      // Debug: Log field validation
      console.log(`Validating field ${field.name}:`, { value, required: field.required, conditional: field.conditional });
      
      // Check required fields
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = 'Questo campo è obbligatorio';
        console.log(`Field ${field.name} is required but empty`);
        return;
      }

      // Check conditional visibility
      if (field.conditional) {
        const dependsOnValue = formData[field.conditional.dependsOn];
        const shouldShow = field.conditional.showWhen(dependsOnValue);
        console.log(`Field ${field.name} conditional check:`, { dependsOnValue, shouldShow });
        if (!shouldShow) {
          console.log(`Skipping validation for hidden field ${field.name}`);
          return; // Skip validation for hidden fields
        }
      }

      // Plan-based validation
      if (limits) {
        switch (field.type) {
          case 'item_array':
            if (value && value.length > (limits.maxChecklistItems || 5)) {
              newErrors[field.name] = `Massimo ${limits.maxChecklistItems || 5} elementi consentiti nel tuo piano`;
            }
            break;
          case 'field_array':
            if (value && value.length > (limits.maxInformationFields || 3)) {
              newErrors[field.name] = `Massimo ${limits.maxInformationFields || 3} campi consentiti nel tuo piano`;
            }
            break;
          case 'question_array':
            if (value && value.length > (limits.maxFeedbackQuestions || 2)) {
              newErrors[field.name] = `Massimo ${limits.maxFeedbackQuestions || 2} domande consentite nel tuo piano`;
            }
            break;
        }
      }

      // Custom validation
      if (field.validation) {
        if (field.validation.min !== undefined && value < field.validation.min) {
          newErrors[field.name] = `Valore minimo: ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && value > field.validation.max) {
          newErrors[field.name] = `Valore massimo: ${field.validation.max}`;
        }
        if (field.validation.custom) {
          const customError = field.validation.custom(value);
          if (customError) {
            newErrors[field.name] = customError;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempted');
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    
    if (isValid) {
      console.log('Submitting form with data:', formData);
      onSubmit(formData);
    } else {
      console.log('Form validation failed, errors:', errors);
    }
  };

  // Render field based on configuration
  const renderField = (field: any) => {
    const value = formData[field.name];
    const error = errors[field.name];
    const isTouched = touched[field.name];

    // Check conditional visibility
    if (field.conditional) {
      const dependsOnValue = formData[field.conditional.dependsOn];
      if (!field.conditional.showWhen(dependsOnValue)) {
        return null;
      }
    }

    const options = field.dynamicOptions 
      ? dynamicOptions[field.name] || field.dynamicOptions.defaultOptions || field.options
      : field.options;

    switch (field.type) {
      case 'select_cards':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label} {field.required ? '*' : ''}
            </label>
            {/* Loading state for dynamic options */}
            {field.dynamicOptions && !options && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm text-gray-600">Caricamento opzioni...</span>
              </div>
            )}
            {options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option: any) => {
                  const isMultiSelect = field.validation?.multiSelect;
                  const isSelected = isMultiSelect
                    ? (value || []).includes(option.key)
                    : value === option.key;
                  
                  return (
                    <div
                      key={option.key}
                      className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (isMultiSelect) {
                          // Multi-selection mode
                          const newValues = isSelected
                            ? (value || []).filter((v: string) => v !== option.key)
                            : [...(value || []), option.key];
                          handleFieldChange(field.name, newValues);
                        } else {
                          // Single selection mode
                          handleFieldChange(field.name, option.key);
                        }
                      }}
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 text-sm lg:text-base">{option.label}</h4>
                        {option.description && (
                          <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {error && isTouched && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        );

      case 'multi_select_pills':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {field.label} {field.required ? '*' : ''}
            </label>
            <div className="flex flex-wrap gap-2">
              {options?.map((option: any) => (
                <div
                  key={option.key}
                  className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center gap-2 ${
                    (value || []).includes(option.key)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    const currentValues = value || [];
                    const newValues = currentValues.includes(option.key)
                      ? currentValues.filter((v: string) => v !== option.key)
                      : [...currentValues, option.key];
                    handleFieldChange(field.name, newValues);
                  }}
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              ))}
            </div>
            {error && isTouched && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        );

      case 'item_array':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required ? '*' : ''}
            </label>
            <ChecklistItemsField
              items={value || []}
              onChange={(items) => handleFieldChange(field.name, items)}
              maxItems={limits?.maxChecklistItems || 5}
              disabled={disabled}
            />
            {error && isTouched && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        );

      case 'field_array':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required ? '*' : ''}
            </label>
            <InformationRequestFields
              fields={value || []}
              onChange={(fields) => handleFieldChange(field.name, fields)}
              maxFields={limits?.maxInformationFields || 3}
              disabled={disabled}
            />
            {error && isTouched && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        );

      case 'question_array':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required ? '*' : ''}
            </label>
            <FeedbackQuestionsField
              questions={value || []}
              onChange={(questions) => handleFieldChange(field.name, questions)}
              maxQuestions={limits?.maxFeedbackQuestions || 2}
              disabled={disabled}
            />
            {error && isTouched && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        );

      default:
        // Use the existing FieldRenderer for standard field types
        const fieldConfig: FieldConfig = {
          type: field.type as any,
          required: field.required,
          label: field.label,
          placeholder: field.placeholder,
          options: options?.map((opt: any) => opt.key),
          min: field.validation?.min,
          max: field.validation?.max,
          validation: field.validation
        };

        return (
          <div key={field.name}>
            <FieldRenderer
              fieldName={field.name}
              config={fieldConfig}
              value={value}
              onChange={(value) => handleFieldChange(field.name, value)}
              error={error && isTouched ? error : undefined}
              disabled={disabled}
            />
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Action Title - Always present */}
      <div>
        <label htmlFor="action_title" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
          Titolo dell'azione *
        </label>
        <input
          type="text"
          id="action_title"
          value={formData.action_title || ''}
          onChange={(e) => handleFieldChange('action_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
          required
          placeholder={formPlaceholders.action_title}
        />
        {errors.action_title && touched.action_title && (
          <p className="mt-1 text-sm text-red-600">{errors.action_title}</p>
        )}
      </div>

      {/* Action Description - Always present */}
      <div>
        <label htmlFor="action_description" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
          Descrizione
        </label>
        <textarea
          id="action_description"
          value={formData.action_description || ''}
          onChange={(e) => handleFieldChange('action_description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
          placeholder={formPlaceholders.action_description}
        />
      </div>

      {/* Appointment Scheduling Special Fields */}
      {actionType === 'appointment_scheduling' && (
        <>
          {/* Appointment Title */}
          <div>
            <label htmlFor="appointment_title" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Titolo dell'appuntamento *
            </label>
            <input
              type="text"
              id="appointment_title"
              value={formData.appointment_title || ''}
              onChange={(e) => handleFieldChange('appointment_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
              required
              placeholder="Es. Consulenza, Controllo, Visita..."
            />
            {errors.appointment_title && touched.appointment_title && (
              <p className="mt-1 text-sm text-red-600">{errors.appointment_title}</p>
            )}
          </div>

          {/* Appointment Type Selection */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Tipo di appuntamento *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'in_person', title: 'In presenza', icon: '🏢' },
                { key: 'online', title: 'Online', icon: '💻' }
              ].map((type) => (
                <div
                  key={type.key}
                  className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.appointment_type === type.key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFieldChange('appointment_type', type.key)}
                >
                  <div className="flex items-center justify-center gap-2 lg:gap-3">
                    <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs lg:text-base font-medium ${
                      formData.appointment_type === type.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.icon}
                    </div>
                    <h4 className="font-medium text-gray-900 text-xs lg:text-base">{type.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address Field - Only for in-person appointments */}
          {formData.appointment_type === 'in_person' && (
            <div>
              <label htmlFor="address" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                Indirizzo *
              </label>
              <input
                type="text"
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                required
                placeholder="Inserisci l'indirizzo dell'appuntamento"
              />
              {errors.address && touched.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>
          )}

                     {/* Platform Options - Only for online appointments */}
           {formData.appointment_type === 'online' && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-3">
                 Piattaforme disponibili *
               </label>
               <div className="flex flex-wrap gap-2">
                 {[
                   { key: 'Google Meet', icon: '🔗' },
                   { key: 'Zoom', icon: '📹' },
                   { key: 'Microsoft Teams', icon: '💼' },
                   { key: 'Skype', icon: '📞' },
                   { key: 'WhatsApp', icon: '📱' },
                   { key: 'Telegram', icon: '📨' }
                 ].map((platform) => (
                   <div
                     key={platform.key}
                     className={`px-2 py-1 lg:px-4 lg:py-2 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center gap-1 lg:gap-2 ${
                       (formData.platform_options || []).includes(platform.key)
                         ? 'border-blue-500 bg-blue-50 text-blue-700'
                         : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                     }`}
                     onClick={() => {
                       const currentPlatforms = formData.platform_options || [];
                       const newPlatforms = currentPlatforms.includes(platform.key)
                         ? currentPlatforms.filter((p: string) => p !== platform.key)
                         : [...currentPlatforms, platform.key];
                       handleFieldChange('platform_options', newPlatforms);
                     }}
                   >
                     <span className="text-xs lg:text-sm">{platform.icon}</span>
                     <span className="text-xs lg:text-sm font-medium">{platform.key}</span>
                   </div>
                 ))}
               </div>
               {errors.platform_options && touched.platform_options && (
                 <p className="mt-1 text-sm text-red-600">{errors.platform_options}</p>
               )}
             </div>
           )}

          {/* Appointment Mode Selection */}
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Modalità Appuntamento *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'fixed_confirmed',
                  title: 'Data fissa confermata',
                  description: 'La data e ora sono già impostate e confermate',
                  icon: '✓'
                },
                {
                  key: 'fixed_pending_confirmation',
                  title: 'Data fissa in attesa di conferma',
                  description: 'La data e ora sono impostate ma necessitano conferma del cliente',
                  icon: '⏳'
                },
                {
                  key: 'multiple_choice',
                  title: 'Lista di date da scegliere',
                  description: 'Il cliente può scegliere tra più date e orari suggeriti',
                  icon: '📅'
                }
              ].map((mode) => (
                <div
                  key={mode.key}
                  className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.appointment_mode === mode.key
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    handleFieldChange('appointment_mode', mode.key);
                    onAppointmentModeChange?.(mode.key);
                  }}
                >
                  <div className="flex flex-col lg:flex-col items-center">
                    <div className="flex items-center justify-between w-full lg:flex-col lg:items-center">
                      <div className="flex-1 lg:flex-none lg:text-center lg:order-2 lg:w-full">
                        <h4 className="font-medium text-gray-900 text-xs lg:text-sm mb-1 lg:mb-1">{mode.title}</h4>
                        <p className="text-xs text-gray-600 leading-tight lg:text-center">{mode.description}</p>
                      </div>
                      <div className={`w-8 h-8 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-sm lg:text-base font-medium ml-3 lg:ml-0 lg:mb-2 lg:order-1 ${
                        formData.appointment_mode === mode.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {mode.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

                                {/* Calendar Section - Only for appointment scheduling on mobile */}
            {actionType === 'appointment_scheduling' && (
              <div className="lg:hidden">
                <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                  Calendario
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-3">
                    {formData.appointment_mode === 'fixed_confirmed' || formData.appointment_mode === 'fixed_pending_confirmation'
                      ? 'Clicca su una data, poi seleziona un orario. L\'appuntamento verrà impostato automaticamente.'
                      : 'Clicca su una data per vedere gli orari disponibili e aggiungerli ai suggerimenti'
                    }
                  </p>
                  
                  {/* Calendar */}
                  <div className="mb-4">
                    <Calendar
                      localizer={localizer}
                      events={existingAppointments.map((appointment: any) => ({
                        title: appointment.appointment_title || 'Appuntamento',
                        start: new Date(appointment.appointment_datetime),
                        end: addHours(new Date(appointment.appointment_datetime), appointment.duration_minutes || 60)
                      }))}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 250, fontSize: '12px' }}
                      onSelectSlot={({ start }: { start: Date }) => onDateSelect?.(start)}
                      selectable
                      views={['month']}
                      defaultView="month"
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Selected Date and Time Slots */}
                  {selectedDate && generateTimeSlots && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">
                        Data selezionata: {format(selectedDate, 'dd/MM/yyyy')}
                      </h4>
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Orari disponibili:</h5>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {generateTimeSlots(selectedDate).map((slot: any, index: number) => {
                          const isSelected = selectedTimeSlot && 
                            selectedTimeSlot.toISOString() === slot.time.toISOString();
                          return (
                            <button
                              key={index}
                              disabled={slot.isOccupied || slot.isAlreadySuggested}
                              onClick={() => !slot.isOccupied && !slot.isAlreadySuggested && onTimeSlotSelect?.(slot.time)}
                              className={`text-xs p-2 rounded border transition-colors ${
                                slot.isOccupied
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : slot.isAlreadySuggested
                                  ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              {format(slot.time, 'HH:mm')}
                              {slot.isOccupied && ' (O)'}
                              {slot.isAlreadySuggested && ' ✓'}
                              {isSelected && ' ✓'}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Add selected time slot button - Only for multiple choice mode */}
                      {selectedTimeSlot && appointmentMode === 'multiple_choice' && onAddDateTime && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={onAddDateTime}
                            className="w-full py-2 px-3 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aggiungi {format(selectedTimeSlot, 'dd/MM/yyyy HH:mm')} ai suggerimenti
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Suggested Datetimes - Only for multiple choice mode */}
          {formData.appointment_mode === 'multiple_choice' && (
            <div>
              <label htmlFor="datetimes_options" className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
                Orari Suggeriti
              </label>
              <div className="space-y-2">
                {suggestedDatetimes.length > 0 ? (
                  suggestedDatetimes.map((datetime: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(datetime).toLocaleDateString('it-IT', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {new Date(datetime).toLocaleTimeString('it-IT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveDateTime?.(datetime)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm">Nessun orario suggerito ancora.</p>
                    <p className="text-xs text-gray-400 mt-1">Seleziona date e orari dal calendario per aggiungerli.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fixed Appointment Date Display - Only for fixed date modes */}
          {(formData.appointment_mode === 'fixed_confirmed' || formData.appointment_mode === 'fixed_pending_confirmation') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appuntamento Impostato
              </label>
              {fixedAppointmentDate ? (
                <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-lg font-medium text-gray-900">
                          {fixedAppointmentDate.toLocaleDateString('it-IT', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          {fixedAppointmentDate.toLocaleTimeString('it-IT', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onClearFixedDate?.()}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Cambia
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm">Nessun appuntamento impostato ancora.</p>
                  <p className="text-xs text-gray-400 mt-1">Seleziona data e orario dal calendario per impostare l'appuntamento.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Render all other fields from config */}
      {actionConfig.fields
        .filter(field => !['action_title', 'action_description', 'appointment_title', 'appointment_type', 'address', 'platform_options', 'appointment_mode'].includes(field.name))
        .map(field => renderField(field))
      }

      {/* Submit button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Salvataggio...' : 'Crea Azione'}
        </button>
      </div>
    </form>
  );
}

 