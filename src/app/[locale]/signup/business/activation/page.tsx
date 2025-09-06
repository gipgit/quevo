// src/app/[locale]/signup/business/activation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleSwitcher } from '@/hooks/useLocaleSwitcher';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function BusinessActivationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('BusinessActivationPage');
  const { currentLocale } = useLocaleSwitcher();

  const [status, setStatus] = useState<'loading' | 'success' | 'auto_login' | 'error' | 'already_active'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<{ user_id: string; name_first: string; name_last: string; email: string } | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailFromParams = searchParams.get('email');

    if (!token || !emailFromParams) {
      setStatus('error');
      setMessage(t('invalidLinkMissingInfo'));
      return;
    }

    setUserEmail(emailFromParams);

    const activateAccount = async () => {
      try {
        console.log(`[activation] Attempting to activate account for email: ${emailFromParams}`);
        const response = await fetch('/api/auth/activate-manager', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email: emailFromParams }),
        });

        const data = await response.json();
        console.log(`[activation] Response status: ${response.status}, data:`, data);

        if (response.ok) {
          // Immediately set to auto_login to prevent any error state from showing
          setStatus('auto_login');
          setUserData(data.data);

          // Auto-login the user - handle this separately to avoid triggering the outer catch
          const handleAutoLogin = async () => {
            try {
              console.log(`[activation] Attempting auto-login for email: ${emailFromParams}`);
              const autoLoginResponse = await fetch('/api/auth/auto-login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  autoLoginToken: data.autoLoginToken, 
                  email: emailFromParams 
                }),
              });

              const autoLoginData = await autoLoginResponse.json();
              console.log(`[activation] Auto-login response:`, autoLoginData);

                             if (autoLoginResponse.ok && autoLoginData.success) {
                 // Use NextAuth to sign in the user with retry mechanism
                 const attemptSignIn = async (attempt: number = 1): Promise<boolean> => {
                   try {
                     const { signIn } = await import('next-auth/react');
                     const signInResult = await signIn('credentials', {
                       email: emailFromParams,
                       userType: 'manager',
                       autoLoginToken: data.autoLoginToken,
                       redirect: false,
                     });

                     if (signInResult?.ok) {
                       console.log(`[activation] Auto-login successful on attempt ${attempt}`);
                       // Redirect to dashboard with cache-busting - let the server-side provider handle the redirect to onboarding if needed
                       router.push(`/${currentLocale}/dashboard?t=${Date.now()}&fresh=true`);
                       return true;
                     } else {
                       console.error(`[activation] Auto-login failed on attempt ${attempt}:`, signInResult);
                       return false;
                     }
                   } catch (error) {
                     console.error(`[activation] Auto-login error on attempt ${attempt}:`, error);
                     return false;
                   }
                 };

                 // Try immediate sign-in
                 const immediateSuccess = await attemptSignIn(1);
                 if (immediateSuccess) return;

                 // Retry with exponential backoff
                 const retryDelays = [1000, 2000, 4000]; // 1s, 2s, 4s
                 for (let i = 0; i < retryDelays.length; i++) {
                   await new Promise(resolve => setTimeout(resolve, retryDelays[i]));
                   const retrySuccess = await attemptSignIn(i + 2);
                   if (retrySuccess) return;
                 }

                 // Final fallback to signin page with success message
                 console.log('[activation] All auto-login attempts failed, redirecting to signin');
                 router.push(`/${currentLocale}/signin/business?email=${encodeURIComponent(emailFromParams)}&message=${encodeURIComponent(t('activationSuccessful'))}`);
              } else {
                console.error('[activation] Auto-login API failed:', autoLoginData);
                // Fallback to signin page with success message
                router.push(`/${currentLocale}/signin/business?email=${encodeURIComponent(emailFromParams)}&message=${encodeURIComponent(t('activationSuccessful'))}`);
              }
            } catch (autoLoginError) {
              console.error('[activation] Auto-login error:', autoLoginError);
              // Fallback to signin page with success message
              router.push(`/${currentLocale}/signin/business?email=${encodeURIComponent(emailFromParams)}&message=${encodeURIComponent(t('activationSuccessful'))}`);
            }
          };

          // Add a small delay to ensure database update is committed before auto-login
          setTimeout(() => {
            handleAutoLogin();
          }, 500); // Wait 500ms before starting auto-login
          return; // Exit early to prevent the outer catch from executing
        } else {
          if (response.status === 409 && data.message === 'Your account is already active.') {
            setStatus('already_active');
            setMessage(t('accountAlreadyActive'));
            // Immediately redirect to login if already active with locale
            router.push(`/${currentLocale}/signin/business?email=${encodeURIComponent(emailFromParams)}&message=${encodeURIComponent(t('accountAlreadyActive'))}`);
          } else if (response.status === 404) {
            setStatus('error');
            setMessage(t('invalidLinkMissingInfo'));
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
            <LoadingSpinner size="lg" color="blue" className="mt-6 mb-4" />
            <p className="font-medium text-lg mb-4">{t('activatingAccount')}</p>
            <p className="text-gray-700">{t('pleaseWait')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            {userData && (
              <>
                <p className="font-medium text-lg lg:text-xl mb-3">{t('welcomeMessage', { recipientName: userData.name_first })}</p>
                <p className="mb-4">{t('accountActiveMessage')}</p>
              </>
            )}
            <p className="mt-4 text-sm text-gray-600">
              {t('redirectingToDashboard')}
            </p>
            <Link href={`/${currentLocale}/signin/business?email=${encodeURIComponent(userEmail)}`} className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700">
              {t('goToSignIn')}
            </Link>
          </>
        )}

        {status === 'auto_login' && (
          <>
            {userData && (
              <>
                <p className="font-medium text-lg lg:text-xl mb-3">{t('welcomeMessage', { recipientName: userData.name_first })}</p>
                <p className="mb-4">{t('accountActiveMessage')}</p>
              </>
            )}
            <LoadingSpinner size="md" color="blue" className="mt-6 mb-4" />
            <p className="text-sm text-gray-600">
              {t('autoLoginInProgress')}
            </p>
          </>
        )}

        {status === 'already_active' && (
          <>
            <h2 className="mb-4 text-2xl font-bold">{t('accountAlreadyActiveTitle')}</h2>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t('redirectToLoginPrompt')}
            </p>
            <Link href={`/${currentLocale}/signin/business`} className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700">
              {t('goToSignIn')}
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="mb-4 text-2xl font-bold">{t('activationFailed')}</h2>
            <p className="text-gray-700">{message}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t('checkLinkOrContactSupport')}
            </p>
            <Link href={`/${currentLocale}/signup/business`} className="mt-6 inline-block py-1 font-bold border-b border-gray-500">
              {t('trySignupAgain')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
