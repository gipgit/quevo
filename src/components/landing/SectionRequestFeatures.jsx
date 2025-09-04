// components/landing/SectionRequestFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionRequestFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('quotationGenerator');

  // Request features data
  const requestFeatures = [
    {
      id: 'quotationGenerator',
      icon: "📄",
      title: "AI-Powered Quotation Generator",
      description: "Generate professional quotations automatically from service requests. Customize pricing, add terms, and export to PDF with your business branding."
    },
    {
      id: 'requestManagement',
      icon: "📋",
      title: "Smart Request Management",
      description: "Organize and prioritize service requests with intelligent categorization, status tracking, and automated follow-ups."
    },
    {
      id: 'customerCommunication',
      icon: "💬",
      title: "Automated Customer Communication",
      description: "Send personalized updates, confirmations, and reminders to customers throughout the service request lifecycle."
    }
  ];

  const renderFeaturePreview = () => {
    switch (selectedFeature) {
      case 'quotationGenerator':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Settings Panel */}
              <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0l1.403 5.757c.42 1.725 1.924 2.926 3.75 2.926h5.572c1.826 0 2.33-2.201.75-2.926l-4.5-1.757c-.426-1.756-2.924-1.756-3.35 0l-4.5 1.757c-1.58.725-1.076 2.926.75 2.926h5.572c1.826 0 3.33-1.201 3.75-2.926l1.403-5.757z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quotation Number</p>
                      <p className="text-sm text-gray-700">QT-SR-2024-001</p>
                    </div>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Tax Percentage</p>
                      <p className="text-sm text-gray-700">22%</p>
                    </div>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Items (3)</p>
                      <p className="text-sm text-gray-700">3 items • €3,900 subtotal</p>
                    </div>
                    <button className="p-1 text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotation Preview */}
              <div className="lg:col-span-2 bg-gray-800 rounded-xl p-4">
                <div className="flex justify-center gap-3 mb-3">
                  <div className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg flex items-center gap-1.5 text-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Save
                  </div>
                  <div className="px-3 py-1.5 bg-blue-600 text-white rounded-lg flex items-center gap-1.5 text-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate PDF
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Acme Design Studio</h2>
                      <p className="text-xs text-gray-600">123 Business St, Milan</p>
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm text-gray-900">Customer</h3>
                      <p className="text-sm font-bold text-gray-900">John Smith</p>
                      <p className="text-xs text-gray-600">john@example.com</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-900">
                      <span className="font-bold">QUOTATION</span>
                      <span className="text-xs"> N. QT-SR-2024-001 of Dec 15, 2024</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Dear John Smith,</span><br />
                      we are pleased to provide you with a detailed quotation for the requested services.
                    </p>
                  </div>
                  
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-1 w-2/3 text-xs text-gray-900">Item</th>
                        <th className="text-right py-2 px-1 w-1/6 text-xs text-gray-900">Price</th>
                        <th className="text-center py-2 px-1 w-1/6 text-xs text-gray-900">Qty</th>
                        <th className="text-right py-2 px-1 w-1/6 text-xs text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-1">
                          <p className="text-xs font-semibold text-gray-900">Website Development</p>
                        </td>
                        <td className="py-2 px-1 text-right text-xs text-gray-900">€2,500.00</td>
                        <td className="py-2 px-1 text-center text-xs text-gray-900">1</td>
                        <td className="py-2 px-1 text-right font-medium text-xs text-gray-900">€2,500.00</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-1">
                          <p className="text-xs font-semibold text-gray-900">SEO Optimization</p>
                        </td>
                        <td className="py-2 px-1 text-right text-xs text-gray-900">€800.00</td>
                        <td className="py-2 px-1 text-center text-xs text-gray-900">1</td>
                        <td className="py-2 px-1 text-right font-medium text-xs text-gray-900">€800.00</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end">
                    <div className="w-48">
                      <div className="flex justify-between py-1 text-xs text-gray-700">
                        <span>Subtotal:</span>
                        <span className="text-sm font-medium">€3,300.00</span>
                      </div>
                      <div className="flex justify-between py-1 text-xs text-gray-700">
                        <span>Tax (22%):</span>
                        <span className="text-sm font-medium">€726.00</span>
                      </div>
                      <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-sm text-gray-900">
                        <span>Total:</span>
                        <span>€4,026.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-6">
              <div className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg">
                Auto-Pricing
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 text-sm rounded-lg">
                PDF Export
              </div>
              <div className="px-3 py-1 bg-purple-50 text-purple-600 text-sm rounded-lg">
                Branding
              </div>
              <div className="px-3 py-1 bg-orange-50 text-orange-600 text-sm rounded-lg">
                Templates
              </div>
            </div>
          </div>
        );

      case 'requestManagement':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Request List */}
              <div className="lg:col-span-1 space-y-4">
                {/* Header with Navigation */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Service Requests</h2>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">2 of 5</span>
                    <div className="p-1.5 rounded-lg text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Progress: 3 of 5 handled
                    </span>
                    <span className="text-xs text-gray-600">2 remaining</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>

                {/* Request List */}
                <div className="space-y-1">
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-75">15 Dec 14:30</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium text-xs">SR-2024-001</span>
                        <span className="text-xs opacity-75">• John Smith</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">Website Development</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-75">14 Dec 09:15</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-xs">SR-2024-002</span>
                        <span className="text-xs opacity-75">• Maria Rossi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">SEO Optimization</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Request Details */}
              <div className="lg:col-span-2 space-y-4">
                {/* Request Header */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">SR-2024-001</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>John Smith</span>
                          <span>•</span>
                          <span>Website Development</span>
                          <span>•</span>
                          <span>€2,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-xs font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Customer Details</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>John Smith</span>
                      <div className="p-1 text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>john@example.com</span>
                      <div className="p-1 text-gray-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mark Handled
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Quotation
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Appointment
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'customerCommunication':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="space-y-6">

              {/* Sample Messages */}
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📧</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Request Confirmation</div>
                      <div className="text-sm text-gray-600">Sent automatically when request is received</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📱</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Progress Update</div>
                      <div className="text-sm text-gray-600">Scheduled updates during project</div>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✅</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Completion Notice</div>
                      <div className="text-sm text-gray-600">Final delivery confirmation</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Channels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-1">📧</div>
                  <div className="text-sm font-medium">Email</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-1">📱</div>
                  <div className="text-sm font-medium">SMS</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-1">💬</div>
                  <div className="text-sm font-medium">WhatsApp</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg mb-1">🔔</div>
                  <div className="text-sm font-medium">Push</div>
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
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Request Management Features
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 leading-tight lg:leading-relaxed max-w-3xl mx-auto mb-8">
            Streamline your service request workflow with intelligent automation and professional tools
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left Column - Features List */}
          <div className="lg:col-span-1 space-y-6">
            {requestFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={() => setSelectedFeature(feature.id)}
                className={`flex flex-row gap-4 p-3 items-start cursor-pointer transition-all duration-200 border-l-4 ${
                  selectedFeature === feature.id 
                    ? 'border-blue-500 bg-blue-50/30' 
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  selectedFeature === feature.id ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <svg className={`w-4 h-4 ${
                    selectedFeature === feature.id ? 'text-white' : 'text-gray-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-1 leading-tight ${
                    selectedFeature === feature.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Feature Preview */}
          <div className="lg:col-span-3 hidden lg:block">
            {renderFeaturePreview()}
          </div>
        </div>

        {/* Mobile Preview - Show below cards on mobile */}
        <div className="lg:hidden mt-8">
          {renderFeaturePreview()}
        </div>
      </div>
    </section>
  );
}
