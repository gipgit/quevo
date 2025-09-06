// components/landing/ActionCardScreenshot.jsx
import React from 'react';
import Image from 'next/image';

const ActionCardScreenshot = ({ action, className = '' }) => {
  // FORCE COMPLETE REBUILD - COMPONENT VERSION 3
  console.log('=== ActionCardScreenshot VERSION 3 RENDERING ===');
  console.log('Action received:', action);
  
  const { icon, color } = action.iconData || {};
  const gradient = action.gradient || 'from-blue-500 to-purple-600';
  
  // Use the action key directly if available, otherwise fall back to title detection
  const actionType = action.key || action.title?.toLowerCase().replace(/\s+/g, '_') || 'generic_message';
  
  console.log('ActionType calculated:', actionType);

  // Render specific content based on action type
  const renderActionSpecificContent = () => {
    console.log('renderActionSpecificContent called with actionType:', actionType);
    switch (actionType) {
      case 'appointment_scheduling':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Scheduled</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Date & Time</span>
              <span className="text-sm font-medium text-gray-900">Dec 15, 2:00 PM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Type</span>
              <span className="text-sm font-medium text-gray-900">Online Meeting</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Platform</span>
              <span className="text-sm font-medium text-gray-900">Google Meet</span>
            </div>
          </div>
        );

      case 'payment_request':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Payment Pending</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-bold text-gray-900">€250.00</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Method</span>
              <span className="text-sm font-medium text-gray-900">Credit Card</span>
            </div>
          </div>
        );

      case 'signature_request':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Awaiting Signature</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Document</span>
              <span className="text-sm font-medium text-gray-900">Contract.pdf</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Deadline</span>
              <span className="text-sm font-medium text-gray-900">Dec 20</span>
            </div>
          </div>
        );

      case 'checklist':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>In Progress</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Review project requirements</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-green-500 bg-green-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">Submit initial proposal</span>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                <span className="text-sm text-gray-700">Schedule follow-up meeting</span>
              </div>
            </div>
          </div>
        );

      case 'information_request':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Awaiting Response</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1">Company Name</label>
              <div className="h-6 bg-white border border-gray-200 rounded px-2 flex items-center">
                <span className="text-xs text-gray-400">Enter company name...</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1">Project Budget</label>
              <div className="h-6 bg-white border border-gray-200 rounded px-2 flex items-center">
                <span className="text-xs text-gray-400">€0 - €10,000</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1">Timeline</label>
              <div className="h-6 bg-white border border-gray-200 rounded px-2 flex items-center">
                <span className="text-xs text-gray-400">Select timeline...</span>
              </div>
            </div>
          </div>
        );

      case 'feedback_request':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Feedback Requested</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-2">How satisfied are you?</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((star) => (
                  <div key={star} className={`w-4 h-4 rounded ${star <= 4 ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
                ))}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="text-xs text-gray-600 block mb-1">Comments</label>
              <div className="h-12 bg-white border border-gray-200 rounded px-2 flex items-start pt-1">
                <span className="text-xs text-gray-400">Share your feedback...</span>
              </div>
            </div>
          </div>
        );

      case 'document_download':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready to Download</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Project Brief.pdf</span>
              </div>
              <span className="text-xs text-gray-500">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Contract Template.docx</span>
              </div>
              <span className="text-xs text-gray-500">1.8 MB</span>
            </div>
          </div>
        );

      case 'approval_request':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Awaiting Approval</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Request for Approval</span>
              <p className="text-xs text-gray-700">Please approve the proposed changes to the project scope and timeline.</p>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 py-2 px-3 bg-green-100 text-green-800 text-xs font-medium rounded-lg text-center">
                Approve
              </div>
              <div className="flex-1 py-2 px-3 bg-red-100 text-red-800 text-xs font-medium rounded-lg text-center">
                Reject
              </div>
            </div>
          </div>
        );

      case 'milestone_update':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Progress Update</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-bold text-gray-900">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-1">Update</span>
              <p className="text-xs text-gray-700">Phase 2 completed successfully. Moving to final implementation.</p>
            </div>
          </div>
        );

      case 'resource_link':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span>Resources Available</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Project Guidelines</span>
              </div>
              <span className="text-xs text-blue-600">View Link</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Support Resources</span>
              </div>
              <span className="text-xs text-blue-600">View Link</span>
            </div>
          </div>
        );

      case 'generic_message':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Message Sent</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Message</span>
              <p className="text-xs text-gray-700">Thank you for choosing our services. We'll be in touch soon with next steps.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Priority</span>
              <span className="text-sm font-medium text-gray-900">Normal</span>
            </div>
          </div>
        );

      case 'media_upload':
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>Upload Requested</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Upload Instructions</span>
              <p className="text-xs text-gray-700">Please upload photos or videos to document the service progress.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">File Types</span>
              <span className="text-sm font-medium text-gray-900">Photos, Videos</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Unknown Action</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 block mb-2">Action Type</span>
              <p className="text-xs text-gray-700">Action type: {actionType}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className={`w-[280px] h-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden ${className}`}
      style={{ border: '5px solid blue' }} // FORCE REBUILD - BLUE BORDER
    >
      {/* FORCE REBUILD INDICATOR */}
      <div className="w-full h-8 bg-red-500 text-white text-center font-bold flex items-center justify-center">
        VERSION 3 - ACTION: {actionType}
      </div>
      
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
            <Image
              src={icon}
              alt=""
              width={32}
              height={32}
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
          <p className="text-sm text-gray-600 leading-relaxed">
            {action.description}
          </p>
          {/* Temporary debug text */}
          <p className="text-xs text-red-600 font-bold">
            DEBUG: Action Type = {actionType}
          </p>
        </div>

        {/* Action-Specific Content */}
        <div className="p-4 bg-yellow-200 border border-yellow-400 rounded">
          <h3 className="font-bold text-lg">TEST: {actionType}</h3>
          <p>Action Key: {action.key}</p>
          <p>Action Title: {action.title}</p>
          <p>This should change for each action type!</p>
          <p>Current time: {new Date().toLocaleTimeString()}</p>
          {actionType === 'signature_request' && (
            <div className="mt-2 p-2 bg-red-200 rounded">
              <strong>SIGNATURE REQUEST CONTENT!</strong>
            </div>
          )}
          {actionType === 'payment_request' && (
            <div className="mt-2 p-2 bg-green-200 rounded">
              <strong>PAYMENT REQUEST CONTENT!</strong>
            </div>
          )}
          {actionType === 'appointment_scheduling' && (
            <div className="mt-2 p-2 bg-blue-200 rounded">
              <strong>APPOINTMENT SCHEDULING CONTENT!</strong>
            </div>
          )}
        </div>

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

export default ActionCardScreenshot;
