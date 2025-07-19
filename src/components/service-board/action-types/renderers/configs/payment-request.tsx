import React from 'react';
import { BaseRendererConfig } from '../BaseRenderer';
import { PaymentRequestDetails } from '@/types/service-board';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const statusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const paymentRequestConfig: BaseRendererConfig<PaymentRequestDetails>[] = [
  {
    key: 'amount',
    label: 'Amount',
    type: 'currency',
    shouldRender: (details) => typeof details.amount === 'number' && typeof details.currency === 'string',
  },
  {
    key: 'payment_status',
    label: 'Status',
    type: 'status',
    shouldRender: (details) => typeof details.payment_status === 'string',
    render: (value) => {
      const status = value as PaymentStatus;
      return (
        <div className="inline-flex items-center text-xs font-medium capitalize">
          <span className={`px-2 py-1 rounded-full ${statusColors[status]}`}>{statusLabels[status]}</span>
        </div>
      );
    },
  },
]; 