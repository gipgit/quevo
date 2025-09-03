// components/landing/ActionCardScreenshot.jsx
import React from 'react';
import Image from 'next/image';

const ActionCardScreenshot = ({ action, className = '' }) => {
  const { icon, color } = action.iconData || {};
  const gradient = action.gradient || 'from-blue-500 to-purple-600';

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

        {/* Action Status */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>

        {/* Action Details */}
        <div className="space-y-3">
          {/* Priority Level */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Priority</span>
            <span className="text-sm font-medium text-gray-900">High</span>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Due Date</span>
            <span className="text-sm font-medium text-gray-900">Tomorrow</span>
          </div>

          {/* Assigned To */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Assigned</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xs text-white font-medium">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-900">John Doe</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 py-2 px-3 bg-blue-500 text-white text-sm font-medium rounded-lg text-center">
            Update
          </div>
          <div className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg text-center">
            View Details
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionCardScreenshot;
