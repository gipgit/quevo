// components/landing/SectionComparison.jsx
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export default function SectionComparison({ locale }) {
  const comparisonData = [
    {
      "category": "Initial Cost & Entry Barrier",
      "feature": "Entry & Setup Cost",
      "quevo_value": {
        "title": "Zero-Risk Start with Freemium",
        "description": "Launch instantly on the **Free Plan (no credit card)**. Get a high-functionality profile live in ≈ 5 minutes."
      },
      "traditional_value": {
        "title": "Dispersed Recurring Costs",
        "description": "Requires immediate payment for: Domain Name (annual fee), Web Hosting (low monthly/annual fee), and often a Builder/CMS Subscription (recurring fee)."
      }
    },
    {
      "category": "Financial Management",
      "feature": "Value & Predictability",
      "quevo_value": {
        "title": "Superior Value, All-Inclusive",
        "description": "The cost of the cheapest paid plan ($20/month) is **comparable to the recurring fees for domain and hosting alone**, yet provides *all* integrated management, AI, and support tools. Your investment is in **functionality, not just file storage.**"
      },
      "traditional_value": {
        "title": "High Value-to-Cost Disparity",
        "description": "The combined cost of necessary components (domain, hosting, builder) is nearly the same as our paid plan, yet offers **zero integrated business management or automation tools**. Time spent on setup is a high-effort loss upon quitting, and complex data migration remains a burden."
      }
    },
    {
      "category": "Core Operations",
      "feature": "Management System",
      "quevo_value": {
        "title": "Integrated Operating System",
        "description": "Built-in, unified systems for Service Management, Appointment Scheduling, Client Management (CRM), and Quotations, all linked by the unique **Service Boards**. Everything works together out of the box."
      },
      "traditional_value": {
        "title": "Dispersed Components",
        "description": "A basic site is just a front-end. Achieving equivalent functionality requires **manually integrating 3-5 different external tools** (e.g., separate calendar app, paid form builder, third-party CRM plugin). These tools often operate in silos."
      }
    },
    {
      "category": "Platform Health",
      "feature": "Evolution & Updates",
      "quevo_value": {
        "title": "Automatic & Future-Proof Updates",
        "description": "Platform updates, bug fixes, and **new AI features are automatic and included** in your fee. The platform is **continuously evolving** based on user feedback."
      },
      "traditional_value": {
        "title": "Manual & Dependent Effort",
        "description": "You are responsible for ensuring all plugins, builders, and integrated external tools are updated and remain compatible. New functionality requires finding, purchasing, and integrating *another* new tool."
      }
    },
    {
      "category": "Customer Experience",
      "feature": "Service Request Flow",
      "quevo_value": {
        "title": "Intelligent, Guided Workflow",
        "description": "Modern, multi-step forms provide progress tracking, show live booking availability, give instant quotes, and dynamically adapt to customer input. **Designed to pre-qualify and convert customers.**"
      },
      "traditional_value": {
        "title": "Static & Friction-Heavy",
        "description": "Visitors encounter a non-dynamic, basic contact form. No instant intelligence, no quote simulation, and no guided experience, leading to higher friction and a lower commitment rate from customers."
      }
    },
    {
      "category": "Marketing & Networking",
      "feature": "Profile Utility",
      "quevo_value": {
        "title": "All-in-One Utility Link",
        "description": "The dynamic profile URL acts as a versatile **compact website replacement** or a digital business card. Perfect for social media bios, email signatures, and printed materials with a **built-in QR code** for instant access and engagement."
      },
      "traditional_value": {
        "title": "Single-Purpose Link",
        "description": "Primarily serves as the main web address. Less suited for the dynamic, action-oriented needs of social media or for replacing a physical business card with instant, interactive features."
      }
    },
    {
      "category": "Support & Service",
      "feature": "Help & Maintenance",
      "quevo_value": {
        "title": "Centralized, Human-Powered Support",
        "description": "Access to fast, human support (Email/In-Dashboard) across multiple languages, supported by a comprehensive, step-by-step Knowledge Base."
      },
      "traditional_value": {
        "title": "Dispersed and Technical Support",
        "description": "You have to manage support from **multiple vendors** (hosting, domain, plugin developers). Resolving complex integration issues becomes your technical burden."
      }
    }
  ];

  // Helper function to clean markdown-like bold syntax
  const cleanDescription = (text) => {
    return text.replace(/\*\*/g, '');
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(59,130,246,0.1)_2px,transparent_2px)] bg-[length:40px_40px]"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Flowia</span> Over Traditional Sites?
          </h2>
          <p className="text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">
            See the real differences in cost, functionality, and value between a modern all-in-one platform and traditional website building.
          </p>
        </div>

         {/* Mobile: Single scroll with sticky labels */}
         <div className="lg:hidden relative -mr-6 pr-6">
           {/* Right edge fade gradient - absolute to extended container */}
           <div className="absolute top-0 right-0 bottom-14 w-32 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-30"></div>
           
           {/* Blurred glowing orb for Flowia - fixed position */}
           <div className="absolute top-[320px] -left-14 w-32 h-32 bg-blue-500 rounded-full opacity-25 blur-3xl pointer-events-none z-0"></div>
           
           {/* Single scrollable container */}
           <div className="overflow-x-auto -mx-6">
             <div className="inline-flex flex-col gap-4 px-6 pb-4">
               {/* Category Headers Row */}
               <div className="flex gap-2 mb-2">
                 {comparisonData.map((item, index) => (
                   <div key={index} className="flex-shrink-0 w-[70vw] max-w-[350px]">
                     <div className="py-2">
                       <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{item.category}</div>
                       <div className="text-xs font-medium text-gray-500 mt-0.5">{item.feature}</div>
                     </div>
                   </div>
                 ))}
               </div>
               
               {/* Traditional Label - Full width border with sticky content */}
               <div className="-mx-6 px-6 py-1 border-t-2 border-red-600 bg-white">
                 <div className="sticky left-6 inline-flex items-center gap-2 bg-white pr-4 z-10">
                   <div className="text-sm font-medium text-gray-600 capitalize">Traditional Site</div>
                 </div>
               </div>
               
               {/* Traditional Values Row */}
               <div className="flex gap-2 -mt-2">
                 {comparisonData.map((item, index) => (
                   <div key={index} className="flex-shrink-0 w-[70vw] max-w-[350px]">
                     <div className="flex items-start justify-center min-h-[120px]">
                       <div>
                         <h3 className="text-sm font-medium text-gray-900 mb-2">{item.traditional_value.title}</h3>
                         <p className="text-xs text-gray-500 leading-snug">
                           {cleanDescription(item.traditional_value.description)}
                         </p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
               
               {/* Flowia Section Container */}
               <div className="relative overflow-visible">
                 {/* Flowia Label - Full width border with sticky content */}
                 <div className="-mx-6 px-6 py-1 border-t-2 border-blue-500 relative z-10">
                   <div className="sticky left-6 inline-flex items-center gap-2 pr-4">
                     <div className="text-lg font-medium capitalize bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Flowia</div>
                   </div>
                 </div>
                 
                 {/* Flowia Values Row */}
                 <div className="flex gap-2 mt-1 relative z-10">
                   {comparisonData.map((item, index) => (
                     <div key={index} className="flex-shrink-0 w-[70vw] max-w-[350px]">
                       <div className="flex items-start justify-center min-h-[120px]">
                         <div>
                           <h3 className="text-sm font-medium text-gray-900 mb-2">{item.quevo_value.title}</h3>
                           <p className="text-xs text-gray-500 leading-snug">
                             {cleanDescription(item.quevo_value.description)}
                           </p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
           
           {/* Scroll indicator */}
           <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 mr-6">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
             </svg>
             <span className="text-xs font-medium">Swipe to explore</span>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
             </svg>
           </div>
         </div>

        {/* Desktop: Grid layout simulating table */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-[1fr_1.5fr_1.5fr]">
            {/* Header Row */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              {/* Empty header for category column */}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Traditional Site</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t-2 border-l-2 border-r-2 border-blue-500 rounded-t-3xl shadow-[0_4px_20px_-2px_rgba(59,130,246,0.3)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Flowia</span>
              </div>
            </div>

            {/* Data Rows */}
            {comparisonData.map((item, index) => (
              <React.Fragment key={index}>
                <div className={`px-6 py-6 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${index === comparisonData.length - 1 ? '' : 'border-b border-gray-200'}`}>
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                    {item.category}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.feature}
                  </div>
                </div>
                <div className={`px-6 py-6 bg-red-50/20 ${index === comparisonData.length - 1 ? '' : 'border-b border-gray-200'}`}>
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {item.traditional_value.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-snug">
                    {cleanDescription(item.traditional_value.description)}
                  </p>
                </div>
                <div className={`px-6 py-6 bg-gray-50 border-l-2 border-r-2 border-blue-500 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.3)] ${index === comparisonData.length - 1 ? 'border-b-2 rounded-b-3xl' : ''}`}>
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    {item.quevo_value.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-snug">
                    {cleanDescription(item.quevo_value.description)}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Free Today
          </a>
        </div>
      </div>
    </section>
  );
}

