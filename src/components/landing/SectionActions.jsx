// components/landing/SectionActions.jsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { features, getFeatureData, getActionIconAndColor } from '@/lib/unified-action-system';
// import ActionCardScreenshot from './ActionCardScreenshotNew';

// Action-specific preview component
const ActionCardScreenshot = ({ action, className = '' }) => {
  const { icon, color } = action.iconData || {};
  const gradient = action.gradient || 'from-blue-500 to-purple-600';
  const actionType = action.key || 'generic_message';

  const renderActionSpecificContent = () => {
    switch (actionType) {
      case 'appointment_scheduling':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Scheduled for Dec 15, 2:00 PM</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meeting Type</span>
                <span className="text-sm font-medium text-gray-900">Online Meeting</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Platform</span>
                <span className="text-sm font-medium text-gray-900">Google Meet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium text-gray-900">30 minutes</span>
              </div>
            </div>
          </div>
        );

      case 'payment_request':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-yellow-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Payment Pending</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-bold text-gray-900">€250.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due Date</span>
                <span className="text-sm font-medium text-gray-900">Dec 20, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reference</span>
                <span className="text-sm font-medium text-gray-900">#PAY-001</span>
              </div>
            </div>
          </div>
        );

      case 'signature_request':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-yellow-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Awaiting Signature</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Document</span>
                <span className="text-sm font-medium text-gray-900">Contract.pdf</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deadline</span>
                <span className="text-sm font-medium text-gray-900">Dec 20, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pages</span>
                <span className="text-sm font-medium text-gray-900">3 pages</span>
              </div>
            </div>
          </div>
        );

      case 'information_request':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Information Required</span>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Company Name *</label>
                <div className="h-8 bg-gray-100 border border-gray-200 rounded px-2 flex items-center">
                  <span className="text-xs text-gray-400">Enter company name...</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Project Budget</label>
                <select className="h-8 w-full bg-gray-100 border border-gray-200 rounded px-2 text-xs">
                  <option>€0 - €10,000</option>
                  <option>€10,000 - €50,000</option>
                  <option>€50,000+</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">2 of 3 tasks completed</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Review project requirements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-green-500 bg-green-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 line-through text-gray-500">Submit initial proposal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Schedule follow-up meeting</span>
              </div>
            </div>
          </div>
        );

      case 'approval_request':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-orange-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Pending Approval</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Request Type</span>
                <span className="text-sm font-medium text-gray-900">Budget Approval</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-medium text-gray-900">€5,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requested By</span>
                <span className="text-sm font-medium text-gray-900">John Smith</span>
              </div>
            </div>
          </div>
        );

      case 'feedback_request':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Awaiting Feedback</span>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">How was your experience?</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 ${i <= 4 ? 'border-yellow-400 bg-yellow-100' : 'border-gray-300'}`}></div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">Comments</label>
                <div className="h-16 bg-gray-100 border border-gray-200 rounded px-2 flex items-start pt-1">
                  <span className="text-xs text-gray-400">Share your thoughts...</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'document_download':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Documents Ready</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Project Report.pdf</span>
                </div>
                <span className="text-xs text-gray-500">2.4 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Invoice_2024.pdf</span>
                </div>
                <span className="text-xs text-gray-500">1.8 MB</span>
              </div>
            </div>
          </div>
        );

      case 'resource_link':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Resources Available</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Project Documentation</h3>
                  <p className="text-xs text-gray-500">docs.company.com/project</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900">Training Videos</h3>
                  <p className="text-xs text-gray-500">youtube.com/playlist</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'milestone_update':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Milestone Reached</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Milestone</span>
              <span className="text-sm font-medium text-gray-900">Phase 1 Complete</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Next Milestone</span>
              <span className="text-sm font-medium text-gray-900">Dec 30</span>
            </div>
          </div>
        );

      case 'media_upload':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Upload Required</span>
              </div>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">Drop files here or click to upload</p>
              <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG up to 10MB</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Required Files</span>
              <span className="text-sm font-medium text-gray-900">2 of 3 uploaded</span>
            </div>
          </div>
        );

      case 'generic_message':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>New Message</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">JS</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">Hi! I wanted to follow up on our discussion about the project timeline. When do you think we can schedule the next review meeting?</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-sm rounded-lg text-center">Reply</div>
              <div className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm rounded-lg text-center">Mark as Read</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Priority</span>
              <span className="text-sm font-medium text-gray-900">High</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-sm font-medium text-gray-900">In Progress</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`w-[280px] h-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* Header with Action Icon and Title */}
      <div className={`w-full h-24 ${gradient} flex items-center justify-center relative`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
        
        {/* Action Icon */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {icon ? (
            <img
              src={icon}
              alt=""
              className="w-8 h-8 object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-white/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-4">
        {/* Action Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {action.title}
          </h2>
        </div>

        {/* Action-Specific Content */}
        {renderActionSpecificContent()}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg text-center">
            {actionType === 'approval_request' ? 'Respond' : 
             actionType === 'checklist' ? 'Update' :
             actionType === 'information_request' ? 'Submit' :
             actionType === 'feedback_request' ? 'Submit' :
             'View Details'}
          </div>
          <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg text-center">
            More Info
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SectionActions({ locale }) {
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Common');
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(4000); // 4 seconds per action

  // Use the passed locale prop instead of detecting from URL
  const currentLocale = ['it', 'en', 'es', 'de', 'fr'].includes(locale) ? locale : 'it';

  // Auto-play slideshow
  useEffect(() => {
    if (!isAutoPlaying) {
      setTimeRemaining(4000);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 4000 - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setCurrentActionIndex((prev) => (prev + 1) % features.length);
        setTimeRemaining(4000);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentActionIndex]);

  const handleActionSelect = (index) => {
    setCurrentActionIndex(index);
    setIsAutoPlaying(false);
    setTimeRemaining(4000);
    
    // Resume auto-play after 8 seconds of manual navigation
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const currentAction = features[currentActionIndex];
  const progressPercentage = ((4000 - timeRemaining) / 4000) * 100;

  // Get localized action data
  const getLocalizedAction = (action) => {
    return getFeatureData(action.key, currentLocale);
  };

  const localizedCurrentAction = getLocalizedAction(currentAction);

  // Temporary debug - remove after testing
  console.log('SectionActions render:', {
    currentActionIndex,
    currentAction,
    localizedCurrentAction,
    actionKey: currentAction?.key
  });

  return (
    <section className="min-h-screen bg-white flex items-center">
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">

        {/* Primary Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('Actions.title')}
          </h1>
          <p className="text-md lg:text-xl text-gray-600 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8">
            {t('Actions.subtitle')}
          </p>
        </div>

        {/* Actions Cards Row - Moved above the preview */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-7xl mx-auto">
            {features.map((action, index) => {
              const localizedAction = getLocalizedAction(action);
              return (
                <div
                  key={action.id}
                  className={`border rounded-xl transition-all duration-300 cursor-pointer text-center ${
                    index === currentActionIndex
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  onClick={() => handleActionSelect(index)}
                >
                  {/* Action Header */}
                  <div className="p-2">
                    {/* Action Icon - Much bigger and centered, rounder */}
                    <div className={`flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      getActionIconAndColor(action.key).color
                    }`}>
                      <img 
                        src={getActionIconAndColor(action.key).icon}
                        alt={localizedAction.title}
                        className="w-7 h-7 lg:w-8 lg:h-8"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <svg 
                        className="w-7 h-7 lg:w-8 lg:h-8 text-gray-600"
                        style={{ display: 'none' }}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    {/* Action Title - Centered, not bold */}
                    <h3 className={`text-xs lg:text-sm font-normal leading-tight ${
                      index === currentActionIndex ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {localizedAction.title}
                    </h3>

                    {/* Progress indicator at bottom of card */}
                    {index === currentActionIndex && isAutoPlaying && (
                      <div className="h-1 bg-blue-500 transition-all duration-50 ease-linear rounded-b-lg"
                           style={{ width: `${progressPercentage}%` }}>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card Screenshot Preview - Now full width below the actions */}
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 lg:p-12 overflow-hidden max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12">
              {/* Action Description - Added above the screenshot */}
              <div className="text-center mb-6">
                <h3 className="text-lg lg:text-xl font-medium text-gray-800 mb-3">
                  {localizedCurrentAction.title}
                </h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  {localizedCurrentAction.description}
                </p>
              </div>
              
              {/* Action Card Screenshot */}
              <div className="flex justify-center">
                <ActionCardScreenshot 
                  key={`${currentAction.key}-${currentActionIndex}-${Date.now()}`}
                  action={{
                    key: currentAction.key,
                    title: localizedCurrentAction.title,
                    description: localizedCurrentAction.description,
                    iconData: getActionIconAndColor(currentAction.key),
                    gradient: localizedCurrentAction.gradient
                  }}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}