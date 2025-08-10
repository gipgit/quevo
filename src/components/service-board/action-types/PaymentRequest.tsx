"use client";

import React, { useState } from 'react';
import { PaymentRequestDetails } from '@/types/service-board';
import { useMemo } from 'react';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import Image from 'next/image';
import { ALLOWED_PAYMENT_METHODS, PaymentMethodConfig } from "@/lib/payment-methods-config";
import { useTranslations } from 'next-intl';

interface BusinessPaymentMethod {
  id: string;
  label: string;
  details: Record<string, string>;
}

interface Props {
  details: PaymentRequestDetails;
  onUpdate?: (details: PaymentRequestDetails) => void;
  action_id?: string;
}

export default function PaymentRequest({ details, onUpdate, action_id }: Props) {
  const statusStyles = useMemo(() => ({
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  } as Record<string, string>), []);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const { businessPaymentMethods } = useBusinessProfile() as { businessPaymentMethods: BusinessPaymentMethod[] };
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const t = useTranslations('ServiceBoard');

  // Determine visible methods using allowed list if present; fallback to hidden list for backward compatibility
  const allowedSet = new Set((details.allowed_payment_methods || []).map((m) => m.toLowerCase()))
  // Prefer rendering directly from persisted available_payment_methods with details, if present
  const persistedAvailable = Array.isArray(details.available_payment_methods) ? details.available_payment_methods : []
  const visiblePaymentMethods = (persistedAvailable.length > 0
    ? persistedAvailable.map((m) => ({ id: m.id, label: m.label, details: m.details || {} }))
    : businessPaymentMethods?.filter((method: BusinessPaymentMethod) => {
        // Derive key consistent with form/transformer logic
        const config = ALLOWED_PAYMENT_METHODS.find((pm: PaymentMethodConfig) => pm.id === method.id || pm.name.toLowerCase() === (method.label || '').toLowerCase())
        const key = (config?.id || (method.label ? method.label.toLowerCase().replace(/\s+/g, '_') : method.id)).toString().toLowerCase()
        if (allowedSet.size > 0) {
          return allowedSet.has(key)
        }
        return true
      })
  ) || [];

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handlePaymentConfirm = async (methodUsed: string, note: string, paidAt?: string) => {
    if (!onUpdate) return;

    const updatedDetails: PaymentRequestDetails = {
      ...details,
      payment_confirmation: {
        confirmed_at: new Date().toISOString(),
        method_used: methodUsed,
        note: note || undefined,
      },
    };

    try {
      // First update the service board action
      const id = details.action_id || action_id;
      if (!id) throw new Error('Missing action_id for payment confirmation');
      const resp = await fetch(`/api/service-board/actions/${id}/payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method_used: methodUsed,
          note: note || undefined,
          confirmed_at: paidAt || undefined,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        // Prefer server-returned details if provided
        const merged = {
          ...details,
          ...(data?.action_details || {}),
          payment_declared_confirmed: true,
          payment_confirmation: {
            confirmed_at: paidAt || new Date().toISOString(),
            method_used: methodUsed,
            note: note || undefined,
          },
        } as PaymentRequestDetails;
        onUpdate(merged);
      } else {
        onUpdate(updatedDetails);
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Details */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          {/* Amount */}
          {typeof details.amount === 'number' && details.currency && (
            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
              {details.currency === 'EUR' ? '€' : details.currency === 'USD' ? '$' : details.currency === 'GBP' ? '£' : details.currency}
              {` ${details.amount.toFixed(2)}`}
            </div>
          )}
          {/* Status pill only (no label) */}
          {details.payment_status && (
            <div className="inline-flex items-center text-xs font-medium capitalize">
              <span className={`px-2 py-1 rounded-full ${statusStyles[details.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                {details.payment_status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      {visiblePaymentMethods.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs lg:text-sm text-gray-600 mb-2">{t('availablePaymentMethods')}</h3>
          <div className="space-y-2">
            {visiblePaymentMethods.map((method: BusinessPaymentMethod, index: number) => {
              const config = ALLOWED_PAYMENT_METHODS.find(
                (pm: PaymentMethodConfig) => pm.name.toLowerCase() === method.label?.toLowerCase() || pm.id === method.id
              );
              const iconPath = config?.iconPath;

              return (
                <div key={index} className="relative p-4 border-[1px] border-gray-300 rounded-lg">
                  <div className="flex items-start gap-x-4 md:gap-x-6 gap-y-2">
                    {/* Icon (responsive): absolute on xs–md, inline on lg+ */}
                    {iconPath && (
                      <>
                        {/* Small screens: absolute top-right, does not consume layout space */}
                        <div className="lg:hidden absolute top-2 right-2">
                          <Image src={iconPath} width={28} height={28} alt={`-`} className="w-7 h-7"/>
                        </div>
                        {/* Large screens: inline at left */}
                        <div className="hidden lg:block flex-shrink-0">
                          <Image src={iconPath} width={40} height={40} alt={`-`} className="w-10 h-10"/>
                        </div>
                      </>
                    )}

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-base font-bold text-gray-900">{method.label}</h4>
                      
                      {/* PayPal */}
                      {method.label === 'PayPal' && method.details.paypal_email && (
                        <div className="flex flex-col mt-1">
                          <span className="text-xs text-gray-500">Email</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm md:text-sm text-gray-900">
                              {method.details.paypal_email}
                            </span>
                            <button
                              onClick={() => handleCopy(method.details.paypal_email, 'PayPal')}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors"
                            >
                              {copiedText === 'PayPal' ? t('copied') : t('copy')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Bank Transfer */}
                      {method.label === 'Bank Transfer' && (
                        <div className="space-y-2 mt-1">
                          {method.details.iban && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">IBAN</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm md:text-sm text-gray-900">
                                  {method.details.iban}
                                </span>
                                <button
                                  onClick={() => handleCopy(method.details.iban, 'IBAN')}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors"
                                >
                                  {copiedText === 'IBAN' ? t('copied') : t('copy')}
                                </button>
                              </div>
                            </div>
                          )}

                          {method.details.account_holder && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Account Holder</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm md:text-sm text-gray-900">
                                  {method.details.account_holder}
                                </span>
                                <button
                                  onClick={() => handleCopy(method.details.account_holder, 'Account Holder')}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors"
                                >
                                  {copiedText === 'Account Holder' ? t('copied') : t('copy')}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {method.details.bank_name && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Bank</span>
                              <span className="text-sm md:text-sm text-gray-900">
                                {method.details.bank_name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Satispay */}
                      {method.label === 'Satispay' && method.details.phone_number && (
                        <div className="flex flex-col mt-1">
                          <span className="text-xs text-gray-500">Phone</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-medium text-gray-900">
                              {method.details.phone_number}
                            </span>
                            <button
                              onClick={() => handleCopy(method.details.phone_number, 'Satispay')}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              {copiedText === 'Satispay' ? t('copied') : t('copy')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Klarna */}
                      {method.label === 'Klarna' && method.details.merchant_id && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('merchantId')}: {method.details.merchant_id}
                        </p>
                      )}

                      {/* Stripe */}
                      {method.label === 'Stripe' && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('onlinePaymentViaStripe')}
                        </p>
                      )}

                      {/* Cash */}
                      {method.label === 'Cash' && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('cashPaymentOnDelivery')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Reason - label Causale, plain text, gray copy button */}
      {details.payment_reason && (
        <div className="mt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Causale</span>
            <span className="text-sm text-gray-700">{details.payment_reason}</span>
            <button
              onClick={() => handleCopy(details.payment_reason!, t('paymentReason'))}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              {copiedText === t('paymentReason') ? t('copied') : t('copy')}
            </button>
          </div>
        </div>
      )}

      {/* Declared confirmation states */}
      {(details.payment_declared_confirmed || (details.payment_confirmation && (details.payment_confirmation.method_used || details.payment_confirmation.confirmed_at || details.payment_confirmation.paid_date))) ? (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-medium text-green-800">{t('customerDeclaredPayment')}</div>
              <div className="mt-1 text-sm text-green-700 space-y-0.5">
                <div>{t('methodUsed')}: {details.payment_confirmation?.method_used || '-'}</div>
                {details.payment_confirmation?.paid_date && (
                  <div>{t('paidOn')}: {details.payment_confirmation.paid_date}</div>
                )}
                {details.payment_confirmation?.confirmed_at && (
                  <div>{t('declaredAt')}: {new Date(details.payment_confirmation.confirmed_at).toLocaleString()}</div>
                )}
                {details.payment_confirmation?.note && (
                  <div>{t('note')}: {details.payment_confirmation.note}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsConfirmationModalOpen(true)}
          className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('confirmPaymentSent')}
        </button>
      )}

      <PaymentConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handlePaymentConfirm}
        paymentMethods={visiblePaymentMethods}
      />
    </div>
  );
} 