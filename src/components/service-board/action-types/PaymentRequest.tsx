"use client";

import React, { useState } from 'react';
import { PaymentRequestDetails } from '@/types/service-board';
import { paymentRequestConfig } from './renderers/configs/payment-request';
import PaymentRequestRenderer from './renderers/PaymentRequestRenderer';
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
}

export default function PaymentRequest({ details, onUpdate }: Props) {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const { businessPaymentMethods } = useBusinessProfile() as { businessPaymentMethods: BusinessPaymentMethod[] };
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const t = useTranslations('ServiceBoard');

  // Filter out payment methods that are hidden for this action
  const visiblePaymentMethods = businessPaymentMethods?.filter((method: BusinessPaymentMethod) => 
    !details.hidden_payment_methods?.includes(method.id)
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

  const handlePaymentConfirm = async (methodUsed: string, note: string) => {
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
      await fetch(`/api/service-board/actions/${details.action_id}/payment-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method_used: methodUsed,
          note: note || undefined,
        }),
      });

      // Then update the local state
      onUpdate(updatedDetails);
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Details */}
      <div className="mb-2">
        {paymentRequestConfig.map((field) => {
          if (field.shouldRender && !field.shouldRender(details)) return null;
          return (
            <div key={field.key} className="space-y-2">
          <PaymentRequestRenderer
                field={field}
                value={details[field.key as keyof PaymentRequestDetails]}
                details={details}
              />
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      {visiblePaymentMethods.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">Available Payment Methods</h3>
          <div className="space-y-2">
            {visiblePaymentMethods.map((method: BusinessPaymentMethod, index: number) => {
              const config = ALLOWED_PAYMENT_METHODS.find(
                (pm: PaymentMethodConfig) => pm.name.toLowerCase() === method.label?.toLowerCase() || pm.id === method.id
              );
              const iconPath = config?.iconPath;

              return (
                <div key={index} className="relative p-4 border-[1px] border-gray-400 bg-gray-0 rounded-lg shadow-sm">
                  <div className="flex items-start gap-x-4 md:gap-x-6 gap-y-2">
                    {/* Icon */}
                    {iconPath && (
                      <div className="flex-shrink-0">
                        <Image src={iconPath} width={40} height={40} alt={`-`} className="w-8 sm:w-10 md:w-12 lg:w-12"/>
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-base font-bold text-gray-900">{method.label}</h4>
                      
                      {/* PayPal */}
                      {method.label === 'PayPal' && method.details.paypal_email && (
                        <div className="flex flex-col mt-1">
                          <span className="text-xs text-gray-500">Email</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-medium text-gray-900">
                              {method.details.paypal_email}
                            </span>
                            <button
                              onClick={() => handleCopy(method.details.paypal_email, 'PayPal')}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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
                                <span className="text-sm md:text-base text-gray-900">
                                  {method.details.iban}
                                </span>
                                <button
                                  onClick={() => handleCopy(method.details.iban, 'IBAN')}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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
                                <span className="text-sm md:text-base font-medium text-gray-900">
                                  {method.details.account_holder}
                                </span>
                                <button
                                  onClick={() => handleCopy(method.details.account_holder, 'Account Holder')}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                >
                                  {copiedText === 'Account Holder' ? t('copied') : t('copy')}
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {method.details.bank_name && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Bank</span>
                              <span className="text-sm md:text-base font-medium text-gray-900">
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
                          Online payment via Stripe
                        </p>
                      )}

                      {/* Cash */}
                      {method.label === 'Cash' && (
                        <p className="text-sm text-gray-600 mt-1">
                          Cash payment on delivery/service
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

      {/* Payment Reason - Display once after payment methods */}
      {details.payment_reason && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">Payment Reason</h3>
          <div className="flex items-center gap-x-3">
            <div className="px-4 py-3 w-full rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-between gap-x-3">
              <span className="text-base font-italic text-purple-800 italic">
                {details.payment_reason}
              </span>
              <button
                onClick={() => handleCopy(details.payment_reason!, 'Payment Reason')}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1 rounded-md hover:bg-purple-50 transition-colors"
              >
                {copiedText === 'Payment Reason' ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show confirmation status if payment is confirmed */}
      {details.payment_confirmation ? (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Payment Confirmed</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{t('methodUsed')}: {details.payment_confirmation.method_used}</p>
                <p>{t('confirmedAt')}: {new Date(details.payment_confirmation.confirmed_at).toLocaleString()}</p>
                {details.payment_confirmation.note && (
                                      <p className="mt-1">{t('note')}: {details.payment_confirmation.note}</p>
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
          Confirm Payment Sent
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