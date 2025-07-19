"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBusiness } from "@/lib/business-context";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type Stripe from "stripe";

interface Plan {
  plan_id: number;
  plan_name: string;
  display_price: string;
  display_frequency: string | null;
  plan_description?: string | null;
  stripe_price_id?: string | null;
  plan_features?: string[];
}

export default function PlanPage() {
  const t = useTranslations("plan");
  const { userPlan, userManager, currentBusiness, planLimits, usage } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeDetails, setStripeDetails] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  // Fetch plans and Stripe details
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const plansRes = await fetch("/api/plans");
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setAllPlans(plansData.plans);
        }
        // Fetch Stripe subscription/payment details for the current user
        if (userManager?.id) {
          const stripeRes = await fetch(`/api/user/${userManager.id}/subscription`);
          if (stripeRes.ok) {
            const stripeData = await stripeRes.json();
            setStripeDetails(stripeData);
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userManager]);

  const handleUpgrade = async (plan: Plan) => {
    setUpgrading(plan.stripe_price_id || "");
    setWaitingForConfirmation(false);
    try {
      // Call your API to create a Stripe checkout session for the selected plan
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          userId: userManager?.id,
          userEmail: userManager?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        setWaitingForConfirmation(true);
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start upgrade process.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to start upgrade process.");
    } finally {
      setUpgrading(null);
    }
  };

  if (!currentBusiness) return null;

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-red-600">{error}</div>
      </DashboardLayout>
    );
  }

  if (waitingForConfirmation) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <LoadingSpinner size="lg" color="blue" className="mb-4" />
          <div className="text-yellow-700 font-semibold">{t("waitingForConfirmation")}</div>
        </div>
      </DashboardLayout>
    );
  }

  // Current plan and subscription details
  const db = stripeDetails?.userManager;
  const subscription = stripeDetails?.subscription;
  const paymentMethod = stripeDetails?.default_payment_method;

  // Prefer live Stripe data if available, fallback to DB
  const planName = userPlan?.plan_name || db?.plan_name;
  const planId = userPlan?.plan_id || db?.plan_id;
  const managerName = `${userManager?.name_first || db?.name_first || ''} ${userManager?.name_last || db?.name_last || ''}`;
  const subscriptionStatus = subscription?.status || db?.stripe_status || t("noStatus");
  const currentPeriodEnd = subscription?.current_period_end || db?.stripe_current_period_end;
  const currentPeriodEndDate = currentPeriodEnd
    ? new Date(typeof currentPeriodEnd === 'number' ? currentPeriodEnd * 1000 : currentPeriodEnd).toLocaleDateString()
    : "N/A";
  const nextInvoice = subscription?.next_invoice || db?.stripe_next_invoice_date;
  const nextInvoiceDate = nextInvoice
    ? new Date(typeof nextInvoice === 'number' ? nextInvoice * 1000 : nextInvoice).toLocaleDateString()
    : "N/A";
  const paymentMethodDisplay = paymentMethod?.card?.brand
    ? `${paymentMethod.card.brand} ••••${paymentMethod.card.last4}`
    : db?.stripe_payment_method_brand
    ? `${db.stripe_payment_method_brand} ••••${db.stripe_payment_method_last4}`
    : t("noPaymentMethod");
  const cancelAtPeriodEnd = subscription?.cancel_at_period_end ?? db?.stripe_cancel_at_period_end;
  const canceledAt = subscription?.canceled_at || db?.stripe_canceled_at;
  const isCanceled = cancelAtPeriodEnd || canceledAt;
  const waitingForUpdate = db && subscription && db.stripe_status !== subscription.status;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">{t("title")}</h1>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" color="blue" />
          </div>
        ) : (
          <>
        <div className="flex flex-col lg:flex-row justify-between gap-3 bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div>
          <p>{t("currentPlan")}:</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{planName}</h2>
          <p className="text-gray-600 mb-2">{t("paymentMethod")}: {paymentMethodDisplay}</p>
          <p className="text-gray-600 mb-2">{t("subscriptionStatus")}: {subscriptionStatus}</p>
          <p className="text-gray-600 mb-2">{t("currentPeriodEnd")}: {currentPeriodEndDate}</p>
          <p className="text-gray-600 mb-2">{t("nextInvoice")}: {nextInvoiceDate}</p>
          {isCanceled && (
            <p className="text-red-600 mb-2">{t("canceled")}: {canceledAt ? new Date(typeof canceledAt === 'number' ? canceledAt * 1000 : canceledAt).toLocaleDateString() : t("pendingCancel")}</p>
          )}
          {waitingForUpdate && (
            <p className="text-yellow-600 mb-2">{t("waitingForUpdate")}</p>
          )}
          </div>
          {planLimits && (
            <div className="min-w-[30%]">
              <h3 className="text-md font-semibold text-gray-900 mb-4">{t("limits")}</h3>
              <ul className="space-y-3">
                {[
                  { key: 'maxBusinesses', label: 'Businesses', usageKey: 'businesses' },
                  { key: 'maxProducts', label: 'Products', usageKey: 'products' },
                  { key: 'maxServices', label: 'Services', usageKey: 'services' },
                  { key: 'maxPromos', label: 'Promos', usageKey: 'promos' },
                  { key: 'maxBookings', label: 'Bookings', usageKey: 'bookings' },
                  { key: 'maxQuestionsPerService', label: 'Questions per Service', usageKey: null }
                ].map(({ key, label, usageKey }) => {
                  const limit = (planLimits as any)[key];
                  const used = usage && usageKey ? (usage as any)[usageKey] ?? 0 : 0;
                  const percent = limit === -1 ? 0 : Math.min(100, (used / limit) * 100);
                  return (
                    <li key={key} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{label}</span>
                        <span>{limit === -1 ? `${used} / ∞` : `${used} / ${limit}`}</span>
                      </div>
                      {limit === -1 ? (
                        <div className="h-2 bg-gray-200 rounded"></div>
                      ) : (
                        <div className="h-2 bg-gray-200 rounded">
                          <div
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold mb-4 mt-8">{t("availablePlans")}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-between">
          {allPlans.map((plan) => (
            <div
              key={plan.plan_id}
              className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col justify-between ${userPlan?.plan_id === plan.plan_id ? "border-blue-500" : "border-gray-200"}`}
            >
              <div>
                <h3 className="text-lg md:text-2xl font-bold mb-2">{plan.plan_name}</h3>
                <p className="text-lg md:text-xl text-gray-600 mb-2">{plan.display_price} / {plan.display_frequency}</p>
                <p className="text-sm mb-2">{plan.plan_description}</p>
                {plan.plan_features && plan.plan_features.length > 0 && (
                  <ul className="text-xs text-gray-500 mb-2 list-disc ml-4">
                    {plan.plan_features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${userPlan?.plan_id === plan.plan_id ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}
                onClick={() => handleUpgrade(plan)}
                disabled={userPlan?.plan_id === plan.plan_id || upgrading === plan.stripe_price_id}
              >
                {userPlan?.plan_id === plan.plan_id
                  ? t("currentPlan")
                  : upgrading === plan.stripe_price_id
                  ? t("upgrading")
                  : t("upgradePlan")}
              </button>
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
