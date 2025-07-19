import React from 'react';
import { PropertyRendererConfig } from '../types';
import { ChecklistDetails } from '@/types/service-board';
import { ChecklistItems, ProgressBar } from '../custom';

type ChecklistConfigType = Partial<Record<keyof ChecklistDetails, PropertyRendererConfig>>;

export const checklistConfig: ChecklistConfigType = {
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
    condition: (details: ChecklistDetails) => Boolean(details.description),
  },
  items: {
    type: 'custom',
    priority: 3,
    layout: 'full',
    render: (items: ChecklistDetails['items']): JSX.Element => {
      return <ChecklistItems items={items} />;
    },
  },
}; 