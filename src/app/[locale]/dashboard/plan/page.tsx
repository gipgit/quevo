import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import PlanWrapper from "./plan-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function PlanPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch data on the server
  const businesses = await prisma.business.findMany({
    where: {
      usermanager: {
        user_id: session.user.id
      }
    },
    select: {
      business_id: true,
      business_name: true,
      business_descr: true
    }
  })

  if (businesses.length === 0) {
    redirect('/dashboard/businesses')
  }

  // Get current business from cookie or use first business as fallback
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  const currentBusiness = currentBusinessId 
    ? businesses.find(b => b.business_id === currentBusinessId) || businesses[0]
    : businesses[0]

  // Fetch user manager details
  const userManager = await prisma.usermanager.findFirst({
    where: {
      user_id: session.user.id
    },
    select: {
      user_id: true,
      name_first: true,
      name_last: true,
      email: true
    }
  })

  // Fetch business plan info
  const businessWithPlan = await prisma.business.findUnique({
    where: {
      business_id: currentBusiness.business_id
    },
    include: {
      plan: {
        select: {
          plan_id: true,
          plan_name: true,
          display_price: true,
          display_frequency: true
        }
      }
    }
  })

  // Fetch usage counters for the current business
  const usageCounters = await prisma.usagecounter.findMany({
    where: {
      business_id: currentBusiness.business_id
    }
  })

  // Convert to the format expected by the component
  const usage = {
    services: usageCounters.find(c => c.feature === 'services')?.usage_count || 0,
    service_requests: usageCounters.find(c => c.feature === 'service_requests')?.usage_count || 0,
    boards: usageCounters.find(c => c.feature === 'boards')?.usage_count || 0,
    appointments: usageCounters.find(c => c.feature === 'appointments')?.usage_count || 0,
    active_boards: usageCounters.find(c => c.feature === 'active_boards')?.usage_count || 0,
    products: usageCounters.find(c => c.feature === 'products')?.usage_count || 0
  }

  // Fetch plan limits
  const planLimits = await prisma.planlimit.findMany({
    where: {
      plan_id: businessWithPlan?.plan_id || 1 // Default to plan 1 if no business plan
    }
  })

  // Fetch all available plans
  const allPlans = await prisma.plan.findMany({
    select: {
      plan_id: true,
      plan_name: true,
      display_price: true,
      display_frequency: true,
      plan_description: true,
      stripe_price_id: true
    }
  })

  // Fetch Stripe subscription details (this would need to be implemented based on your Stripe integration)
  // For now, we'll pass null and let the client component handle it
  const stripeDetails = null

  return (
    <PlanWrapper 
      currentBusiness={currentBusiness}
      userManager={userManager}
      userPlan={businessWithPlan?.plan || null}
      usage={usage}
      planLimits={planLimits}
      allPlans={allPlans}
      stripeDetails={stripeDetails}
    />
  )
}
