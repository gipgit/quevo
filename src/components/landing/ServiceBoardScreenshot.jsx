// components/landing/ServiceBoardScreenshot.jsx
import React from 'react';
import Image from 'next/image';

const ServiceBoardScreenshot = ({ business, variant = 'mobile', className = '' }) => {
  const { theme } = business;

  if (variant === 'mobile') {
    return (
             <div 
         className={`w-[240px] h-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden ${className}`}
         style={{ fontFamily: theme?.fontFamily || 'Inter' }}
       >
        {/* Mobile Header with Cover Image */}
        <div className="w-full h-32 relative" style={{ background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.secondaryColor || '#1E40AF'})` }}>
          {business.coverImage ? (
            <Image
              src={business.coverImage}
              alt=""
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.primaryColor || '#3B82F6'})` }} />
          )}
          
          {/* Gradient Overlay for Smooth Blend */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${theme?.backgroundColor || '#F8FAFC'} 100%)`
            }}
          />
          
          {/* Profile Image */}
          <div className="absolute bottom-2 left-6 w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-lg">
            {business.profileImage ? (
              <Image
                src={business.profileImage}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <span className="text-lg font-medium text-gray-500">
                  {business.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-8 px-4">
          {/* Business Info */}
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold mb-1" style={{ color: theme?.textColor || '#1F2937' }}>
              {business.name}
            </h2>
            <h3 className="text-sm font-medium text-gray-600 mb-2" style={{ color: theme?.textColor || '#1F2937' }}>
              {business.boardTitle || 'Service Board'}
            </h3>
            <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded-full">
              {business.boardRef}
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-4">
            <div className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium" style={{ backgroundColor: theme?.primaryColor || '#3B82F6', color: theme?.buttonTextColor || '#FFFFFF' }}>
              Timeline
            </div>
            <div className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
              Appointments
            </div>
            <div className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
              Info
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="space-y-3">
            {/* Timeline Item 1 */}
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 mt-2 flex-shrink-0"></div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">2 hours ago</div>
                <div className="text-sm font-medium text-gray-900">Appointment Confirmed</div>
                <div className="text-xs text-gray-600">Your appointment has been confirmed for tomorrow</div>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600 mt-2 flex-shrink-0"></div>
              <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">1 day ago</div>
                <div className="text-sm font-medium text-gray-900">Service Request Created</div>
                <div className="text-xs text-gray-600">New service request submitted successfully</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
         <div 
       className={`min-w-[800px] max-w-[1200px] min-h-[500px] w-full bg-white rounded-2xl shadow-2xl overflow-hidden ${className}`}
       style={{ fontFamily: theme?.fontFamily || 'Inter' }}
     >
      {/* Top Navbar */}
      <div className="w-full bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Business Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {business.profileImage ? (
                <Image
                  src={business.profileImage}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <span className="text-sm font-medium text-gray-500">
                    {business.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: theme?.textColor || '#1F2937' }}>
                {business.name}
              </h1>
              <div className="text-sm text-gray-600">
                Board: {business.boardRef}
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6', color: theme?.buttonTextColor || '#FFFFFF' }}>
              Add Action
            </div>
            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
              Share
            </div>
          </div>
        </div>
      </div>



              {/* Three Column Layout */}
        <div className="px-2 pb-4">
          <div className="grid grid-cols-8 gap-1">
            {/* Timeline Section - Even Narrower */}
            <div className="col-span-4 p-3">
              <div className="space-y-2">
                <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Appointment Confirmed</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Service Request Created</div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="col-span-2 p-3">
              <div className="space-y-2">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="text-sm font-medium text-gray-900">Tomorrow at 2:00 PM</div>
                  <div className="text-xs text-gray-700">Service consultation</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="text-sm font-medium text-gray-900">Next week</div>
                  <div className="text-xs text-gray-700">Follow-up meeting</div>
                </div>
              </div>
            </div>

            {/* Business Info Section - Simulating Business Profile */}
            <div className="col-span-2 p-3">
              <div className="space-y-3">
                {/* Cover Image with Profile Image Overlay */}
                <div className="relative h-20 rounded-lg overflow-hidden" style={{ background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.secondaryColor || '#1E40AF'})` }}>
                  {business.coverImage ? (
                    <Image
                      src={business.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.secondaryColor || '#1E40AF'})` }} />
                  )}
                  
                  {/* Gradient Overlay for Smooth Blend */}
                  <div 
                    className="absolute inset-0" 
                    style={{ 
                      background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${theme?.backgroundColor || '#F8FAFC'} 100%)`
                    }}
                  />
                  
                  {/* Profile Image Overlapping */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-lg">
                    {business.profileImage ? (
                      <Image
                        src={business.profileImage}
                        alt=""
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <span className="text-sm font-medium text-gray-500">
                          {business.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Business Name */}
                <div className="text-center pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3" style={{ color: theme?.textColor || '#1F2937' }}>
                    {business.name}
                  </h3>
                </div>

                {/* Contact Buttons */}
                <div className="flex justify-center space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center space-x-3 pt-2">
                  {business.socialLinks?.map((social, index) => (
                    <div key={index} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme?.accentColor || '#60A5FA' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ServiceBoardScreenshot;
