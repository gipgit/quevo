// C:\Users\Utente\Desktop\quevo\quevo-app\src\app\page.tsx
// This is a Server Component, meaning it runs on the server.
// Server Components can directly access your database via Prisma.

import prisma from '@/lib/prisma'; // Adjust path if your prisma.ts is elsewhere
import Link from 'next/link';

async function getBusinesses() {
  try {
    const businesses = await prisma.business.findMany({ // 'business' is your model name (usually pluralized table name)
      // You can add options like orderBy, select, where, etc.
      orderBy: {
        business_name: 'asc', // Order by business name alphabetically
      },
      take: 10, // Fetch only the first 10 businesses for now
    });
    return businesses;
  } catch (error) {
    console.error("Error fetching businesses:", error);
    // In a real app, you'd handle this gracefully (e.g., return an empty array or throw an error)
    return [];
  }
}

export default async function HomePage() {
  // Data is fetched on the server before the page is sent to the browser.
  const businesses = await getBusinesses();

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to Quevo!</h1>
      <p>Here are some businesses from your database:</p>

      {businesses.length === 0 ? (
        <p>No businesses found in the database. Did the init.sql run correctly?</p>
      ) : (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
        }}>
          {businesses.map((business) => (
            <div key={business.business_public_uuid} style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
            }}>
              <h2>{business.business_name}</h2>
              <p><strong>Company:</strong> {business.company_name}</p>
              <p><strong>Location:</strong> {business.business_city}, {business.business_region}, {business.business_country}</p>
              <p>{business.business_descr}</p>
            </div>
          ))}
        </div>
      )}

      <p style={{ marginTop: '40px' }}>
        <Link href="/about">
          Go to About Page (Example Static Page)
        </Link>
      </p>
    </main>
  );
}