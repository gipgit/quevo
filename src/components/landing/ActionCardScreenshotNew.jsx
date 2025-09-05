// New ActionCardScreenshot component
import React from 'react';
import Image from 'next/image';

const ActionCardScreenshotNew = ({ action, className = '' }) => {
  console.log('ActionCardScreenshotNew rendering with action:', action);
  
  const { icon, color } = action.iconData || {};
  const gradient = action.gradient || 'from-blue-500 to-purple-600';
  const actionType = action.key || 'generic_message';

  return (
    <div 
      className={`w-[280px] h-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden ${className}`}
      style={{ border: '3px solid green' }}
    >
      {/* Debug Header */}
      <div className="w-full h-8 bg-green-500 text-white text-center font-bold flex items-center justify-center">
        NEW COMPONENT - {actionType}
      </div>
      
      {/* Header with Action Icon and Title */}
      <div className={`w-full h-24 ${gradient} flex items-center justify-center relative`}>
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
        </div>

        {/* Action-Specific Content */}
        <div className="space-y-3">
          {actionType === 'signature_request' && (
            <div className="p-3 bg-red-100 rounded-lg">
              <h3 className="font-bold text-red-800">Signature Request</h3>
              <p className="text-sm text-red-700">Document: Contract.pdf</p>
              <p className="text-sm text-red-700">Status: Awaiting Signature</p>
            </div>
          )}
          
          {actionType === 'payment_request' && (
            <div className="p-3 bg-green-100 rounded-lg">
              <h3 className="font-bold text-green-800">Payment Request</h3>
              <p className="text-sm text-green-700">Amount: €250.00</p>
              <p className="text-sm text-green-700">Status: Pending</p>
            </div>
          )}
          
          {actionType === 'appointment_scheduling' && (
            <div className="p-3 bg-blue-100 rounded-lg">
              <h3 className="font-bold text-blue-800">Appointment Scheduling</h3>
              <p className="text-sm text-blue-700">Date: Dec 15, 2:00 PM</p>
              <p className="text-sm text-blue-700">Platform: Google Meet</p>
            </div>
          )}
          
          {actionType === 'information_request' && (
            <div className="p-3 bg-yellow-100 rounded-lg">
              <h3 className="font-bold text-yellow-800">Information Request</h3>
              <p className="text-sm text-yellow-700">Form fields for data collection</p>
              <p className="text-sm text-yellow-700">Status: Awaiting Response</p>
            </div>
          )}
          
          {!['signature_request', 'payment_request', 'appointment_scheduling', 'information_request'].includes(actionType) && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <h3 className="font-bold text-gray-800">Generic Action</h3>
              <p className="text-sm text-gray-700">Action Type: {actionType}</p>
              <p className="text-sm text-gray-700">Default content</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg text-center">
            View Details
          </div>
          <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg text-center">
            More Info
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCardScreenshotNew;
