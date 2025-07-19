"use client";

import React from 'react';
import { ChecklistDetails } from '@/types/service-board';

interface ChecklistItemsProps {
  items: ChecklistDetails['items'];
}

export const ChecklistItems: React.FC<ChecklistItemsProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 pt-1">
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              item.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            }`}>
              {item.is_completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className={`font-medium ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                {item.text}
                {item.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              {item.completed_at && (
                <div className="text-xs text-gray-500">
                  {new Date(item.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>
            {item.notes && (
              <div className="mt-2 text-sm text-gray-600">{item.notes}</div>
            )}
            {item.attachments && item.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-1 text-xs bg-white rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {attachment.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 