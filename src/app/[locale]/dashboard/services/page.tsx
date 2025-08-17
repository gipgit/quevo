import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ServicesWrapper from "./services-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function ServicesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch services for the current business (services-specific data)
  const services = await prisma.service.findMany({
    where: {
      business_id: currentBusinessId,
      is_active: true
    },
    include: {
      servicecategory: {
        select: {
          category_name: true
        }
      },
      servicequestion: {
        select: {
          question_id: true,
          question_text: true,
          question_type: true,
          is_required: true
        }
      },
      servicerequirementblock: {
        select: {
          requirement_block_id: true,
          title: true,
          requirements_text: true
        }
      },
      serviceitem: {
        select: {
          service_item_id: true,
          item_name: true,
          item_description: true,
          price_base: true,
          price_type: true,
          price_unit: true
        }
      }
    },
    orderBy: {
      display_order: 'asc'
    }
  })

  // Transform services to convert Decimal types to numbers
  const transformedServices = services.map(service => ({
    ...service,
    price_base: service.price_base ? Number(service.price_base) : null,
    serviceitem: service.serviceitem.map(item => ({
      ...item,
      price_base: item.price_base ? Number(item.price_base) : 0
    }))
  }))

  return (
    <ServicesWrapper 
      services={transformedServices}
    />
  )
}
