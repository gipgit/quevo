"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBusiness } from "@/lib/business-context";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatUsageDisplay } from "@/lib/usage-utils";
import { getPlanColors, capitalizePlanName } from "@/lib/plan-colors";
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
  const tDashboard = useTranslations("dashboard");
  const { userPlan, userManager, currentBusiness, planLimits, usage } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeDetails, setStripeDetails] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Helper to get plan limit value for a feature (same as dashboard)
  const getPlanLimitValue = (feature: string) => {
    // Map feature to correct scope
    const scopeMap: Record<string, string> = {
      services: 'global',
      service_requests: 'per_month',
      appointments: 'per_month',
      active_boards: 'global',
      products: 'global',
    }
    const scope = scopeMap[feature] || 'global'
    const limit = planLimits?.find(l => l.feature === feature && l.limit_type === 'count' && l.scope === scope)
    return limit?.value ?? null
  }

  // Helper to get the suffix for monthly limits
  const getLimitSuffix = (feature: string) => {
    const scopeMap: Record<string, string> = {
      services: 'global',
      service_requests: 'per_month',
      appointments: 'per_month',
      active_boards: 'global',
      products: 'global',
    }
    const scope = scopeMap[feature] || 'global'
    if (scope === 'per_month') {
      return tDashboard('usage.per_month')
    }
    return ''
  }

  // Helper to get usage for a feature
  const getUsageValue = (feature: string) => usage?.[feature] ?? 0



  // Usage cards config (same as dashboard)
  const usageCards = [
    {
      feature: 'services',
      label: tDashboard("usage.services"),
    },
    {
      feature: 'service_requests',
      label: tDashboard("usage.service_requests"),
    },
    {
      feature: 'appointments',
      label: tDashboard("usage.appointments"),
    },
    {
      feature: 'active_boards',
      label: tDashboard("usage.active_boards"),
    },
    {
      feature: 'products',
      label: tDashboard("usage.products"),
    },
  ]

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
    : t("currentPeriodEnd");
  const nextInvoice = subscription?.next_invoice || db?.stripe_next_invoice_date;
  const nextInvoiceDate = nextInvoice
    ? new Date(typeof nextInvoice === 'number' ? nextInvoice * 1000 : nextInvoice).toLocaleDateString()
    : t("nextInvoice");
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
        {/* Current Plan Info with Usage Limits - Two Column Layout */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Plan Details */}
            <div className="lg:w-2/5">
              <p className="text-sm text-gray-600 mb-1">{t("currentPlan")}:</p>
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const planColors = getPlanColors(planName);
                    return (
                      <span className={`inline-block px-6 py-2 text-3xl font-semibold rounded-xl shadow-md flex items-center gap-2 ${planColors.gradient} ${planColors.textColor}`}>
                        {planColors.showStar && (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        {capitalizePlanName(planName)}
                      </span>
                    );
                  })()}
                  <button
                    onClick={() => setShowPlansModal(true)}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors shadow-md"
                  >
                    {t("upgradePlan")}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-600">{t("paymentMethod")}:</p>
                  <p className="font-semibold text-lg text-gray-900">{paymentMethodDisplay}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t("subscriptionStatus")}:</p>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    subscriptionStatus === 'active' ? 'bg-green-100 text-green-800' :
                    subscriptionStatus === 'canceled' ? 'bg-red-100 text-red-800' :
                    subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                    subscriptionStatus === 'incomplete' ? 'bg-orange-100 text-orange-800' :
                    subscriptionStatus === 'incomplete_expired' ? 'bg-red-100 text-red-800' :
                    subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
                    subscriptionStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600">{t("currentPeriodEnd")}:</p>
                  <p className="font-medium">{currentPeriodEndDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t("nextInvoice")}:</p>
                  <p className="font-medium">{nextInvoiceDate}</p>
                </div>
              </div>

              {isCanceled && (
                <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{t("canceled")}: {canceledAt ? new Date(typeof canceledAt === 'number' ? canceledAt * 1000 : canceledAt).toLocaleDateString() : t("pendingCancel")}</p>
                </div>
              )}
              {waitingForUpdate && (
                <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-600 text-sm">{t("waitingForUpdate")}</p>
                </div>
              )}
            </div>

            {/* Right Column - Plan Usage */}
            {usage && planLimits && (
              <div className="lg:w-3/5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t("limits")}</h3>
                <div className="space-y-4">
                  {usageCards.map(card => {
                    const max = getPlanLimitValue(card.feature)
                    const current = getUsageValue(card.feature)
                    const suffix = getLimitSuffix(card.feature)
                    return (
                      <div key={card.feature} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">{card.label}</span>
                          <span className="font-semibold text-lg">
                            {formatUsageDisplay(current, { value: max })} {suffix}
                          </span>
                        </div>
                        {max !== -1 && max !== null && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min((current / max) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Plans Modal */}
        {showPlansModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">{t("availablePlans")}</h2>
                  <button
                    onClick={() => setShowPlansModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {allPlans.map((plan) => (
                    <div
                      key={plan.plan_id}
                      className={`rounded-3xl border p-6 bg-white flex flex-col justify-between transition-all duration-300 ${
                        userPlan?.plan_id === plan.plan_id 
                          ? "border-blue-500 shadow-lg" 
                          : plan.plan_name.toLowerCase().includes('pro') 
                            ? "border-gray-200 shadow-2xl"
                            : "border-gray-200 shadow-lg"
                      }`}
                    >
                      <div>
                        <div className="mb-4">
                          {(() => {
                            const planColors = getPlanColors(plan.plan_name);
                            return (
                              <span className={`inline-block px-4 py-2 text-xl font-semibold rounded-xl shadow-md flex items-center gap-2 w-fit ${planColors.gradient} ${planColors.textColor}`}>
                                {planColors.showStar && (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                                {capitalizePlanName(plan.plan_name)}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-2xl md:text-3xl font-bold text-gray-900">{plan.display_price}</span>
                          <span className="text-sm text-gray-500">/ {plan.display_frequency}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{plan.plan_description}</p>
                        {plan.plan_features && plan.plan_features.length > 0 && (
                          <ul className="text-sm text-gray-700 mb-2 space-y-1">
                            {plan.plan_features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                          userPlan?.plan_id === plan.plan_id 
                            ? "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50" 
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
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
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
