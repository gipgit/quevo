import React from 'react';
import { BaseActionDetails } from '@/types/service-board';

export interface BaseRendererProps<T extends BaseActionDetails> {
  field: {
    key: string;
    label: string;
    type: 'text' | 'date' | 'currency' | 'status' | 'custom';
    shouldRender?: (details: T) => boolean;
    render?: (value: any, details: T) => React.ReactNode;
  };
  value: any;
  details: T;
}

export interface BaseRendererConfig<T extends BaseActionDetails> {
  key: string;
  label: string;
  type: 'text' | 'date' | 'currency' | 'status' | 'custom';
  shouldRender?: (details: T) => boolean;
  render?: (value: any, details: T) => React.ReactNode;
}

export default function BaseRenderer<T extends BaseActionDetails>({ 
  field, 
  value, 
  details 
}: BaseRendererProps<T>) {
  if (field.shouldRender && !field.shouldRender(details)) {
    return null;
  }

  // If there's a custom render function, use it
  if (field.render) {
    return <>{field.render(value, details)}</>;
  }

  // Default rendering based on type
  switch (field.type) {
    case 'date':
      return value ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">{field.label}</label>
          <div className="text-sm text-gray-900">
            {new Date(value).toLocaleDateString()}
          </div>
        </div>
      ) : null;

    case 'currency':
      return value ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">{field.label}</label>
          <div className="text-3xl font-bold text-primary">
            {typeof value === 'number' 
              ? new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: details.currency || 'USD'
                }).format(value)
              : value}
          </div>
        </div>
      ) : null;

    case 'status':
      return value ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">{field.label}</label>
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-800">
            {value}
          </div>
        </div>
      ) : null;

    case 'text':
    default:
      return value ? (
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">{field.label}</label>
          <div className="text-sm text-gray-900">{value}</div>
        </div>
      ) : null;
  }
} 