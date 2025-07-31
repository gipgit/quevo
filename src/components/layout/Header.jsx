'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LocaleSwitcherButton from '@/components/ui/LocaleSwitcherButton';
import { useLocaleSwitcher } from '@/components/ui/LocaleSwitcherProvider';

export default function Header() {
  const { setIsModalOpen, isModalOpen } = useLocaleSwitcher();
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Group */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img src="/icons/home.png" alt="Quevo" className="h-4 lg:h-8 w-4 lg:w-8" />
              <span className="text-xl font-bold text-gray-900">Quevo</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
          </div>

          {/* Right side - Auth buttons and locale switcher */}
          <div className="flex items-center space-x-4">
            <LocaleSwitcherButton 
              onClick={() => setIsModalOpen(true)}
              className="text-gray-600 hover:text-gray-800"
            />
            
            <Link 
              href="/signin/business" 
              className="text-sm lg:text-base text-gray-600 hover:text-gray-900 transition-colors"
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
  );
} 