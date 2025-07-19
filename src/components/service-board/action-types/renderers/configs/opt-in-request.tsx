import React from 'react';
import { PropertyRendererConfig } from '../types';
import { OptInRequestDetails } from '@/types/service-board';
import { CustomFields } from '../custom';

type OptInRequestConfigType = Partial<Record<keyof OptInRequestDetails, PropertyRendererConfig>>;

export const optInRequestConfig: OptInRequestConfigType = {
  title: {
    type: 'text',
    priority: 1,
    format: 'heading',
    layout: 'full',
    showLabel: true,
  },
  description: {
    type: 'text',
    priority: 2,
    format: 'default',
    layout: 'full',
    showLabel: true,
    condition: (details: OptInRequestDetails) => Boolean(details.description),
  },
  service: {
    type: 'text',
    priority: 3,
    layout: 'inline',
    format: 'default',
  },
  status: {
    type: 'status',
    priority: 4,
    layout: 'inline',
    colorMap: {
      pending: 'yellow',
      accepted: 'green',
      declined: 'red',
    },
  },
  accepted_at: {
    type: 'datetime',
    priority: 5,
    layout: 'inline',
    showDate: true,
    showTime: true,
    condition: (details: OptInRequestDetails) => details.status === 'accepted',
  },
  declined_at: {
    type: 'datetime',
    priority: 6,
    layout: 'inline',
    showDate: true,
    showTime: true,
    condition: (details: OptInRequestDetails) => details.status === 'declined',
  },
  terms: {
    type: 'text',
    priority: 7,
    layout: 'full',
    format: 'default',
    condition: (details: OptInRequestDetails) => Boolean(details.terms),
  },
  benefits: {
    type: 'text',
    priority: 8,
    layout: 'full',
    format: 'default',
    condition: (details: OptInRequestDetails) => Boolean(details.benefits?.length),
  },
}; 