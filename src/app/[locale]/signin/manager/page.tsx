'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocaleSwitcherButton from '@/components/ui/LocaleSwitcherButton';
import LocaleSelectModal from '@/components/ui/LocaleSelectModal';
import { useLocaleSwitcher } from '@/hooks/useLocaleSwitcher';

export default function ManagerSignInPage() {
  const t = useTranslations('ManagerSignIn');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowError(false);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('unexpectedError'));
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError(t('connectionError'));
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title above the card */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('passwordPlaceholder')}
              />
            </div>

            {showError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('loading') : t('loginButton')}
            </button>
          </form>
        </div>

        {/* Links and locale switcher below the card */}
        <div className="mt-6 text-center space-y-4">
          <div className="text-gray-600">
            <span>{t('noAccountText')} </span>
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              {t('createAccountLink')}
            </Link>
          </div>
          
          <div className="flex justify-center">
            <LocaleSwitcherButton 
              onClick={() => setIsModalOpen(true)}
              className="text-gray-600 hover:text-gray-800"
            />
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
      </div>
    </div>
  );
} 