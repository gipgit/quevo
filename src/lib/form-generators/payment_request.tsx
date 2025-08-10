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
  createFieldConfig('currency', 'select', true, {
    label: 'Valuta',
    placeholder: 'Seleziona la valuta',
    options: [
      { key: 'EUR', label: 'EUR' },
      { key: 'USD', label: 'USD' },
      { key: 'GBP', label: 'GBP' },
      { key: 'CHF', label: 'CHF' },
      { key: 'CAD', label: 'CAD' },
      { key: 'AUD', label: 'AUD' },
      { key: 'JPY', label: 'JPY' }
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
  } = useBaseForm(actionType, locale, { currency: 'EUR' });

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

        {/* Amount and Currency - Visual Single Field */}
        <div className="space-y-2">
          <label className="block text-xs lg:text-sm font-medium text-gray-700">
            {actionConfig.fields.find((f: any) => f.name === 'amount')?.label || 'Importo'}
          </label>
          
          {/* Wrapper with all styling applied */}
          <div className={`flex border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors overflow-hidden ${
            errors.amount || errors.currency ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : 'bg-white'}`}>
            
            {/* Amount Input - Custom without FieldRenderer */}
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                placeholder={actionConfig.fields.find((f: any) => f.name === 'amount')?.placeholder || '0.00'}
                disabled={disabled}
                className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-transparent text-sm lg:text-base"
              />
            </div>
            
            {/* Currency Selector - Custom select */}
            <div className="flex-shrink-0 border-l border-gray-300">
              <select
                value={formData.currency || 'EUR'}
                onChange={(e) => handleFieldChange('currency', e.target.value)}
                disabled={disabled}
                className="px-3 py-2 border-0 focus:outline-none focus:ring-0 bg-transparent text-sm lg:text-base cursor-pointer"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
          
          {/* Error messages */}
          {errors.amount && (
            <p className="text-sm text-red-600">{errors.amount}</p>
          )}
          {errors.currency && (
            <p className="text-sm text-red-600">{errors.currency}</p>
          )}
        </div>

        {/* Payment Methods as selectable cards fetched from DB */}
        <div className="space-y-2">
          <label className="block text-xs lg:text-sm font-medium text-gray-700">Metodi di pagamento</label>
          {isLoadingMethods ? (
            <div className="text-sm text-gray-500">Caricamento metodi...</div>
          ) : methodsError ? (
            <div className="text-sm text-red-600">{methodsError}</div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-sm text-gray-500">
              You haven't set payment information yet.{' '}
              <a 
                href="/dashboard/profile/payments" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Add your payment info
              </a>
            </div>
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
                      {/* Show method-specific details */}
                      {method.details && (
                        <>
                          {/* PayPal Email */}
                          {methodLabel === 'PayPal' && method.details.paypal_email && (
                            <div className="text-xs text-gray-500 truncate">Email: {method.details.paypal_email}</div>
                          )}
                          {/* Bank Transfer Details */}
                          {methodLabel === 'Bank Transfer' && method.details.iban && (
                            <div className="text-xs text-gray-500 truncate">IBAN: {method.details.iban}</div>
                          )}
                          {methodLabel === 'Bank Transfer' && method.details.account_holder && (
                            <div className="text-xs text-gray-500 truncate">Beneficiario: {method.details.account_holder}</div>
                          )}
                          {/* Stripe Link */}
                          {methodLabel === 'Stripe' && method.details.stripe_link && (
                            <div className="text-xs text-gray-500 truncate">Link: {method.details.stripe_link}</div>
                          )}
                          {/* Cash Note */}
                          {methodLabel === 'Cash' && method.details.cash_note && (
                            <div className="text-xs text-gray-500 truncate">Nota: {method.details.cash_note}</div>
                          )}
                          {/* POS Note */}
                          {methodLabel === 'POS' && method.details.pos_note && (
                            <div className="text-xs text-gray-500 truncate">Nota: {method.details.pos_note}</div>
                          )}
                        </>
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
