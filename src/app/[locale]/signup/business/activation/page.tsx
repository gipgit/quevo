// src/app/[locale]/signup/business/activation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function BusinessActivationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('BusinessActivationPage');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_active'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<{ user_id: string; name_first: string; name_last: string; email: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userEmail = searchParams.get('email');

    if (!token || !userEmail) {
      setStatus('error');
      setMessage(t('invalidLinkMissingInfo'));
      return;
    }

    const activateAccount = async () => {
      try {
        const response = await fetch('/api/auth/activate-manager', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email: userEmail }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || t('activationSuccessDefault'));
          setUserData(data.data);

          // --- AUTO-LOGIN FLOW ---
          // Directly sign in with NextAuth credentials provider (auto-login password)
          const signInRes = await import('next-auth/react').then(({ signIn }) =>
            signIn('credentials', {
              email: userEmail,
              password: 'auto-login',
              userType: 'manager',
              redirect: false,
            })
          );
          if (signInRes?.ok) {
            // Redirect to onboarding/dashboard
            router.push('/dashboard/onboarding');
            return;
          } else {
            setStatus('error');
            setMessage(t('autoLoginFailed'));
            return;
          }
          // --- END AUTO-LOGIN FLOW ---
        } else {
          if (response.status === 409 && data.message === 'Your account is already active.') {
            setStatus('already_active');
            setMessage(t('accountAlreadyActive'));
            // Immediately redirect to login if already active
            router.push(`/signin?email=${encodeURIComponent(userEmail)}&message=${encodeURIComponent(t('accountAlreadyActive'))}`);
          } else {
            setStatus('error');
            setMessage(data.message || t('activationFailedDefault'));
          }
        }
      } catch (error) {
        console.error('Error during activation:', error);
        setStatus('error');
        setMessage(t('unexpectedError'));
      }
    };

    activateAccount();
  }, [searchParams, router, t]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <h2 className="mb-4 text-2xl font-bold">{t('activatingAccount')}</h2>
            <p className="text-gray-700">{t('pleaseWait')}</p>
            <div className="mt-4 animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="mb-4 text-2xl font-bold">{t('activationSuccessful')}</h2>
            {userData && (
              <>
                <p className="font-bold text-lg lg:text-lg mb-3">{t('welcomeMessage', { recipientName: userData.name_first })}</p>
                <p className="mb-4">{t('accountActiveMessage')}</p>
                <p className="text-sm text-black-600">{t('verificationNote')}</p>
              </>
            )}
            <p className="mt-4 text-sm text-gray-600">
              {t('redirectingToDashboard')}
            </p>
            {/* No direct link here as auto-redirect is happening */}
          </>
        )}

        {status === 'already_active' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-blue-600">{t('accountAlreadyActiveTitle')}</h2>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t('redirectToLoginPrompt')}
            </p>
            <Link href="/signin" className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700">
              {t('goToSignIn')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-red-600">{t('activationFailed')}</h2>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t('checkLinkOrContactSupport')}
            </p>
            <Link href="/signup/business" className="mt-6 inline-block rounded-md bg-red-600 px-6 py-2 text-white font-medium hover:bg-red-700">
              {t('trySignupAgain')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
