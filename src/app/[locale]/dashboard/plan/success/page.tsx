// src/app/success/page.tsx

'use client'; // This component uses client-side hooks like useRouter and useEffect

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // For accessing URL query parameters
import Link from 'next/link';
import type Stripe from 'stripe'; // Import Stripe types for better type checking

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id'); // Get the session_id from the URL
  
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState<Stripe.Checkout.Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt to fetch if a sessionId is present
    if (sessionId) {
      const fetchSessionDetails = async () => {
        try {
          // Call your new backend API route to get session details
          const response = await fetch(`/api/payments/get-checkout-session?session_id=${sessionId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch session details from API.');
          }

          const data = await response.json();
          setSessionDetails(data.session); // Store the fetched session object
        } catch (err: any) {
          console.error('Error fetching session details:', err);
          setError(err.message || 'An unexpected error occurred.');
        } finally {
          setLoading(false); // End loading regardless of success or failure
        }
      };

      fetchSessionDetails();
    } else {
      // If no session ID, stop loading and set an error
      setError('No session ID found in the URL.');
      setLoading(false);
    }
  }, [sessionId]); // Re-run effect if sessionId changes

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
        <h1 className="text-4xl font-bold mb-4">Loading Payment Details...</h1>
        <p className="text-lg">Please wait while we confirm your subscription.</p>
        <div className="mt-8 animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4">
        <h1 className="text-4xl font-bold mb-4">Error Confirming Payment</h1>
        <p className="text-lg mb-4">{error}</p>
        <p className="text-md">Please try again or contact support if the issue persists.</p>
        <Link href="/" className="mt-8 text-indigo-600 hover:underline">
          Go to Home
        </Link>
      </div>
    );
  }

  // If sessionDetails are loaded, display them
  const customerEmail = (sessionDetails?.customer_details?.email || (sessionDetails?.customer as Stripe.Customer)?.email) || 'N/A';
  const subscriptionId = (sessionDetails?.subscription as Stripe.Subscription)?.id || 'N/A';
  const priceId = (sessionDetails?.line_items?.data[0]?.price?.id) || 'N/A';
  const planName = (sessionDetails?.line_items?.data[0]?.price?.product as Stripe.Product)?.name || 'N/A';
  const subscriptionStatus = (sessionDetails?.subscription as Stripe.Subscription)?.status || 'N/A';
  const totalAmount = sessionDetails?.amount_total ? `${sessionDetails.currency?.toUpperCase()} ${(sessionDetails.amount_total / 100).toFixed(2)}` : 'N/A';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-800 p-4">
      <h1 className="text-5xl font-bold mb-4 text-center">Payment Successful! 🎉</h1>
      <p className="text-lg mb-8 text-center max-w-prose">
        Thank you for your subscription. Your access is now active. Here are your payment details:
      </p>

      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-gray-900 border border-green-200">
        <h2 className="text-2xl font-semibold mb-6 text-center">Subscription Details</h2>
        <div className="space-y-3">
          <p><strong>Email:</strong> {customerEmail}</p>
          <p><strong>Plan Name:</strong> {planName}</p>
          <p><strong>Subscription ID:</strong> <span className="break-all">{subscriptionId}</span></p>
          <p><strong>Price ID:</strong> <span className="break-all">{priceId}</span></p>
          <p><strong>Subscription Status:</strong> <span className={`font-medium ${subscriptionStatus === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
            {subscriptionStatus.replace(/_/g, ' ').toUpperCase()}
          </span></p>
          {sessionDetails?.amount_total && (
            <p className="text-xl font-bold pt-4 text-center text-green-700">
              Amount Paid: {totalAmount}
            </p>
          )}
        </div>
      </div>

      <Link href="/dashboard" className="mt-10 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200">
        Go to Dashboard
      </Link>
    </div>
  );
}
