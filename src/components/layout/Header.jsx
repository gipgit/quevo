'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcherButton from '@/components/ui/LocaleSwitcherButton';
import { useLocaleSwitcher } from '@/components/ui/LocaleSwitcherProvider';

export default function Header() {
  const { setIsModalOpen, isModalOpen } = useLocaleSwitcher();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tCommon = useTranslations('Common');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`w-6 h-6 transition-transform duration-300 ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/icons/home.png" alt="Quevo" className="h-4 lg:h-8 w-4 lg:w-8" />
              <span className="text-xl font-bold text-gray-900">Quevo</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 ml-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </Link>
            </nav>

            {/* Right side - Auth buttons and locale switcher */}
            <div className="flex items-center space-x-2 lg:space-x-4 ml-auto">
              <LocaleSwitcherButton 
                onClick={() => setIsModalOpen(true)}
                className="hidden lg:flex text-gray-600 hover:text-gray-800"
              />
              
              <Link 
                href="/signin/business" 
                className="border border-gray-900 text-gray-900 text-sm lg:text-base px-4 py-2 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              
              <Link 
                href="/signup/business" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {tCommon('getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="fixed inset-0 z-[70] bg-white">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img src="/icons/home.png" alt="Quevo" className="h-8 w-8" />
                  <span className="text-2xl font-bold text-gray-900">Quevo</span>
                </Link>
                
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex-1 px-6 py-8">
                <div className="space-y-8">
                  <Link 
                    href="/features" 
                    className="block text-4xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="block text-4xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/contact" 
                    className="block text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Support
                  </Link>
                </div>
              </nav>

              {/* Mobile Bottom Section - Auth buttons and locale switcher */}
              <div className="p-6 border-t border-gray-200 space-y-4">
                <div className="flex justify-center">
                  <LocaleSwitcherButton 
                    onClick={() => {
                      setIsModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-gray-800 text-lg"
                  />
                </div>
                
                <div className="space-y-3">
                  <Link 
                    href="/signin/business" 
                    className="block w-full text-center py-3 text-lg font-medium bg-black text-white rounded-lg hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  
                  <Link 
                    href="/signup/business" 
                    className="block w-full text-center py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {tCommon('getStarted')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 