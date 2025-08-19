'use client'

import { useState } from "react"
import { useTranslations } from "next-intl"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import SocialMediaContentGenerator from "./social-media-content-generator"

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
  price_type: string
  has_items: boolean | null
  date_selection: boolean | null
  quotation_available: boolean | null
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
  locale: string
}

export default function MarketingWrapper({ services, business, locale }: MarketingWrapperProps) {
  const t = useTranslations("marketing")

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t("title")}
              </h1>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>
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
