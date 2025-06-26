// src/app/(main)/layout.tsx

import '@/app/styles/landing.css';
import '@/app/styles/main.css';


import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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
    <>
      <Header />
      <main>
          {children} {/* [business_urlname]/layout.tsx */}
      </main>
      <Footer />
    </>
  );
}