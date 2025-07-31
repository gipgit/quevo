'use client';

import React from 'react';
import Link from 'next/link';
import LocaleSwitcherButton from '@/components/ui/LocaleSwitcherButton';
import LocaleSelectModal from '@/components/ui/LocaleSelectModal';
import { useLocaleSwitcher } from '@/hooks/useLocaleSwitcher';

export default function Footer() {
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/icons/home.png" alt="Quevo" className="h-6 w-6" />
            <span className="text-lg font-bold">Quevo</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/demo" className="text-gray-400 hover:text-white transition-colors text-sm">
              Demo
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
              About
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* Locale Switcher */}
          <LocaleSwitcherButton 
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-white"
          />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © 2024 Quevo. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Locale Selection Modal */}
      <LocaleSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLocale={currentLocale}
        availableLocales={availableLocales}
        onLocaleSelect={switchLocale}
      />
    </footer>
  );
} 