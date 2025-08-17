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

  // Fetch saved quotation templates
  const savedTemplates = await prisma.quotationtemplate.findMany({
    where: {
      business_id: serviceRequest.business_id
    },
    select: {
      id: true,
      template_name: true,
      template_data: true,
      is_default: true,
      created_at: true
    },
    orderBy: {
      created_at: 'desc'
    }
  }).then(templates => templates.map(template => ({
    ...template,
    is_default: template.is_default ?? false
  })))

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
      items: serviceRequest.servicerequestselectedserviceitem.map(item => ({
        id: item.serviceitem.service_item_id,
        name: item.serviceitem.item_name,
        description: item.serviceitem.item_description,
        price: item.serviceitem.price_base ? item.serviceitem.price_base.toNumber() : null,
        priceAtRequest: item.price_at_request ? item.price_at_request.toNumber() : null,
        priceType: item.serviceitem.price_type,
        priceUnit: item.serviceitem.price_unit,
        quantity: item.quantity
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
