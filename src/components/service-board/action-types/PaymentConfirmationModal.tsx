"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';

interface BusinessPaymentMethod {
  id: string;
  label: string;
  details: Record<string, string>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (methodUsed: string, note: string, paidAt?: string) => void;
  paymentMethods: BusinessPaymentMethod[];
}

export default function PaymentConfirmationModal({ isOpen, onClose, onConfirm, paymentMethods }: Props) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [note, setNote] = useState('');
  const [paidAt, setPaidAt] = useState<string>('');
  const t = useTranslations('ServiceBoard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Preselect when a single method is available
  useEffect(() => {
    if (paymentMethods && paymentMethods.length === 1) {
      setSelectedMethod(paymentMethods[0].label);
    }
  }, [paymentMethods]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    onConfirm(selectedMethod, note, paidAt || undefined);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">{t('confirmPayment')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('selectPaymentMethodUsed')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setSelectedMethod(method.label)}
                  className={`p-3 text-left rounded-lg border ${selectedMethod === method.label ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                >
                  <div className="text-sm font-medium text-gray-900">{method.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('paymentDate')}</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('additionalNoteOptional')}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              placeholder={t('addPaymentInfo')}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!selectedMethod}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('confirmPayment')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
} 