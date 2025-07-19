import React from 'react';
import { PropertyRendererConfig } from '../types';
import { ApprovalRequestDetails } from '@/types/service-board';
import { ApproversList } from '../custom';

type ApprovalRequestConfigType = Partial<Record<keyof ApprovalRequestDetails, PropertyRendererConfig>>;

export const approvalRequestConfig: ApprovalRequestConfigType = {
  request_title: {
    type: 'text',
    priority: 1,
    format: 'heading',
    layout: 'full',
    showLabel: true,
  },
  request_description: {
    type: 'text',
    priority: 2,
    format: 'default',
    layout: 'full',
    showLabel: true,
  },
  approval_status: {
    type: 'status',
    priority: 3,
    layout: 'inline',
    colorMap: {
      pending: 'yellow',
      approved: 'green',
      rejected: 'red',
    },
  },
  approval_date: {
    type: 'datetime',
    priority: 4,
    layout: 'inline',
    showDate: true,
    showTime: true,
    condition: (details: ApprovalRequestDetails) => 
      details.approval_status === 'approved' || details.approval_status === 'rejected',
  },
  approver_notes: {
    type: 'text',
    priority: 5,
    layout: 'full',
    format: 'default',
    condition: (details: ApprovalRequestDetails) => Boolean(details.approver_notes),
  },
  required_approvers: {
    type: 'custom',
    priority: 6,
    layout: 'full',
    render: (approvers: ApprovalRequestDetails['required_approvers']): JSX.Element => {
      return <ApproversList approvers={approvers} />;
    },
  },
  attachments: {
    type: 'custom',
    priority: 7,
    layout: 'full',
    condition: (details: ApprovalRequestDetails) => Boolean(details.attachments?.length),
    render: (attachments: ApprovalRequestDetails['attachments']): JSX.Element => {
      return (
        <div className="flex flex-wrap gap-2">
          {attachments?.map((attachment, index) => (
            <a
              key={index}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-white rounded-md border border-gray-200 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {attachment.name}
            </a>
          ))}
        </div>
      );
    },
  },

}; 