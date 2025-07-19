"use client";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function SubscriptionCancelledPage() {
  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-4 text-red-700">Subscription Cancelled</h1>
        <p className="mb-4">Your subscription process was cancelled or not completed. No changes have been made.</p>
        <a href="/dashboard/plan" className="text-blue-600 underline">Back to Plan Dashboard</a>
      </div>
    </DashboardLayout>
  );
}
