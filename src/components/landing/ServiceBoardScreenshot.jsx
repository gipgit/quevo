// components/landing/ServiceBoardScreenshot.jsx
import React from 'react';
import Image from 'next/image';

const ServiceBoardScreenshot = ({ business, variant = 'mobile', className = '' }) => {
  const { theme } = business;

  if (variant === 'mobile') {
    return (
             <div 
         className={`w-[240px] h-[480px] rounded-3xl shadow-lg overflow-hidden ${className}`}
         style={{ 
           fontFamily: theme?.fontFamily || 'Inter',
           backgroundColor: theme?.backgroundColor || '#FFFFFF'
         }}
       >
        {/* Mobile Header with Cover Image */}
        <div className="w-full h-20 relative" style={{ background: `linear-gradient(to bottom right, ${theme?.primaryColor || '#3B82F6'}, ${theme?.secondaryColor || '#1E40AF'})` }}>
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
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2"
            style={{ borderColor: theme?.backgroundColor || '#FFFFFF' }}
          >
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

        {/* Content Area */}
        <div className="pt-3 px-4">
          {/* Business Info */}
          <div className="text-center mb-3">
            <h2 className="text-sm font-medium mb-0.5" style={{ color: theme?.textColor || '#1F2937' }}>
              {business.boardTitle || 'Service Board'}
            </h2>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-xs font-normal" style={{ color: theme?.textColor || '#1F2937' }}>
                {business.name}
              </div>
              <span className="text-xs font-mono" style={{ color: theme?.textColor || '#1F2937' }}>
                {business.boardRef}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <div className="flex-1 text-center py-2 px-3 text-[10px] font-bold border-b-2" style={{ color: theme?.primaryColor || '#3B82F6', borderColor: theme?.primaryColor || '#3B82F6' }}>
              Timeline
            </div>
            <div className="flex-1 text-center py-2 px-3 text-[10px] font-medium text-gray-600">
              Appointments
            </div>
            <div className="flex-1 text-center py-2 px-3 text-[10px] font-medium text-gray-600">
              Info
            </div>
          </div>

          {/* Timeline Preview */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-300 z-0"></div>
            
          <div className="space-y-3 pl-3">
              {/* Timeline Item 1 - Payment Request */}
            <div className="relative">
                <div className="absolute -left-3 w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-600 mt-2 flex-shrink-0 z-10"></div>
                <div className="w-[95%] bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-gray-900 mb-1">Payment Request</div>
                  
                  {/* Reason of payment - moved out of gray card */}
                  <div className="flex items-center justify-center gap-1 mb-2 text-center">
                    <span className="text-[10px] font-normal text-gray-500">Reason of payment</span>
                    <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-800 mb-2">Service consultation fee</div>
                  
                  {/* Bank transfer details - white background */}
                  <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center justify-center gap-1 mb-1 text-center">
                      <span className="text-[10px] font-normal text-gray-500">IBAN</span>
                      <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-800">IT60X0542811101000000123456</div>
                  </div>
                  
                  {/* PayPal payment method */}
                  <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">P</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-800">PayPal</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-xs font-bold text-gray-900">€ 150.00</div>
                    <span className="px-1 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">pending</span>
                  </div>
                  <div className="text-[10px] text-gray-500">2 hours ago</div>
                </div>
              </div>

              {/* Timeline Item 2 - Document Download */}
              <div className="relative">
                <div className="absolute -left-3 w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 mt-2 flex-shrink-0 z-10"></div>
                <div className="w-[95%] bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <div className="text-[10px] font-bold text-gray-900 mb-1">Document Download</div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800">PDF</span>
                    <h4 className="text-xs font-normal text-gray-900">Service Agreement</h4>
                    <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors text-[10px] font-medium text-blue-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Contract and terms document</div>
                  <div className="text-[10px] text-gray-500">1 day ago</div>
                </div>
              </div>

              {/* Timeline Item 3 - Milestone Update */}
              <div className="relative">
                <div className="absolute -left-3 w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600 mt-2 flex-shrink-0 z-10"></div>
                <div className="w-[95%] bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-gray-900 mb-1">Milestone Update</div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-xs font-semibold text-gray-900">Initial Consultation</h3>
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Project milestone in progress</div>
                  <div className="text-[10px] text-gray-500">2 days ago</div>
              </div>
            </div>

              {/* Timeline Item 4 - Checklist */}
            <div className="relative">
                <div className="absolute -left-3 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 mt-2 flex-shrink-0 z-10"></div>
                <div className="w-[95%] bg-white border border-gray-200 rounded-lg p-2 text-center">
                  <div className="text-xs font-bold text-gray-900 mb-1">Checklist</div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-xs font-semibold text-gray-900">Requirements</h3>
                    <span className="text-xs font-medium text-gray-700">75%</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">Project requirements verification</div>
                  <div className="text-[10px] text-gray-500">3 days ago</div>
                </div>
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
       className={`min-w-[800px] max-w-[1200px] h-[500px] max-h-[500px] w-[250vw] md:w-full md:max-w-[1200px] rounded-2xl shadow-lg overflow-hidden ${className}`}
       style={{ 
         fontFamily: theme?.fontFamily || 'Inter',
         backgroundColor: theme?.backgroundColor || '#FFFFFF'
       }}
     >
      {/* Top Navbar */}
      <div 
        className="w-full border-b border-gray-200 px-6 py-3"
        style={{ backgroundColor: theme?.backgroundColor || '#FFFFFF' }}
      >
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
              <h2 className="text-sm font-medium mb-1" style={{ color: theme?.textColor || '#1F2937' }}>
                {business.boardTitle || 'Service Board'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-xs font-normal" style={{ color: theme?.textColor || '#1F2937' }}>
                  {business.name}
                </div>
                <div className="text-xs" style={{ color: theme?.textColor || '#1F2937' }}>
                  {business.boardRef}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 text-gray-600 text-[10px]">
              <span>flowia.io/{business.url}/s/{business.boardRef}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
              Request Support
            </div>
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6', color: theme?.buttonTextColor || '#FFFFFF' }}>
              Add Action
            </div>
          </div>
        </div>
      </div>



              {/* Three Column Layout */}
        <div className="px-2 pb-4">
          <div className="grid grid-cols-8 gap-0.5">
            {/* Timeline Section - Even Narrower */}
            <div className="col-span-4 p-3">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gray-300 z-0"></div>
                
              <div className="space-y-2 pl-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="relative">
                      <div className="absolute -left-8 w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-600 mt-1 flex-shrink-0 z-10"></div>
                      <div className="w-[95%]">
                        <div className="text-sm font-bold text-gray-900 mb-1">Payment Request</div>
                        
                        {/* Reason of payment - moved out of gray card */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-normal text-gray-500">Reason of payment</span>
                          <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-800 mb-2">Service consultation fee</div>
                        
                        {/* Bank transfer details - white background */}
                        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-normal text-gray-500">IBAN</span>
                            <button className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-[10px] text-gray-800">IT60X0542811101000000123456</div>
                        </div>
                        
                        {/* PayPal payment method */}
                        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">P</span>
                            </div>
                            <span className="text-[10px] font-medium text-gray-800">PayPal</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm font-bold text-gray-900">€ 150.00</div>
                          <span className="px-1 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">pending</span>
                        </div>
                        <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="relative">
                      <div className="absolute -left-8 w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 mt-1 flex-shrink-0 z-10"></div>
                      <div className="w-[95%]">
                        <div className="text-sm font-bold text-gray-900 mb-1">Document Download</div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800">PDF</span>
                          <h4 className="text-sm font-normal text-gray-900">Service Agreement</h4>
                          <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors text-[10px] font-medium text-blue-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">1 day ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="relative">
                      <div className="absolute -left-8 w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600 mt-1 flex-shrink-0 z-10"></div>
                      <div className="w-[95%]">
                        <div className="text-sm font-bold text-gray-900 mb-1">Milestone Update</div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">Initial Consultation</h3>
                          <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-3 w-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">2 days ago</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="relative">
                      <div className="absolute -left-8 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 mt-1 flex-shrink-0 z-10"></div>
                      <div className="w-[95%]">
                        <div className="text-sm font-bold text-gray-900 mb-1">Checklist</div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">Requirements</h3>
                          <span className="text-xs font-medium text-gray-700">75%</span>
                        </div>
                        <div className="text-xs text-gray-500">3 days ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Section */}
            <div className="col-span-2 p-3">
              <div className="space-y-2">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-bold text-gray-900 mb-2">Service consultation</div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">Tomorrow</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">2:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600">Zoom Meeting</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-xs text-blue-600">Open</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="text-sm font-bold text-gray-900 mb-2">Follow-up meeting</div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">Next week</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-900">10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">123 Main St</span>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
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
                  <div className="text-sm font-normal text-gray-900 mb-3" style={{ color: theme?.textColor || '#1F2937' }}>
                    {business.name}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex justify-center space-x-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme?.buttonBgColor || '#3B82F6' }}>
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center space-x-2 pt-1">
                  {business.socialLinks?.map((social, index) => (
                    <div key={index} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme?.accentColor || '#60A5FA' }}></div>
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
