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
          question_options: true,
          max_length: true,
          is_required: true
        }
      },
      servicerequirementblock: {
        select: {
          requirement_block_id: true,
          title: true,
          requirements_text: true,
          is_required: true
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
      },
      serviceextra: {
        select: {
          service_extra_id: true,
          extra_name: true,
          extra_description: true,
          price_base: true,
          price_type: true,
          price_unit: true
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
          display_order: true,
          is_active: true
        }
      }
    },
    orderBy: {
      display_order: 'asc'
    }
  })

  // Transform services to convert Decimal types to numbers and handle null values
  const transformedServices = services.map(service => ({
    ...service,
    service_id: service.service_id, // Keep as string (UUID)
    price_base: service.price_base ? Number(service.price_base) : null,
    serviceitem: service.serviceitem.map(item => ({
      ...item,
      price_base: item.price_base ? Number(item.price_base) : 0
    })),
    serviceextra: service.serviceextra.map(extra => ({
      ...extra,
      price_base: extra.price_base ? Number(extra.price_base) : 0
    })),
    servicequestion: service.servicequestion.map(question => ({
      ...question,
      max_length: question.max_length || undefined
    })),
    serviceevent: service.serviceevent.map(event => ({
      ...event,
      duration_minutes: event.duration_minutes || 60,
      buffer_minutes: event.buffer_minutes || 0,
      is_active: event.is_active || true,
      display_order: event.display_order || 0,
      is_required: event.is_required || true
    }))
  }))

  return (
    <ServicesWrapper 
      services={transformedServices}
    />
  )
}
