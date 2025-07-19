import React from 'react';
import { InformationRequestDetails } from '@/types/service-board';

interface CustomFieldsProps {
  fields: InformationRequestDetails['request_fields'];
  responses?: InformationRequestDetails['customer_response'];
}

export const CustomFields: React.FC<CustomFieldsProps> = ({ fields, responses = {} }) => {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const value = responses[field.field_name];
        
        return (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">
                  {field.field_name}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {field.field_type}
                </div>
              </div>
              <div className="flex items-center">
                {field.field_type === 'checkbox' ? (
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    value ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {value && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                ) : field.field_type === 'select' ? (
                  <select
                    value={value as string || ''}
                    disabled
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {field.options?.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-700">
                    {value as string || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 