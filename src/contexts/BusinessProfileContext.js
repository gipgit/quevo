// src/contexts/BusinessProfileContext.js

"use client"; // Required as this defines a client-side context

import React, { createContext, useContext } from 'react';

// Create the context with an undefined default value.
const BusinessProfileContext = createContext(undefined);

/**
 * Custom hook to access the Business Profile Context.
 * Throws an error if used outside of a BusinessProfileProvider.
 */
export function useBusinessProfile() {
  const context = useContext(BusinessProfileContext);
  if (context === undefined) {
    throw new Error('useBusinessProfile must be used within a BusinessProfileProvider');
  }
  return context;
}

/**
 * Provides the business profile data and related utilities to its children.
 * Data is expected to be passed via the `value` prop.
 */
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