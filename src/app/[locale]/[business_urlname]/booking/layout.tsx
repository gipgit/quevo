// src/app/[locale]/[business_urlname]/booking/layout.tsx
// This layout file specifically targets the /booking/[booking_ref] route (and any other pages
// you might add directly under /booking) and will override any less specific layouts
// (like a layout in src/app/[locale]/[business_urlname]/).

import React from 'react';

// This layout intentionally does NOT import or render the BusinessProfileHeader.
// It will simply render its children, which in this case will be your
// booking confirmation page (page.tsx).

export default function BookingSpecificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* The children prop represents the content of your page.tsx */}
      {children}
      {/* You might still have a global footer or other elements if they are defined
          in a higher-level layout (e.g., src/app/[locale]/layout.tsx or src/app/layout.tsx) */}
    </>
  );
}
