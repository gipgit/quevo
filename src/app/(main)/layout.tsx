// app/layout.tsx

import '@/app/styles/global.css'; 
import '@/app/styles/landing.css'; 
import '@/app/styles/main.css';

import Header from '@/components/layout/Header'; 
import Footer from '@/components/layout/Footer'; 


export const metadata = {
  title: 'Quevo App', 
  description: 'Quevo', 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <html lang="it">
      <body>
        <Header />
        <main>
            {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}