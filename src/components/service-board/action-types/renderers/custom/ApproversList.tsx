"use client";

import React from 'react';
import { ApprovalRequestDetails } from '@/types/service-board';

interface ApproversListProps {
  approvers: ApprovalRequestDetails['required_approvers'];
}

export const ApproversList: React.FC<ApproversListProps> = ({ approvers }) => {
  return (
    <div className="space-y-4">
      {approvers.map((approver, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="font-medium">{approver.name}</div>
            <div className="text-xs text-gray-400">{approver.role}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`px-2 py-1 rounded text-sm ${
              approver.status === 'approved' ? 'bg-green-100 text-green-800' :
              approver.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {approver.status}
            </div>
            {approver.date && (
              <div className="text-xs text-gray-500 mt-1">
                {new Date(approver.date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 