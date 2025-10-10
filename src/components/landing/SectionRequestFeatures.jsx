// components/landing/SectionRequestFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings } from 'lucide-react';

export default function SectionRequestFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('requestManagement');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Request features data with unique colors
  const requestFeatures = [
    {
      id: 'requestManagement',
      icon: "📋",
      title: t('RequestFeatures.features.requestManagement.title'),
      description: t('RequestFeatures.features.requestManagement.description'),
      color: {
        primary: '#3B82F6', // blue-500
        shadow: '#60A5FA' // blue-400
      }
    },
    {
      id: 'quotationGenerator',
      icon: "📄",
      title: t('RequestFeatures.features.quotationGenerator.title'),
      description: t('RequestFeatures.features.quotationGenerator.description'),
      color: {
        primary: '#14B8A6', // teal-500
        shadow: '#2DD4BF' // teal-400
      }
    }
  ];

  const renderFeaturePreview = () => {
    const currentFeature = requestFeatures.find(f => f.id === selectedFeature);
    
    switch (selectedFeature) {
      case 'quotationGenerator':
        return (
          <div 
            className="rounded-2xl shadow-2xl p-4 lg:p-8 border transition-all duration-300 ease-linear"
            style={{
              background: `linear-gradient(to bottom right, #000000, ${currentFeature?.color.primary || '#9CA3AF'})`,
              borderColor: currentFeature?.color.primary || '#9CA3AF'
            }}
          >
            <div className="bg-white rounded-xl p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Settings Panel */}
              <div className="lg:col-span-3 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium text-gray-900">Settings</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Quotation Number</p>
                      <p className="text-[10px] text-gray-700">QT-SR-2024-001</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Tax Percentage</p>
                      <p className="text-[10px] text-gray-700">22%</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Items (3)</p>
                      <p className="text-[10px] text-gray-700">3 items • €3,900 subtotal</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Introductory Text</p>
                      <p className="text-[10px] text-gray-700">Custom greeting message</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">Additional Notes</p>
                      <p className="text-[10px] text-gray-700">Final notes & terms</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotation Preview */}
              <div className="lg:col-span-6">
                <div className="flex justify-center">
                  <div className="bg-white p-6 max-w-sm w-full shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Acme Design Studio</p>
                      <p className="text-[10px] text-gray-600">123 Business St, Milan</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-900">Customer</p>
                      <p className="text-xs font-medium text-gray-900">John Smith</p>
                      <p className="text-[10px] text-gray-600">john@example.com</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-xs text-gray-900">
                      <span className="font-medium">QUOTATION</span>
                      <span className="text-[10px]"> N. QT-SR-2024-001 of Dec 15, 2024</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-700">
                      <span className="font-medium">Dear John Smith,</span><br />
                      we are pleased to provide you with a detailed quotation for the requested services.
                    </p>
                  </div>
                  
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-1 w-2/3 text-[10px] text-gray-900">Item</th>
                        <th className="text-right py-2 px-1 w-1/6 text-[10px] text-gray-900">Price</th>
                        <th className="text-center py-2 px-1 w-1/6 text-[10px] text-gray-900">Qty</th>
                        <th className="text-right py-2 px-1 w-1/6 text-[10px] text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-1">
                          <p className="text-[10px] font-semibold text-gray-900">Website Development</p>
                        </td>
                        <td className="py-2 px-1 text-right text-[10px] text-gray-900">€2,500.00</td>
                        <td className="py-2 px-1 text-center text-[10px] text-gray-900">1</td>
                        <td className="py-2 px-1 text-right font-medium text-[10px] text-gray-900">€2,500.00</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-1">
                          <p className="text-[10px] font-semibold text-gray-900">SEO Optimization</p>
                        </td>
                        <td className="py-2 px-1 text-right text-[10px] text-gray-900">€800.00</td>
                        <td className="py-2 px-1 text-center text-[10px] text-gray-900">1</td>
                        <td className="py-2 px-1 text-right font-medium text-[10px] text-gray-900">€800.00</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end">
                    <div className="w-48">
                      <div className="flex justify-between py-1 text-[10px] text-gray-700">
                        <span>Subtotal:</span>
                        <span className="text-xs font-medium">€3,300.00</span>
                      </div>
                      <div className="flex justify-between py-1 text-[10px] text-gray-700">
                        <span>Tax (22%):</span>
                        <span className="text-xs font-medium">€726.00</span>
                      </div>
                      <div className="flex justify-between py-2 border-t-2 border-gray-300 font-medium text-xs text-gray-900">
                        <span>Total:</span>
                        <span>€4,026.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>

              {/* Right Column - Action Buttons */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-gray-200 flex flex-col items-start gap-1.5 border border-gray-300">
                      <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 text-left leading-tight">Save Quotation</span>
                    </div>
                    
                    <div className="p-2 rounded-lg bg-gray-200 flex flex-col items-start gap-1.5 border border-gray-300">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-600 text-left leading-tight">Generate PDF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        );

      case 'requestManagement':
        return (
          <div 
            className="rounded-2xl shadow-2xl p-4 lg:p-8 border transition-all duration-300 ease-linear relative"
            style={{
              background: `linear-gradient(to bottom right, #000000, ${currentFeature?.color.primary || '#9CA3AF'})`,
              borderColor: currentFeature?.color.primary || '#9CA3AF'
            }}
          >
            <div className="bg-white rounded-xl p-4 lg:p-6 relative overflow-hidden">
              {/* Topbar */}
              <div className="mb-3 pb-2 border-b border-gray-200">
                <div className="grid grid-cols-3 items-center gap-4">
                  {/* Left Column - Title and Mobile Toggle */}
                  <div className="flex items-center gap-2">
                    {/* Mobile Toggle Button */}
                    <button
                      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                      className="lg:hidden p-1.5 rounded-lg bg-gray-100 border border-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <div className="text-sm font-medium text-gray-900">Service Requests</div>
                  </div>

                  {/* Middle Column - Progress Bar (hidden on mobile, visible on lg+) */}
                  <div className="hidden lg:flex items-center justify-center gap-2">
                    <div className="text-[10px] text-gray-600">
                      3 of 6 handled
                    </div>
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{width: '50%'}}></div>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      3 left
                    </div>
                  </div>

                  {/* Right Column - Navigation and Shortcuts (hidden on mobile, visible on lg+) */}
                  <div className="hidden lg:flex items-center justify-end gap-2">
                    {/* Navigation Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 rounded-lg opacity-50 cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-xs text-gray-600 px-2">
                        1 of 6
                      </span>
                      <button
                        className="p-1 rounded-lg"
                      >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      </button>
                    </div>

                    {/* Keyboard Shortcuts Button */}
                    <div className="relative group">
                      <button
                        className="p-1 rounded-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                  </div>

              <div className="flex gap-4 lg:gap-3 relative min-h-[500px]">
                {/* Mobile Sidebar Overlay */}
                {isMobileSidebarOpen && (
                  <div 
                    className="absolute inset-0 bg-black bg-opacity-50 z-40 lg:hidden rounded-lg"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                )}

                {/* Left Column - Request List (Sidebar on mobile) */}
                <div className={`
                  w-64 lg:w-40 flex-shrink-0
                  absolute lg:static top-0 left-0 bottom-0 z-50 lg:z-auto
                  transform transition-transform duration-300 ease-in-out
                  ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                  shadow-xl lg:shadow-none overflow-y-auto max-h-full
                  bg-gray-50 lg:bg-transparent rounded-lg lg:rounded-none p-3 lg:p-0
                `}>
                  {/* Mobile Header with Close Button */}
                  <div className="lg:hidden flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-gray-900">Service Requests</h2>
                    <button
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className="p-1.5 rounded-lg bg-gray-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                </div>

                {/* Request List */}
                  <div className="space-y-0">
                    <div className="p-2 border-l-4 border-l-blue-500">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">15 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-yellow-100 text-yellow-800" style={{fontSize: '0.55rem'}}>
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-[10px]">SR-001</span>
                      </div>
                      <div className="text-[10px] opacity-75">Website Dev</div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">14 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-green-100 text-green-800" style={{fontSize: '0.55rem'}}>
                          Done
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <svg className="w-2 h-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-[10px]">SR-002</span>
                      </div>
                      <div className="text-[10px] opacity-75">SEO Opt</div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">13 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-blue-100 text-blue-800" style={{fontSize: '0.55rem'}}>
                          Progress
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-[10px]">SR-003</span>
                      </div>
                      <div className="text-[10px] opacity-75">Mobile App</div>
                    </div>
                     
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">12 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-yellow-100 text-yellow-800" style={{fontSize: '0.55rem'}}>
                          Pending
                        </span>
                  </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-[10px]">SR-004</span>
                      </div>
                      <div className="text-[10px] opacity-75">E-commerce</div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">11 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-green-100 text-green-800" style={{fontSize: '0.55rem'}}>
                          Done
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <svg className="w-2 h-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-[10px]">SR-005</span>
                      </div>
                      <div className="text-[10px] opacity-75">Logo Design</div>
                    </div>
                    
                    <div className="p-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-[10px] mb-0">
                        <span className="opacity-50">10 Dec</span>
                        <span className="px-1 py-0.5 rounded-full bg-blue-100 text-blue-800" style={{fontSize: '0.55rem'}}>
                          In Review
                      </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="font-medium text-[10px]">SR-006</span>
                      </div>
                      <div className="text-[10px] opacity-75">Brand Strategy</div>
                    </div>
                  </div>
                      </div>

                {/* Middle Column - Selected Request Details */}
                <div className="flex-1 space-y-0">
                  {/* Request Header */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-semibold text-gray-900">Website Development</span>
                      <span className="text-gray-400">•</span>
                      <h3 className="text-[10px] text-gray-600">SR-2024-001</h3>
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Customer Card */}
                  <div className="p-2">
                    <div className="mb-1">
                      <div className="font-medium text-gray-900 text-sm">John Smith</div>
                    </div>
                    
                    {/* Email Row */}
                    <div className="flex items-center justify-between gap-2 text-[10px] mb-0">
                      <span className="text-gray-600">john@example.com</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Phone Row */}
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="text-gray-600">+39 123 456 7890</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.533 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.451h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463.703z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Event & Scheduling */}
                  <div className="p-2">
                    <h4 className="text-[9px] font-medium mb-1 pt-0.5 border-t uppercase tracking-wide text-gray-500 border-gray-200">Event & Scheduling</h4>
                    <div className="p-2 rounded border border-gray-200 bg-white">
                      <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-[10px]">Website Launch Event</div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-[9px] text-gray-600">
                            Mon, 15 Dec 14:00
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                  {/* Selected Items */}
                <div className="p-2">
                    <h4 className="text-[9px] font-medium mb-1 pt-0.5 border-t uppercase tracking-wide text-gray-500 border-gray-200">Selected Items</h4>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2 text-[10px] py-1">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">Website Development</div>
                              <div className="text-gray-500 text-[9px]">Custom design with responsive layout</div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="flex items-center gap-1 text-gray-600">
                                <span className="text-[9px]">1 x €2,500</span>
                    </div>
                              <span className="font-medium text-gray-900">€2,500</span>
                      </div>
                    </div>
                  </div>
                </div>
                      <div className="flex items-start gap-2 text-[10px] py-1 border-t border-gray-200">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">SEO Optimization</div>
                              <div className="text-gray-500 text-[9px]">Search engine optimization package</div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="flex items-center gap-1 text-gray-600">
                                <span className="text-[9px]">1 x €800</span>
                              </div>
                              <span className="font-medium text-gray-900">€800</span>
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                  </div>

                  {/* Question Responses */}
                  <div className="p-2">
                    <h4 className="text-[9px] font-medium mb-1 pt-0.5 border-t uppercase tracking-wide text-gray-500 border-gray-200">Question Responses</h4>
                    <div className="space-y-2">
                      <div className="text-[10px] pb-1.5 border-b border-gray-200">
                        <div className="text-[9px] font-medium flex items-center gap-1 text-gray-500 mb-0.5">
                          <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="3" />
                          </svg>
                          What is your preferred timeline?
                        </div>
                        <div className="font-medium pl-2">Within 4-6 weeks</div>
                      </div>
                      <div className="text-[10px] pb-1.5 border-b border-gray-200">
                        <div className="text-[9px] font-medium flex items-center gap-1 text-gray-500 mb-0.5">
                          <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="3" />
                          </svg>
                          Do you have existing content?
                        </div>
                        <div className="font-medium pl-2">Yes, I have existing content</div>
                    </div>
            </div>
          </div>

                  {/* Requirements */}
                <div className="p-2">
                    <h4 className="text-[9px] font-medium mb-1 pt-0.5 border-t uppercase tracking-wide text-gray-500 border-gray-200">Requirements</h4>
                    <div className="space-y-0">
                      <div className="text-[10px] py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 rounded-full text-[9px] bg-green-100 text-green-800">
                            Confirmed
                          </div>
                          <span className="font-medium text-gray-600">Domain Transfer</span>
                        </div>
                      </div>
                      <div className="text-[10px] py-1.5 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="px-1.5 py-0.5 rounded-full text-[9px] bg-yellow-100 text-yellow-800">
                            Pending
                          </div>
                          <span className="font-medium text-gray-600">Branding Assets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions & Generate Panel */}
                <div className="hidden lg:block w-64 flex-shrink-0 space-y-3">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="text-[9px] font-medium mb-2 text-gray-600 uppercase tracking-wide">Quick Actions</h4>
                  <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 text-left leading-tight">Mark Handled</span>
                        </div>
                        
                        <div className="p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                          <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 text-left leading-tight">Close</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 text-left leading-tight">Call</span>
                        </div>

                        <div className="p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 text-left leading-tight">Email</span>
                    </div>
                        
                        <div className="p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                          <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                          </div>
                          <span className="text-[10px] text-gray-600 text-left leading-tight">Open Board</span>
                        </div>
                      </div>

                      <div className="w-full p-2 rounded-lg bg-gray-100 flex flex-col items-start gap-1.5 border border-gray-200">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-[10px] text-gray-600 text-left leading-tight">Generate Quotation</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Generate Section */}
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="text-[9px] font-medium mb-2 text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Generate Response
                    </h4>
                    
                    <div className="space-y-2">
                      {/* Question Selection */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">Questions for Clarification</label>
                        <div className="space-y-1">
                          <div className="p-1.5 rounded border border-gray-200 bg-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-[10px] text-gray-500 mb-0.5">Timeline?</div>
                                <div className="text-[10px] font-medium text-gray-900">4-6 weeks</div>
                              </div>
                              <div className="ml-1 w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center"></div>
                            </div>
                          </div>
                          <div className="p-1.5 rounded border border-blue-300 bg-blue-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-[10px] text-gray-500 mb-0.5">Content migration?</div>
                                <div className="text-[10px] font-medium text-gray-900">Yes, available</div>
                              </div>
                              <div className="ml-1 w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                     </div>
                     </div>
                   </div>
                </div>
              </div>

                      {/* Additional Questions */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-1">Additional Questions</label>
                        <textarea
                          placeholder="Add questions..."
                          className="w-full p-1.5 text-[10px] border border-gray-200 bg-white text-gray-900 placeholder-gray-400 rounded-lg resize-none pointer-events-none"
                          rows={2}
                          readOnly
                        />
                      </div>

                      {/* Generate Button */}
                      <div className="w-full py-2 px-3 text-[10px] font-medium rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white flex items-center justify-center gap-1 shadow-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                        <span>Generate Response</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center">
      <div className="container mx-auto px-6 lg:px-12 py-16 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {t('RequestFeatures.title')}
          </h2>
          <p className="text-base lg:text-lg text-gray-600 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8">
            {t('RequestFeatures.subtitle')}
          </p>
        </div>

        {/* Mobile Layout - Features List First, then Preview */}
        <div className="lg:hidden space-y-8">
          {/* Mobile Features List - Show first on mobile */}
          <div className="space-y-2">
            {requestFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`relative p-3 pl-6 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${
                  selectedFeature === feature.id 
                    ? 'bg-gray-50/50' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                {/* Absolutely positioned checkmark icon with custom shadow */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                  {/* Custom shadow layer */}
                  <div 
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                      selectedFeature === feature.id 
                        ? 'w-10 h-10 opacity-60' 
                        : 'w-6 h-6 bg-gray-400 opacity-25'
                    }`}
                    style={selectedFeature === feature.id ? { backgroundColor: feature.color.shadow } : {}}
                  ></div>
                  
                  {/* Checkmark icon */}
                  <div 
                    className={`relative w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      selectedFeature === feature.id 
                        ? 'border-2' 
                        : 'bg-white border-2 border-gray-300'
                    }`}
                    style={selectedFeature === feature.id ? { 
                      backgroundColor: feature.color.primary,
                      borderColor: feature.color.primary
                    } : {}}
                  >
                    <svg className={`w-3 h-3 ${
                      selectedFeature === feature.id ? 'text-white' : 'text-gray-400'
                    }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Content */}
                <div>
                  <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                    selectedFeature === feature.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {feature.title}
                    </h3>
                {selectedFeature === feature.id && (
                    <p className="text-xs lg:text-sm text-gray-600 leading-tight lg:leading-relaxed mt-2">
                    {feature.description}
                  </p>
                )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Preview - Show below features list */}
          <div>
            {renderFeaturePreview()}
          </div>
        </div>

        {/* Desktop Layout - 2-Column Layout */}
        <div className="hidden lg:grid grid-cols-4 gap-12 max-w-7xl mx-auto">
          {/* Left Column - Features List */}
          <div className="col-span-1 space-y-6">
            {requestFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`p-3 cursor-pointer transition-all duration-200 border-l-4 border-transparent ${
                  selectedFeature === feature.id 
                    ? 'bg-gray-50/50' 
                    : 'hover:bg-gray-50/50'
                }`}
              >
                <div className="flex flex-row gap-4 items-start">
                  {/* Checkmark icon with custom shadow */}
                  <div className="flex-shrink-0 relative">
                    {/* Custom shadow layer */}
                    <div 
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl transition-all duration-300 ease-linear ${
                        selectedFeature === feature.id 
                          ? 'w-12 h-12 opacity-60' 
                          : 'w-7 h-7 bg-gray-400 opacity-25'
                      }`}
                      style={selectedFeature === feature.id ? { backgroundColor: feature.color.shadow } : {}}
                    ></div>
                    
                    {/* Checkmark icon */}
                    <div 
                      className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        selectedFeature === feature.id 
                          ? 'border-2' 
                          : 'bg-white border-2 border-gray-300'
                      }`}
                      style={selectedFeature === feature.id ? { 
                        backgroundColor: feature.color.primary,
                        borderColor: feature.color.primary
                      } : {}}
                    >
                    <svg className={`w-4 h-4 ${
                        selectedFeature === feature.id ? 'text-white' : 'text-gray-400'
                      }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`text-base lg:text-xl font-medium mb-1 leading-tight ${
                      selectedFeature === feature.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {feature.title}
                    </h3>
                    {selectedFeature === feature.id && (
                      <p className="text-xs lg:text-sm text-gray-600 leading-tight lg:leading-relaxed mt-2">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Feature Preview */}
          <div className="col-span-3">
            {renderFeaturePreview()}
          </div>
        </div>
      </div>
    </section>
  );
}
