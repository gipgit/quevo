import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import MarketingWrapper from "./marketing-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function MarketingPage({
  params
}: {
  params: { locale: string }
}) {
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

  // Fetch services for the current business
  const services = await prisma.service.findMany({
    where: {
      business_id: currentBusiness.business_id,
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
      price_base: item.price_base ? Number(item.price_base) : null
    }))
  }))

  return (
    <MarketingWrapper 
      services={transformedServices}
      business={currentBusiness}
      locale={params.locale}
    />
  )
}
