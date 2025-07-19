"use client";

import React, { useState } from 'react';

interface BusinessPaymentMethod {
  id: string;
  label: string;
  details: Record<string, string>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (methodUsed: string, note: string) => void;
  paymentMethods: BusinessPaymentMethod[];
}

export default function PaymentConfirmationModal({ isOpen, onClose, onConfirm, paymentMethods }: Props) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    onConfirm(selectedMethod, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method Used
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.label}
                    checked={selectedMethod === method.label}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add any additional information about your payment..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedMethod}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 