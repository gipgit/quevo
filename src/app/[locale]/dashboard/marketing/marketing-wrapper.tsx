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
  price_type: string | null
  price_unit: string | null
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  price_type: string | null
  has_items: boolean | null
  available_booking: boolean | null
  available_quotation: boolean | null
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
        <div className="mb-6">
          <div className="bg-gradient-to-tl from-black via-yellow-600/80 via-blue-800 to-blue-300 rounded-xl p-6 shadow-lg relative overflow-hidden">
            {/* AI Pattern Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,0,0.08)_1px,transparent_1px)] bg-[length:25px_25px]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(0,255,255,0.06)_2px,transparent_2px)] bg-[length:35px_35px]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(255,255,0,0.04)_1.5px,transparent_1.5px)] bg-[length:30px_30px]"></div>
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1 drop-shadow-lg">
                  {t("title")}
                </h1>
                <p className="text-sm text-yellow-100 drop-shadow-md">
                  {t("subtitle")}
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-16 h-16 bg-yellow-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-yellow-400/40">
                  <svg className="w-8 h-8 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
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
