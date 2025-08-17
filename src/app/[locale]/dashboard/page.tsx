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
    // Redirect to select-business page instead of creating a loop
    redirect('/dashboard/select-business')
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

  // Fetch user plan to get plan limits
  const userManager = await prisma.usermanager.findFirst({
    where: {
      user_id: session.user.id
    },
    select: {
      plan_id: true
    }
  })

  // Fetch plan limits (dashboard-specific data)
  const planLimits = await prisma.planlimit.findMany({
    where: {
      plan_id: userManager?.plan_id || 1 // Default to plan 1 if no user plan
    }
  })

  return (
    <DashboardWrapper 
      usage={usage}
      planLimits={planLimits}
    />
  )
}
