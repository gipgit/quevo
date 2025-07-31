// src/app/[locale]/(main)/layout.tsx

import '@/app/styles/landing.css';
import '@/app/styles/main.css';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocaleModalWrapper from '@/components/ui/LocaleModalWrapper';
import { LocaleSwitcherProvider } from '@/components/ui/LocaleSwitcherProvider';

export const metadata = {
  title: 'Quevo App - Main', 
  description: 'Quevo main application content.',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleSwitcherProvider>
      <Header />
      <main className="pt-16">
          {children} {/* [business_urlname]/layout.tsx */}
      </main>
      <Footer />
      <LocaleModalWrapper />
    </LocaleSwitcherProvider>
  );
}