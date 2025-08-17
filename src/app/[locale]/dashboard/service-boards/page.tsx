import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ServiceBoardsWrapper from "./service-boards-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function ServiceBoardsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch service boards for the current business (service-boards-specific data)
  const serviceBoards = await prisma.serviceboard.findMany({
    where: {
      business_id: currentBusinessId
    },
    include: {
      servicerequest: {
        select: {
          request_reference: true,
          service: {
            select: {
              service_name: true,
              servicecategory: {
                select: {
                  category_name: true
                }
              }
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
      serviceboardaction: {
        select: {
          action_id: true,
          action_type: true,
          action_title: true,
          action_status: true,
          created_at: true,
          due_date: true
        },
        orderBy: {
          created_at: 'desc'
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  return (
    <ServiceBoardsWrapper 
      serviceBoards={serviceBoards}
    />
  )
}