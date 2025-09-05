// components/landing/SectionRequestFeatures.jsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SectionRequestFeatures({ locale }) {
  const t = useTranslations('Landing');
  const [selectedFeature, setSelectedFeature] = useState('requestManagement');

  // Request features data
  const requestFeatures = [
    {
      id: 'requestManagement',
      icon: "📋",
      title: "Smart Request Management",
      description: "Organize and prioritize service requests with intelligent categorization, status tracking, and automated follow-ups."
    },
    {
      id: 'quotationGenerator',
      icon: "📄",
      title: "AI-Powered Quotation Generator",
      description: "Pre-built quotations with customer name and selected items/extras from service requests. Everything remains fully customizable and editable before export to PDF with your business branding."
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
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Quotation Number</p>
                      <p className="text-xs text-gray-700">QT-SR-2024-001</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Tax Percentage</p>
                      <p className="text-xs text-gray-700">22%</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Items (3)</p>
                      <p className="text-xs text-gray-700">3 items • €3,900 subtotal</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Introductory Text</p>
                      <p className="text-xs text-gray-700">Custom greeting message</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center py-1.5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Additional Notes</p>
                      <p className="text-xs text-gray-700">Final notes & terms</p>
                    </div>
                    <button className="p-0.5 text-gray-500 hover:text-gray-700">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotation Preview */}
              <div className="lg:col-span-2 bg-gray-200 rounded-xl p-4">
                <div className="flex justify-center">
                  <div className="bg-white p-6 max-w-sm w-full shadow-2xl">
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

                {/* Action Buttons - Moved below PDF */}
                <div className="flex justify-center gap-3 mt-4">
                  <div className="px-3 py-1.5 bg-gray-600 text-white rounded-lg flex items-center gap-1.5 text-sm">
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
            </div>
            </div>

          </div>
        );

      case 'requestManagement':
        return (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Request List */}
              <div className="lg:col-span-1 space-y-4 bg-gray-50 rounded-lg p-4">
                {/* Header with Navigation */}
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-gray-900">Service Requests</h2>
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
                <div className="p-3 bg-white rounded-lg">
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
                        <span className="opacity-50">15 Dec 14:30</span>
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
                        <span className="opacity-50">14 Dec 09:15</span>
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

                  <div className="p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-50">13 Dec 16:45</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium text-xs">SR-2024-003</span>
                        <span className="text-xs opacity-75">• Luca Bianchi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">Mobile App Development</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-50">12 Dec 11:20</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium text-xs">SR-2024-004</span>
                        <span className="text-xs opacity-75">• Anna Verdi</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">E-commerce Setup</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-50">11 Dec 08:30</span>
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
                        <span className="font-medium text-xs">SR-2024-005</span>
                        <span className="text-xs opacity-75">• Marco Neri</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">Logo Design</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <span className="opacity-50">10 Dec 15:20</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                        In Progress
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="font-medium text-xs">SR-2024-006</span>
                        <span className="text-xs opacity-75">• Elena Ferrari</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-xs">
                      <div className="text-xs opacity-75">Social Media Management</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Request Details */}
              <div className="lg:col-span-2 space-y-0">
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
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm flex items-center gap-1.5 hover:bg-green-700">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Mark Handled
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm flex items-center gap-1.5 hover:bg-blue-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Quotation
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-gray-600 text-white text-sm flex items-center gap-1.5 hover:bg-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open Board
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4">
                  <h4 className="text-[10px] font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Customer Details</h4>
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

                {/* Selected Items */}
                <div className="p-4">
                  <h4 className="text-[10px] font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Selected Items</h4>
                  <div className="space-y-1">
                    <div className="p-1.5 rounded border border-gray-200 bg-white">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Website Development</span>
                          <span className="opacity-60">(Custom design)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">€2,500.00</span>
                        </div>
                      </div>
                  </div>
                    <div className="p-1.5 rounded border border-gray-200 bg-white">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">SEO Optimization</span>
                          <span className="opacity-60">(Search optimization)</span>
                  </div>
                        <div className="text-right">
                          <span className="font-medium">€800.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

                {/* Selected Extras */}
                <div className="p-4">
                  <h4 className="text-[10px] font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Selected Extras</h4>
                  <div className="space-y-1">
                    <div className="p-1.5 rounded border border-gray-200 bg-white">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Premium Support</span>
                          <span className="opacity-60">(6 months)</span>
                    </div>
                        <div className="text-right">
                          <span className="font-medium">€200.00</span>
                    </div>
                  </div>
                </div>
                    <div className="p-1.5 rounded border border-gray-200 bg-white">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">SSL Certificate</span>
                          <span className="opacity-60">(1 year)</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">€50.00</span>
                        </div>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Question Responses */}
                <div className="p-4">
                  <h4 className="text-[10px] font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Question Responses</h4>
                  <div className="space-y-2">
                    <div className="text-sm pb-2 border-b border-gray-200">
                      <div className="text-xs font-medium flex items-center gap-1 text-gray-500">
                        <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                        What is your preferred timeline for completion?
                      </div>
                      <div className="font-medium text-sm pl-3">Within 4-6 weeks</div>
                    </div>
                    <div className="text-sm pb-2 border-b border-gray-200">
                      <div className="text-xs font-medium flex items-center gap-1 text-gray-500">
                        <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="3" />
                        </svg>
                        Do you have existing content to migrate?
                      </div>
                      <div className="mt-1 pl-3">
                        <div className="flex items-center gap-1 text-sm">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Yes, I have existing content</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Requirements */}
                <div className="p-4">
                  <h4 className="text-[10px] font-medium mb-2 pt-1 border-t uppercase tracking-wide text-gray-500 border-gray-200">Requirements</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Confirmed
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">
                          <span className="font-medium">Domain: </span>
                          Must be transferred to our hosting
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Pending
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">
                          <span className="font-medium">Branding: </span>
                          Logo and brand guidelines to be provided
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Confirmed
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">
                          <span className="font-medium">Content: </span>
                          All text content ready for implementation
                        </span>
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
                  <h3 className={`text-lg font-semibold mb-2 leading-tight ${
                    selectedFeature === feature.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-snug">
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
