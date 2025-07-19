import React from 'react';
import { PaymentRequestDetails } from '@/types/service-board';
import BaseRenderer, { BaseRendererProps } from './BaseRenderer';

type PaymentRequestRendererProps = BaseRendererProps<PaymentRequestDetails>;

export default function PaymentRequestRenderer({ 
  field, 
  value, 
  details 
}: PaymentRequestRendererProps) {
    return (
    <BaseRenderer<PaymentRequestDetails>
      field={field}
      value={value}
      details={details}
    />
  );
} 