import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ServiceRequestsWrapper from "./service-requests-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function ServiceRequestsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch service requests for the current business (service-requests-specific data)
  const serviceRequests = await prisma.servicerequest.findMany({
    where: {
      business_id: currentBusinessId
    },
    select: {
      request_id: true,
      request_reference: true,
      status: true,
      date_created: true,
      customer_name: true,
      customer_email: true,
      customer_phone: true,
      customer_notes: true,
      price_subtotal: true,
      service: {
        select: {
          service_name: true,
          servicecategory: {
            select: {
              category_name: true
            }
          }
        }
      },
      usercustomer: {
        select: {
          name_first: true,
          name_last: true,
          email: true,
          phone: true
        }
      },
      servicerequeststatushistory: {
        select: {
          new_status: true,
          changed_at: true
        },
        orderBy: {
          changed_at: 'desc'
        }
      },
      servicerequestmessage: {
        select: {
          message_text: true,
          sent_at: true,
          sender_type: true
        },
        orderBy: {
          sent_at: 'desc'
        }
      }
    },
    orderBy: {
      date_created: 'desc'
    }
  })

  // Convert Decimal price_subtotal to numbers
  const serializedServiceRequests = serviceRequests.map(request => ({
    ...request,
    price_subtotal: request.price_subtotal ? request.price_subtotal.toNumber() : null
  }))

  return (
    <ServiceRequestsWrapper 
      serviceRequests={serializedServiceRequests}
    />
  )
} 