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

  // Fetch service requests for the current business with enhanced data
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
        // Snapshot data for request details
        selected_service_items_snapshot: true,
        question_responses_snapshot: true,
        requirement_responses_snapshot: true,
        // Event and datetime information
        event_id: true,
        request_datetimes: true,
        // New fields for enhanced management
        is_handled: true,
        handled_at: true,
        handled_by: true,
        priority: true,
        urgency_flag: true,
        is_closed: true,
        generated_response: true,
        generated_response_saved_at: true,
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
      serviceevent: {
        select: {
          event_id: true,
          event_name: true,
          event_description: true,
          event_type: true,
          duration_minutes: true,
          buffer_minutes: true,
          is_required: true,
          is_active: true
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
          changed_at: true,
          changed_by: true
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
      },
      // Include linked service board
      serviceboard: {
        select: {
          board_id: true,
          board_ref: true,
          board_title: true,
          status: true,
          action_count: true,
          created_at: true,
          updated_at: true,
          serviceboardaction: {
            select: {
              action_id: true,
              action_type: true,
              action_title: true,
              action_status: true,
              action_priority: true,
              created_at: true,
              due_date: true,
              is_customer_action_required: true
            },
            orderBy: {
              created_at: 'desc'
            }
          }
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