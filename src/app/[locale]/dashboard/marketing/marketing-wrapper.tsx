'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import MarketingContentDisplay from "./marketing-content-display"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  is_required: boolean | null
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: number | null
  price_type: string
  price_unit: string | null
}

interface Service {
  service_id: number
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  has_items: boolean | null
  date_selection: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

interface Business {
  business_id: string
  business_name: string
  business_descr: string | null
}

interface MarketingWrapperProps {
  services: Service[]
  business: Business
}

export default function MarketingWrapper({ services, business }: MarketingWrapperProps) {
  const t = useTranslations("marketing")

  const formatServicesForPrompt = (business: Business, services: Service[]): string => {
    if (!business || services.length === 0) {
      return "No services available for this business."
    }

    let text = `Business Name: ${business.business_name}\n\n`
    text += `Business Description: ${business.business_descr || "No description available"}\n\n`
    text += "Services:\n\n"

    services.forEach((service, index) => {
      text += `${index + 1}. ${service.service_name}\n`
      
      if (service.description) {
        text += `   Description: ${service.description}\n`
      }
      
      if (service.price_base !== null) {
        text += `   Price: €${service.price_base}\n`
      }
      
      if (service.duration_minutes) {
        text += `   Duration: ${service.duration_minutes} minutes\n`
      }
      
      if (service.servicecategory?.category_name) {
        text += `   Category: ${service.servicecategory.category_name}\n`
      }

      // Add service items
      if (service.serviceitem.length > 0) {
        text += `   Items included:\n`
        service.serviceitem.forEach(item => {
          text += `     - ${item.item_name}`
          if (item.item_description) {
            text += `: ${item.item_description}`
          }
          if (item.price_base) {
            text += ` (€${item.price_base})`
          }
          text += `\n`
        })
      }

      // Add questions
      if (service.servicequestion.length > 0) {
        text += `   Questions asked to clients:\n`
        service.servicequestion.forEach(question => {
          text += `     - ${question.question_text}${question.is_required ? ' (Required)' : ''}\n`
        })
      }

      // Add requirements
      if (service.servicerequirementblock.length > 0) {
        text += `   Requirements:\n`
        service.servicerequirementblock.forEach(req => {
          text += `     - ${req.title || req.requirements_text}\n`
        })
      }

      text += "\n"
    })

    return text
  }

  const servicesText = formatServicesForPrompt(business, services)

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h1>
          <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">{t("subtitle")}</p>
        </div>

        <MarketingContentDisplay
          servicesText={servicesText}
          emailContent=""
          socialMediaTitle=""
          socialMediaDescription=""
          business={business}
          services={services}
          isGenerating={false}
          hasServices={services.length > 0}
        />
      </div>
    </DashboardLayout>
  )
}
