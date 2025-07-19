// src/contexts/BusinessProfileContext.js

"use client";

import React, { createContext, useContext } from 'react';

// Create the context with an undefined default value.
const BusinessProfileContext = createContext(undefined);


export function useBusinessProfile() {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
}


export function BusinessProfileProvider({ children, value }) {
  if (!value) {
    console.error("BusinessProfileProvider received no value. This indicates a problem with data passing from the BusinessProfileClientWrapper.");
    return <div>Error: Business profile data not available.</div>;
  }

  return (
    <BusinessProfileContext.Provider value={value}>
      {children}
    </BusinessProfileContext.Provider>
  );
}