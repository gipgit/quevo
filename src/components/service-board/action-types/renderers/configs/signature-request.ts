import { PropertyRendererConfig } from '../types';
import { SignatureRequestDetails } from '@/types/service-board';

type SignatureRequestConfigType = Partial<Record<keyof SignatureRequestDetails | 'witness_details.name' | 'witness_details.signature_status' | 'witness_details.signature_date', PropertyRendererConfig>>;

export const signatureRequestConfig: SignatureRequestConfigType = {
  document_name: {
    type: 'text',
    priority: 1,
    format: 'heading',
    layout: 'full',
    showLabel: true,
  },
  document_url: {
    type: 'file',
    priority: 2,
    layout: 'full',
    showIcon: true,
    allowPreview: true,
  },
  signature_status: {
    type: 'status',
    priority: 3,
    layout: 'inline',
    colorMap: {
      pending: 'yellow',
      signed: 'green',
      rejected: 'red',
    },
  },
  signature_date: {
    type: 'datetime',
    priority: 4,
    layout: 'inline',
    showDate: true,
    showTime: true,
    condition: (details: SignatureRequestDetails) => details.signature_status === 'signed',
  },
  signature_method: {
    type: 'text',
    priority: 5,
    layout: 'inline',
    format: 'default',
  },
  signature_image_url: {
    type: 'file',
    priority: 6,
    layout: 'full',
    allowPreview: true,
    condition: (details: SignatureRequestDetails) => details.signature_status === 'signed',
  },
  rejection_reason: {
    type: 'text',
    priority: 7,
    layout: 'full',
    format: 'default',
    condition: (details: SignatureRequestDetails) => details.signature_status === 'rejected',
  },
}; 