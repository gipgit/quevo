'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, BookOpen, HelpCircle, HeadphonesIcon, ArrowRight } from 'lucide-react';

export default function FloatingSupportChat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Show the floating button after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const supportLinks = [
    {
      title: 'Complete Guide',
      description: 'Learn how to use all features',
      href: '/guide',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'FAQs',
      description: 'Quick answers to common questions',
      href: '#faqs',
      icon: HelpCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      href: '/support',
      icon: HeadphonesIcon,
      color: 'text-emerald-600'
    }
  ];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-20 sm:bottom-24 right-4 left-4 sm:left-auto sm:right-6 lg:right-8 sm:w-80 md:w-96 max-w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">How can we help?</h3>
                  <p className="text-xs text-white/80 hidden sm:block">Choose an option below</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-96 overflow-y-auto">
            {supportLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center ${link.color}`}>
                    <link.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{link.title}</h4>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{link.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              Need immediate assistance? We're here to help! 🚀
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 lg:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center justify-center group ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
        }`}
        aria-label="Open support chat"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
        )}
        
        {/* Pulse animation ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></span>
        )}
      </button>
    </>
  );
}

