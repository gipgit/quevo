// app/layout.jsx (or .tsx)

import '@/app/styles/global.css'; 
import '@/app/styles/landing.css'; 
import '@/app/styles/main.css';

import Header from '@/components/layout/Header'; 
import Footer from '@/components/layout/Footer'; 

export const metadata = {
  title: 'Queva App', // Adjust your app title
  description: 'Your new Queva application', // Adjust your app description
};

export default function RootLayout({
  children, // The page content will be rendered here
}) {
  return (
    <html lang="it">
      <body>
        {/* The Header component for your entire application */}
        <Header />

        {/* The 'children' prop renders the content of your pages (like app/page.jsx) */}
        <main>
            {children}
        </main>

        {/* The Footer component for your entire application */}
        <Footer />
      </body>
    </html>
  );
}