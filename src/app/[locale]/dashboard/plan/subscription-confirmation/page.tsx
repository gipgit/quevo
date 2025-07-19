"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { useBusiness } from "@/lib/business-context";

export default function SubscriptionConfirmationPage() {
  const { userManager } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        // Optionally, you can use sessionId to fetch more details if needed
        const res = await fetch(`/api/user/${userManager?.id}/subscription`);
        const data = await res.json();
        if (data.subscription?.status) {
          setStatus(data.subscription.status);
        } else if (data.userManager?.stripe_status) {
          setStatus(data.userManager.stripe_status);
        } else {
          setStatus("unknown");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (userManager?.id) fetchStatus();
  }, [userManager, sessionId]);

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto text-center py-16">
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <div className="text-green-700 font-semibold">Checking subscription status...</div>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : status === "active" ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-green-700">Subscription Active!</h1>
            <p className="mb-4">Your subscription is now active. Thank you for your purchase!</p>
            <a href="/dashboard/plan" className="text-blue-600 underline">Go to Plan Dashboard</a>
          </>
        ) : status === "trialing" ? (
          <>
            <h1 className="text-2xl font-bold mb-4 text-yellow-700">Trial Started!</h1>
            <p className="mb-4">Your trial period has started. Enjoy your plan features!</p>
            <a href="/dashboard/plan" className="text-blue-600 underline">Go to Plan Dashboard</a>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4 text-gray-700">Subscription Pending</h1>
            <p className="mb-4">We're processing your subscription. Please refresh this page in a moment.</p>
            <a href="/dashboard/plan" className="text-blue-600 underline">Go to Plan Dashboard</a>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
