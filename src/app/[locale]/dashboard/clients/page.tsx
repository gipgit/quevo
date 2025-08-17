import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ClientsWrapper from "./clients-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function ClientsPage() {
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

  // Fetch all service requests for this business with customer data
  const serviceRequests = await prisma.servicerequest.findMany({
    where: {
      business_id: currentBusiness.business_id
    },
    include: {
      usercustomer: {
        select: {
          user_id: true,
          name_first: true,
          name_last: true,
          email: true,
          phone: true,
          date_created: true,
          active: true
        }
      },
      serviceboard: {
        select: {
          board_id: true,
          board_title: true,
          status: true,
          created_at: true,
          updated_at: true
        }
      }
    },
    orderBy: {
      date_created: 'desc'
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
      plan_id: 1 // Default plan
    }
  })

  // Get user's plan ID
  const userManager = await prisma.usermanager.findFirst({
    where: {
      user_id: session.user.id
    },
    select: {
      plan_id: true
    }
  })

  const userPlanId = userManager?.plan_id || 1

  // Get email rate limit status
  const { EmailRateLimiter } = await import("@/lib/email-rate-limit")
  const rateLimitStatus = await EmailRateLimiter.getRateLimitStatus(
    currentBusiness.business_id,
    userPlanId
  )

  // Process customers data
  const customersMap = new Map()

  serviceRequests.forEach(request => {
    const customer = request.usercustomer
    if (!customer) return

    const customerId = customer.user_id
    
    if (!customersMap.has(customerId)) {
      customersMap.set(customerId, {
        id: customerId,
        name_first: customer.name_first,
        name_last: customer.name_last,
        email: customer.email,
        phone: customer.phone,
        date_created: customer.date_created,
        active: customer.active,
        requests: [],
        boards: [],
        lastActivity: customer.date_created
      })
    }

    const customerData = customersMap.get(customerId)
    customerData.requests.push({
      request_id: request.request_id,
      request_reference: request.request_reference,
      date_created: request.date_created,
      status: request.status
    })

    // Collect all service boards for this customer
    if (request.serviceboard) {
      customerData.boards.push(...request.serviceboard)
    }

    // Update last activity
    if (request.date_created && request.date_created > customerData.lastActivity) {
      customerData.lastActivity = request.date_created
    }
  })

  const customers = Array.from(customersMap.values())

  // Categorize customers based on service board statuses
  const activeCustomers = customers.filter(customer => {
    return customer.boards.some((board: { status: string }) => 
      board.status === 'active' || board.status === 'in_progress'
    )
  })

  const pastCustomers = customers.filter(customer => {
    const hasCompletedBoard = customer.boards.some((board: { status: string }) => board.status === 'completed')
    const hasActiveOrInProgressBoard = customer.boards.some((board: { status: string }) => 
      board.status === 'active' || board.status === 'in_progress'
    )
    return hasCompletedBoard && !hasActiveOrInProgressBoard
  })

  const uncommittedCustomers = customers.filter(customer => {
    const hasActiveOrInProgressBoard = customer.boards.some((board: { status: string }) => 
      board.status === 'active' || board.status === 'in_progress'
    )
    const hasCompletedBoard = customer.boards.some((board: { status: string }) => board.status === 'completed')
    const allBoardsPending = customer.boards.length > 0 && 
      customer.boards.every((board: { status: string }) => board.status === 'pending')
    
    return !hasActiveOrInProgressBoard && !hasCompletedBoard && allBoardsPending
  })

  return (
    <ClientsWrapper 
      currentBusiness={currentBusiness}
      activeCustomers={activeCustomers}
      pastCustomers={pastCustomers}
      uncommittedCustomers={uncommittedCustomers}
      usage={usage}
      planLimits={planLimits}
      rateLimitStatus={rateLimitStatus}
    />
  )
}
