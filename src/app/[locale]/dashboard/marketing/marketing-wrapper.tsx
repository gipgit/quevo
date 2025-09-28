'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import SocialMediaContentGenerator from "./social-media-content-generator"
import { AIAssistantIcon } from "@/components/ui/ai-assistant-icon"

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
  price_type: string | null
  price_unit: string | null
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  price_base: number | null
  price_type: string | null
  has_items: boolean | null
  active_booking: boolean | null
  active_quotation: boolean | null
  is_active: boolean | null
  display_order: number | null
  date_created: Date | null
  date_updated: Date | null
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
  locale: string
}

export default function MarketingWrapper({ services, business, locale }: MarketingWrapperProps) {
  const t = useTranslations("marketing")

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col items-center text-center">
            <AIAssistantIcon size="md" className="mb-4" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {t("title")}
            </h1>
          </div>
        </div>

        <SocialMediaContentGenerator
          business={business}
          services={services}
          locale={locale}
        />
      </div>
    </DashboardLayout>
  )
}