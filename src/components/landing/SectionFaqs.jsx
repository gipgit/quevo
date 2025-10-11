// components/landing/SectionFaqs.jsx
'use client'; // Needs client-side interactivity for accordion functionality

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, MessageCircle } from 'lucide-react';

export default function SectionFaqs() {
  const t = useTranslations('Landing');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set([0, 1, 2]));
    
    // State to keep track of which accordion item is currently open.
    // We'll store the index of the open item. -1 means no item is open.
    const [openItemIndex, setOpenItemIndex] = useState(-1);
    const [showAllQuestions, setShowAllQuestions] = useState(false);

    // Data for your FAQ items. This makes the component more reusable.
    const faqData = [
    {
      question: t('FAQ.questions.accountCreation.question'),
      answer: t('FAQ.questions.accountCreation.answer')
    },
    {
      question: t('FAQ.questions.freePlan.question'),
      answer: t('FAQ.questions.freePlan.answer')
    },
    {
      question: t('FAQ.questions.serviceBoards.question'),
      answer: t('FAQ.questions.serviceBoards.answer')
    },
    {
      question: t('FAQ.questions.aiFeatures.question'),
      answer: t('FAQ.questions.aiFeatures.answer')
    },
    {
      question: t('FAQ.questions.appointmentScheduling.question'),
      answer: t('FAQ.questions.appointmentScheduling.answer')
    },
    {
      question: t('FAQ.questions.dataSecurity.question'),
      answer: t('FAQ.questions.dataSecurity.answer')
    },
    {
      question: t('FAQ.questions.customerSupport.question'),
      answer: t('FAQ.questions.customerSupport.answer')
    },
    {
      question: t('FAQ.questions.multiLanguage.question'),
      answer: t('FAQ.questions.multiLanguage.answer')
    },
    {
      question: t('FAQ.questions.pricing.question'),
      answer: t('FAQ.questions.pricing.answer')
    },
    {
      question: t('FAQ.questions.technicalRequirements.question'),
      answer: t('FAQ.questions.technicalRequirements.answer')
    }
  ];

    const toggleAccordion = (index) => {
        // If the clicked item is already open, close it.
        // Otherwise, open the clicked item.
        setOpenItemIndex(prevIndex => (prevIndex === index ? -1 : index));
    };

    const toggleShowAllQuestions = () => {
        setShowAllQuestions(!showAllQuestions);
        // Reset open accordion when toggling
        setOpenItemIndex(-1);
    };

    // Show only first 3 questions by default, or all if showAllQuestions is true
    const visibleQuestions = showAllQuestions ? faqData : faqData.slice(0, 3);

    return (
        <section className="container-x-md px-6 lg:px-12 py-10 lg:py-12">
            <div className="text-center mb-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                    {t('FAQ.title')}
                </h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
                {visibleQuestions.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-b-0">
                        <button
                            className="w-full py-6 text-left flex items-center justify-between"
                            onClick={() => toggleAccordion(index)}
                            aria-expanded={openItemIndex === index ? "true" : "false"}
                        >
                            <p className="text-lg text-gray-900 pr-4">
                                {item.question}
                            </p>
                            <div className="flex-shrink-0">
                                <svg 
                                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                                        openItemIndex === index ? 'rotate-45' : ''
                                    }`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                                    />
                                </svg>
                            </div>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                openItemIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}
                        >
                            <div className="pb-6 px-2">
                                <p className="text-sm lg:text-base text-gray-600 leading-tight lg:leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {!showAllQuestions && (
                    <div className="text-center mt-8">
                        <button
                            onClick={toggleShowAllQuestions}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                        >
                            <span>{t('FAQ.showMore')}</span>
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 9l-7 7-7-7" 
                                />
                            </svg>
                        </button>
                    </div>
                )}
                
                {showAllQuestions && (
                    <div className="text-center mt-8">
                        <button
                            onClick={toggleShowAllQuestions}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                        >
                            <span>{t('FAQ.showLess')}</span>
                            <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M5 15l7-7 7 7" 
                                />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Link to Guide */}
                <div className="flex justify-center items-center mt-12">
                  <a 
                    href="/guide"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-medium group"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>View Complete Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Still Got Questions Card */}
                <div className="mt-16 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Still got questions?
                  </h3>
                  <a 
                    href="/support"
                    className="inline-flex items-center gap-3 md:gap-4 text-gray-700 hover:text-gray-900 transition-colors group"
                  >
                    <div className="flex items-center relative">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-10 relative">
                        <span className="text-white font-bold text-xl md:text-2xl">Q</span>
                      </div>
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0 -ml-3 md:-ml-4 shadow-md">
                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-medium text-gray-900">Contact Support</div>
                      <div className="text-sm text-gray-500">We're here to help</div>
                    </div>
                  </a>
                </div>
            </div>
        </section>
    );
}