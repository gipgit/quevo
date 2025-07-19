"use client";

import React, { useEffect, useState } from 'react';
import PropertyRenderer from '@/components/service-board/action-types/renderers/PropertyRenderer';
import { approvalRequestConfig } from '@/components/service-board/action-types/renderers/configs/approval-request';
import { checklistConfig } from '@/components/service-board/action-types/renderers/configs/checklist';
import { videoMessageConfig } from '@/components/service-board/action-types/renderers/configs/video-message';
import { optInRequestConfig } from '@/components/service-board/action-types/renderers/configs/opt-in-request';
import { ServiceBoardAction, isApprovalRequestDetails, isChecklistDetails, isVideoMessageDetails, isOptInRequestDetails } from '@/types/service-board';

export default function ActionsPage() {
  const [actions, setActions] = useState<ServiceBoardAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceBoardActions();
  }, []);

  const fetchServiceBoardActions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Replace this with your actual API endpoint
      const response = await fetch('/api/service-board/actions');
      if (!response.ok) {
        throw new Error('Failed to fetch service board actions');
      }
      
      const data = await response.json();
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching actions');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Loading actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-red-800">Error loading actions</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">{error}</div>
          <button
            onClick={fetchServiceBoardActions}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const approvalRequests = actions.filter(action => 
    action.action_type === 'approval_request' && isApprovalRequestDetails(action.action_details)
  );

  const checklists = actions.filter(action => 
    action.action_type === 'checklist' && isChecklistDetails(action.action_details)
  );

  const videoMessages = actions.filter(action => 
    action.action_type === 'video_message' && isVideoMessageDetails(action.action_details)
  );

  const optInRequests = actions.filter(action => 
    action.action_type === 'opt_in_request' && isOptInRequestDetails(action.action_details)
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Service Board Actions</h1>

      <div className="space-y-12">
        {approvalRequests.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Approval Requests</h2>
            <div className="space-y-8">
              {approvalRequests.map(action => (
                <div key={action.action_id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{action.action_title}</h3>
                    <p className="text-sm text-gray-600">{action.action_description}</p>
                  </div>
                  <PropertyRenderer
                    config={approvalRequestConfig}
                    data={action.action_details}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {checklists.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Checklists</h2>
            <div className="space-y-8">
              {checklists.map(action => (
                <div key={action.action_id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{action.action_title}</h3>
                    <p className="text-sm text-gray-600">{action.action_description}</p>
                  </div>
                  <PropertyRenderer
                    config={checklistConfig}
                    data={action.action_details}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {videoMessages.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Video Messages</h2>
            <div className="space-y-8">
              {videoMessages.map(action => (
                <div key={action.action_id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{action.action_title}</h3>
                    <p className="text-sm text-gray-600">{action.action_description}</p>
                  </div>
                  <PropertyRenderer
                    config={videoMessageConfig}
                    data={action.action_details}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {optInRequests.length > 0 && (
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6">Opt-in Requests</h2>
            <div className="space-y-8">
              {optInRequests.map(action => (
                <div key={action.action_id} className="border-t pt-6 first:border-t-0 first:pt-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{action.action_title}</h3>
                    <p className="text-sm text-gray-600">{action.action_description}</p>
                  </div>
                  <PropertyRenderer
                    config={optInRequestConfig}
                    data={action.action_details}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {actions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No actions found</p>
          </div>
        )}
      </div>
    </div>
  );
} 