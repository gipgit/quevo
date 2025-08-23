import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import QuotationBuilder from "./quotation-builder"

interface PageProps {
  searchParams: {
    requestId?: string
  }
}

export default async function QuotationGeneratorPage({ searchParams }: PageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const { requestId } = searchParams

  if (!requestId) {
    redirect('/dashboard/service-requests')
  }

  // Fetch the service request with all necessary data
  const serviceRequest = await prisma.servicerequest.findUnique({
    where: {
      request_id: requestId
    },
    include: {
      business: true,
      usercustomer: true,
      service: true,
      servicerequestselectedserviceitem: {
        include: {
          serviceitem: true
        }
      }
    }
  })

  if (!serviceRequest) {
    redirect('/dashboard/service-requests')
  }

  // Quotation templates are not currently supported
  const savedTemplates: any[] = []

  // Transform the data to match the expected format
  const quotationData = {
    requestId: serviceRequest.request_id,
    requestReference: serviceRequest.request_reference,
    business: {
      id: serviceRequest.business.business_id,
      name: serviceRequest.business.business_name,
      description: serviceRequest.business.business_descr,
      address: serviceRequest.business.business_address,
      phone: serviceRequest.business.business_phone,
      email: serviceRequest.business.business_email,
      companyName: serviceRequest.business.company_name,
      vat: serviceRequest.business.company_vat,
      companyAddress: serviceRequest.business.company_address
    },
    customer: {
      id: serviceRequest.usercustomer?.user_id,
      name: serviceRequest.usercustomer ? `${serviceRequest.usercustomer.name_first} ${serviceRequest.usercustomer.name_last}` : serviceRequest.customer_name || '',
      email: serviceRequest.usercustomer?.email || serviceRequest.customer_email,
      phone: serviceRequest.usercustomer?.phone || serviceRequest.customer_phone,
      address: null, // Not available in current schema
      city: serviceRequest.usercustomer?.residence_city || null,
      region: serviceRequest.usercustomer?.residence_region || null,
      country: serviceRequest.usercustomer?.residence_country || null
    },
    service: {
      id: serviceRequest.service.service_id,
      name: serviceRequest.service.service_name,
      description: serviceRequest.service.description,
      basePrice: serviceRequest.service.price_base ? serviceRequest.service.price_base.toNumber() : null,
      items: (Array.isArray(serviceRequest.selected_service_items_snapshot) ? serviceRequest.selected_service_items_snapshot : []).map((item: any, index: number) => ({
        id: index + 1, // Generate a unique ID since we don't have the actual service_item_id
        name: item.name || item.item_name, // Handle both new and old format
        description: null, // Not available in snapshot
        price: null, // Not available in snapshot
        priceAtRequest: item.price_at_req || item.price_at_request || 0,
        priceType: item.price_type || 'fixed',
        priceUnit: item.price_unit || null,
        quantity: item.qty || item.quantity || 1
      })),
      requirements: [] // Simplified for now
    },
    requestDetails: {
      status: serviceRequest.status,
      dateCreated: serviceRequest.date_created,
      notes: serviceRequest.customer_notes,
      specialRequirements: null, // Not available in current schema
      priceSubtotal: serviceRequest.price_subtotal ? serviceRequest.price_subtotal.toNumber() : null
    }
  }

  return (
    <QuotationBuilder 
      quotationData={quotationData}
      savedTemplates={savedTemplates}
    />
  )
}
