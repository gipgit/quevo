import React, { useEffect, useState } from 'react';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';
import { FieldRenderer } from '../form-field-renderers';
import { ALLOWED_PAYMENT_METHODS, PaymentMethodConfig } from '@/lib/payment-methods-config';

// Define the field configuration for payment_request
const paymentRequestFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le richiediamo il pagamento per...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente il motivo del pagamento richiesto'
  }),
  createFieldConfig('amount', 'number', true, {
    label: 'Importo',
    placeholder: 'Inserisci l\'importo da pagare',
    validation: {
      min: 0
    }
  }),
  createFieldConfig('currency', 'select_cards', true, {
    label: 'Valuta',
    placeholder: 'Seleziona la valuta',
    ui: { gridClass: 'grid grid-cols-3 gap-2' },
    cardOptions: [
      { key: 'EUR', label: '€', color: 'bg-blue-50 hover:bg-blue-100' },
      { key: 'USD', label: '$', color: 'bg-green-50 hover:bg-green-100' },
      { key: 'GBP', label: '£', color: 'bg-purple-50 hover:bg-purple-100' }
    ]
  }),
  createFieldConfig('payment_reason', 'text', false, {
    label: 'Motivo del pagamento',
    placeholder: 'Spiega il motivo del pagamento'
  }),
  createFieldConfig('payment_methods', 'select_cards', true, {
    label: 'Metodi di pagamento accettati',
    dynamicOptions: {
      source: 'business_payment_methods'
    },
    validation: {
      multiSelect: true
    }
  })
];

// Register the action configuration
registerActionConfig(createActionConfig(
  'payment_request',
  'Richiesta Pagamento',
  'Spiega al cliente il motivo del pagamento richiesto',
  '/icons/sanity/credit-card.svg',
  'bg-green-100',
  [1, 2, 3],
  paymentRequestFields
));

export interface PaymentRequestFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PaymentRequestForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = ''
}: PaymentRequestFormProps) {
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

  // Fetch business payment methods to present as selectable cards
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [methodsError, setMethodsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMethods() {
      try {
        setIsLoadingMethods(true);
        setMethodsError(null);
        const res = await fetch(`/api/business/${businessId}/payment-methods`);
        if (!res.ok) throw new Error('Failed to load payment methods');
        const data = await res.json();
        const methods = Array.isArray(data?.paymentMethods) ? data.paymentMethods : data;
        if (!cancelled) setPaymentMethods(methods);
      } catch (e: any) {
        if (!cancelled) setMethodsError(e?.message || 'Errore nel caricamento dei metodi di pagamento');
      } finally {
        if (!cancelled) setIsLoadingMethods(false);
      }
    }
    if (businessId) fetchMethods();
    return () => { cancelled = true; };
  }, [businessId]);

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

        {/* Currency + Amount in same row on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <FieldRenderer
              fieldName="currency"
              config={actionConfig.fields.find((f: any) => f.name === 'currency')}
              value={formData.currency || ''}
              onChange={(value) => handleFieldChange('currency', value)}
              error={errors.currency}
              disabled={false}
            />
          </div>
          <div>
            <FieldRenderer
              fieldName="amount"
              config={actionConfig.fields.find((f: any) => f.name === 'amount')}
              value={formData.amount || ''}
              onChange={(value) => handleFieldChange('amount', value)}
              error={errors.amount}
              disabled={false}
            />
          </div>
        </div>

        {/* Payment Methods as selectable cards fetched from DB */}
        <div className="space-y-2">
          <label className="block text-xs lg:text-sm font-medium text-gray-700">Metodi di pagamento</label>
          {isLoadingMethods ? (
            <div className="text-sm text-gray-500">Caricamento metodi...</div>
          ) : methodsError ? (
            <div className="text-sm text-red-600">{methodsError}</div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-sm text-gray-500">Nessun metodo disponibile</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {paymentMethods.map((method: any) => {
                const methodId: string = (method?.id ?? '').toString();
                const methodLabel: string = (method?.label ?? '').toString();
                const config = (ALLOWED_PAYMENT_METHODS as PaymentMethodConfig[]).find(
                  (pm: PaymentMethodConfig) => pm.id.toLowerCase() === methodId.toLowerCase() || pm.name.toLowerCase() === methodLabel.toLowerCase()
                );
                // Use config.id when available; else generate a slug from label; fallback to method id
                const key: string = (config?.id || (methodLabel ? methodLabel.toLowerCase().replace(/\s+/g, '_') : methodId)).toString();
                const isSelected = Array.isArray(formData.payment_methods)
                  ? formData.payment_methods.includes(key)
                  : false;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => {
                      const prev: string[] = Array.isArray(formData.payment_methods) ? formData.payment_methods : [];
                      if (prev.includes(key)) {
                        handleFieldChange('payment_methods', prev.filter((m) => m !== key));
                        // remove from available_payment_methods
                        const currentAvail = Array.isArray((formData as any).available_payment_methods) ? (formData as any).available_payment_methods : [];
                        const updatedAvail = currentAvail.filter((m: any) => m?.id !== key);
                        handleFieldChange('available_payment_methods', updatedAvail);
                      } else {
                        handleFieldChange('payment_methods', [...prev, key]);
                        // add to available_payment_methods with persisted details
                        const currentAvail = Array.isArray((formData as any).available_payment_methods) ? (formData as any).available_payment_methods : [];
                        const details: Record<string, any> = method?.details || {};
                        const newEntry = { id: key, label: methodLabel || key, details };
                        // avoid duplicates
                        const updatedAvail = currentAvail.some((m: any) => m?.id === key)
                          ? currentAvail
                          : [...currentAvail, newEntry];
                        handleFieldChange('available_payment_methods', updatedAvail);
                      }
                    }}
                    className={`flex items-center gap-3 p-3 border rounded-lg text-left transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {config?.iconPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={config.iconPath} alt="" className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-semibold">{(methodLabel || methodId || '').toString().charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{methodLabel || methodId}</div>
                      {method.details && methodLabel === 'Bank Transfer' && method.details.iban && (
                        <div className="text-xs text-gray-500 truncate">IBAN: {method.details.iban}</div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}></div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Reason below payment methods */}
        <div>
          <FieldRenderer
            fieldName="payment_reason"
            config={actionConfig.fields.find((f: any) => f.name === 'payment_reason')}
            value={formData.payment_reason || ''}
            onChange={(value) => handleFieldChange('payment_reason', value)}
            error={errors.payment_reason}
            disabled={false}
          />
        </div>

        {/* Submit button */}
        <SubmitButton isSubmitting={isSubmitting} disabled={disabled} />
      </div>
    </form>
  );
}
