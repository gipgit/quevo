import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import SupportRequestsWrapper from "./support-requests-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function SupportRequestsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch support requests for the current business with enhanced data
  const supportRequests = await prisma.servicesupportrequest.findMany({
    where: {
      business_id: currentBusinessId
    },
    select: {
      support_request_id: true,
      board_ref: true,
      message: true,
      email: true,
      priority: true,
      category: true,
      status: true,
      assigned_to: true,
      resolution_notes: true,
      created_at: true,
      updated_at: true,
      customer_id: true,
      related_action_id: true,
      // Include customer data
      usercustomer: {
        select: {
          name_first: true,
          name_last: true,
          email: true,
          phone: true
        }
      },
      // Include assigned manager data
      usermanager: {
        select: {
          name_first: true,
          name_last: true,
          email: true
        }
      },
      // Include related service board action
      serviceboardaction: {
        select: {
          action_id: true,
          action_title: true,
          action_type: true,
          action_status: true,
          action_priority: true,
          created_at: true,
          due_date: true,
          is_customer_action_required: true
        }
      },
      // Include attachments
      attachments: {
        select: {
          id: true,
          file_name: true,
          file_path: true,
          created_at: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return (
    <SupportRequestsWrapper 
      supportRequests={supportRequests}
    />
  )
}
