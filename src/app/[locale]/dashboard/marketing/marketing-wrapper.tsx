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
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">Marketing</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
          {/* Header with AI accent gradient layers */}
          {!isGenerating && (
          <div className="mb-6 relative overflow-visible">
            {/* Accent Color Layers */}
            <div
              className="absolute z-0"
              style={{
                background: 'var(--ai-panel-accent-1)',
                filter: 'blur(40px)',
                opacity: 0.2,
                height: '140px',
                width: '140px',
                top: '-20px',
                left: 'calc(50% - 164px)',
                borderRadius: '24px'
              }}
            ></div>
            <div
              className="absolute z-0"
              style={{
                background: 'var(--ai-panel-accent-2)',
                filter: 'blur(40px)',
                opacity: 0.2,
                height: '140px',
                width: '140px',
                top: '-20px',
                left: 'calc(50% + 24px)',
                borderRadius: '24px'
              }}
            ></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <AIAssistantIcon size="md" className="mb-4" />
              <h1 className="text-2xl lg:text-3xl font-medium text-[var(--dashboard-text-primary)] mb-2">
                {t("title")}
              </h1>
            </div>
          </div>
          )}

        <SocialMediaContentGenerator
          business={business}
          services={services}
          locale={locale}
          onGeneratingChange={setIsGenerating}
        />
        </div>
      </div>
    </DashboardLayout>
  )
}