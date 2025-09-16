import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import DashboardWrapper from "./dashboard-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    // Check if user has only one business - if so, auto-select it
    const userBusinesses = await prisma.business.findMany({
      where: {
        usermanager: {
          user_id: session.user.id
        }
      },
      select: {
        business_id: true,
        business_name: true
      }
    })
    
    if (userBusinesses.length === 1) {
      // Auto-select the single business and continue to dashboard
      const singleBusiness = userBusinesses[0]
      console.log(`[Dashboard] Auto-selecting single business: ${singleBusiness.business_name}`)
      
      // Set the business ID in the response headers so the client can pick it up
      // The client-side business context will handle setting the session storage and cookie
      return (
        <DashboardWrapper 
          usage={{
            services: 0,
            service_requests: 0,
            boards: 0,
            appointments: 0,
            active_boards: 0,
            products: 0
          }}
          planLimits={[]}
          autoSelectBusinessId={singleBusiness.business_id}
        />
      )
    } else if (userBusinesses.length === 0) {
      // No businesses - this should be handled by server-business-provider redirect to onboarding
      redirect('/onboarding')
    } else {
      // Multiple businesses - redirect to select-business page
      redirect('/dashboard/select-business')
    }
  }

  // Fetch usage counters for the current business (dashboard-specific data)
  const usageCounters = await prisma.usagecounter.findMany({
    where: {
      business_id: currentBusinessId
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

  // Fetch business plan to get plan limits
  const businessWithPlan = await prisma.business.findUnique({
    where: {
      business_id: currentBusinessId
    },
    select: {
      plan_id: true
    }
  })

  // Fetch plan limits (dashboard-specific data)
  const planLimits = await prisma.planlimit.findMany({
    where: {
      plan_id: businessWithPlan?.plan_id || 1 // Default to plan 1 if no business plan
    }
  })

  return (
    <DashboardWrapper 
      usage={usage}
      planLimits={planLimits}
    />
  )
}
