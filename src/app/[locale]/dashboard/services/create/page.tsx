"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeContext"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useRouter } from "next/navigation"
import { useToaster } from "@/components/ui/ToasterProvider"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"
import RichTextEditor from "@/components/ui/RichTextEditor"
import { sanitizeHtmlContent } from "@/lib/utils/html-sanitizer"
import ServiceImageUpload from "@/components/service/ServiceImageUpload"
import SelectableCard from "@/components/ui/SelectableCard"

interface Category {
  category_id: number
  category_name: string
}

interface ServiceQuestion {
  question_text: string
  question_type: string
  max_length?: number
  is_required: boolean
  options?: string[]
}

interface ServiceRequirement {
  title: string
  requirements_text: string
}

interface ServiceItem {
  item_name: string
  item_description: string
  price_base: number
  price_type: string
  price_unit?: string
}

interface ServiceExtra {
  extra_name: string
  extra_description: string
  price_base: number
  price_type: string
  price_unit?: string
}

interface ServiceEvent {
  event_name: string
  event_description: string
  event_type: string
  duration_minutes: number
  buffer_minutes: number
  is_required: boolean
  display_order: number
  is_active: boolean
  availability: {
    monday: { start: string; end: string; enabled: boolean }
    tuesday: { start: string; end: string; enabled: boolean }
    wednesday: { start: string; end: string; enabled: boolean }
    thursday: { start: string; end: string; enabled: boolean }
    friday: { start: string; end: string; enabled: boolean }
    saturday: { start: string; end: string; enabled: boolean }
    sunday: { start: string; end: string; enabled: boolean }
  }
}

export default function CreateServicePage() {
  const t = useTranslations("services")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { currentBusiness, userPlan, planLimits, usage, refreshUsageForFeature, loading: contextLoading } = useBusiness()
  const { showToast } = useToaster()
  const { theme } = useTheme()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // Service basic info
  const [serviceName, setServiceName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<number | "new" | null>(null)
  const [newCategoryTitle, setNewCategoryTitle] = useState("")
  const [priceBase, setPriceBase] = useState<number | null>(null)
  const [priceType, setPriceType] = useState("fixed")
  const [priceUnit, setPriceUnit] = useState("")
  const [hasItems, setHasItems] = useState(false)
  const [availableBooking, setAvailableBooking] = useState(false)
  const [requireConsentNewsletter, setRequireConsentNewsletter] = useState(false)
  const [requirePhoneNumber, setRequirePhoneNumber] = useState(false)
  const [newsletterConsentText, setNewsletterConsentText] = useState("")
  const [phoneNumberText, setPhoneNumberText] = useState("")
  const [availableQuotation, setAvailableQuotation] = useState(false)

  // Dynamic sections
  const [questions, setQuestions] = useState<ServiceQuestion[]>([])
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([])
  const [items, setItems] = useState<ServiceItem[]>([])
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [events, setEvents] = useState<ServiceEvent[]>([])

  // Image upload
  const [serviceImage, setServiceImage] = useState<File | null>(null)

  // Fetch categories
  useEffect(() => {
    if (currentBusiness) {
      fetchCategories()
    }
  }, [currentBusiness])

  // Automatically add first item when hasItems is checked
  useEffect(() => {
    if (hasItems && items.length === 0) {
      setItems([
        {
          item_name: "",
          item_description: "",
          price_base: 0,
          price_type: "fixed",
          price_unit: "",
        },
      ])
    }
  }, [hasItems])

  // Clear items when quotation is disabled, or add first item when enabled
  useEffect(() => {
    if (!availableQuotation) {
      setItems([])
    } else if (availableQuotation && items.length === 0) {
      setItems([
        {
          item_name: "",
          item_description: "",
          price_base: 0,
          price_type: "fixed",
          price_unit: "",
        },
      ])
    }
  }, [availableQuotation])

  // Automatically add first event when availableBooking is checked, or clear events when disabled
  useEffect(() => {
    if (availableBooking && events.length === 0) {
      setEvents([
        {
          event_name: "",
          event_description: "",
          event_type: "appointment",
          duration_minutes: 60,
          buffer_minutes: 0,
          is_required: true,
          display_order: 0,
          is_active: true,
          availability: {
            monday: { start: "09:00", end: "17:00", enabled: true },
            tuesday: { start: "09:00", end: "17:00", enabled: true },
            wednesday: { start: "09:00", end: "17:00", enabled: true },
            thursday: { start: "09:00", end: "17:00", enabled: true },
            friday: { start: "09:00", end: "17:00", enabled: true },
            saturday: { start: "09:00", end: "17:00", enabled: false },
            sunday: { start: "09:00", end: "17:00", enabled: false },
          },
        },
      ])
    } else if (!availableBooking) {
      setEvents([])
    }
  }, [availableBooking])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "open",
        is_required: false,
        options: [],
      },
    ])
  }

  const updateQuestion = (index: number, field: keyof ServiceQuestion, value: any) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    
    // If question type is changed to checkbox, automatically add two options
    if (field === "question_type" && (value === "checkbox_single" || value === "checkbox_multi")) {
      if (!updated[index].options || updated[index].options!.length === 0) {
        updated[index].options = ["", ""]
      }
    }
    
    setQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addQuestionOption = (questionIndex: number) => {
    const updated = [...questions]
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = []
    }
    updated[questionIndex].options!.push("")
    setQuestions(updated)
  }

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options![optionIndex] = value
    setQuestions(updated)
  }

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex)
    setQuestions(updated)
  }

  const addRequirement = () => {
    setRequirements([
      ...requirements,
      {
        title: "",
        requirements_text: "",
      },
    ])
  }

  const updateRequirement = (index: number, field: keyof ServiceRequirement, value: string) => {
    const updated = [...requirements]
    updated[index] = { ...updated[index], [field]: value }
    setRequirements(updated)
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: "",
        item_description: "",
        price_base: 0,
        price_type: "fixed",
        price_unit: "",
      },
    ])
  }

  const updateItem = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addExtra = () => {
    setExtras([
      ...extras,
      {
        extra_name: "",
        extra_description: "",
        price_base: 0,
        price_type: "fixed",
        price_unit: "",
      },
    ])
  }

  const updateExtra = (index: number, field: keyof ServiceExtra, value: any) => {
    const updated = [...extras]
    updated[index] = { ...updated[index], [field]: value }
    setExtras(updated)
  }

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index))
  }

  const addEvent = () => {
    setEvents([
      ...events,
      {
        event_name: "",
        event_description: "",
        event_type: "appointment",
        duration_minutes: 60,
        buffer_minutes: 0,
        is_required: true,
        display_order: events.length,
        is_active: true,
        availability: {
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { start: "09:00", end: "17:00", enabled: false },
          sunday: { start: "09:00", end: "17:00", enabled: false },
        },
      },
    ])
  }

  const updateEvent = (index: number, field: keyof ServiceEvent, value: any) => {
    const updated = [...events]
    updated[index] = { ...updated[index], [field]: value }
    setEvents(updated)
  }

  const updateEventAvailability = (eventIndex: number, day: string, field: 'start' | 'end' | 'enabled', value: string | boolean) => {
    const updated = [...events]
    const event = updated[eventIndex]
    if (day === 'monday') {
      event.availability.monday = { ...event.availability.monday, [field]: value }
    } else if (day === 'tuesday') {
      event.availability.tuesday = { ...event.availability.tuesday, [field]: value }
    } else if (day === 'wednesday') {
      event.availability.wednesday = { ...event.availability.wednesday, [field]: value }
    } else if (day === 'thursday') {
      event.availability.thursday = { ...event.availability.thursday, [field]: value }
    } else if (day === 'friday') {
      event.availability.friday = { ...event.availability.friday, [field]: value }
    } else if (day === 'saturday') {
      event.availability.saturday = { ...event.availability.saturday, [field]: value }
    } else if (day === 'sunday') {
      event.availability.sunday = { ...event.availability.sunday, [field]: value }
    }
    setEvents(updated)
  }

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!serviceName.trim()) {
      showToast({
        type: "error",
        title: t("error"),
        message: t("serviceNameRequired"),
        duration: 4000
      })
      return
    }

    // Block creation if limit reached
    if (serviceLimitReached) {
      showToast({
        type: "error",
        title: t("error"),
        message: t("maxServicesReached"),
        duration: 4000
      })
      return
    }

    setLoading(true)

    try {
             const serviceData = {
         service_name: serviceName,
         description: description ? sanitizeHtmlContent(description) : null,
                   category_id: categoryId,
          new_category_title: newCategoryTitle,
          price_base: priceBase,
         price_type: priceType,
         price_unit: priceUnit,
         has_items: hasItems,
         available_booking: availableBooking,
                   require_consent_newsletter: requireConsentNewsletter,
          require_phone_number: requirePhoneNumber,
          newsletter_consent_text: newsletterConsentText,
          phone_number_text: phoneNumberText,
          available_quotation: availableQuotation,
         questions: questions.filter((q) => q.question_text.trim()),
         requirements: requirements.filter((r) => r.requirements_text.trim()),
         items: items.filter((i) => i.item_name.trim()),
          extras: extras.filter((e) => e.extra_name.trim()),
         events: events.filter((e) => e.event_name.trim()),
       }

      const response = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      const responseData = await response.json()

      if (response.ok) {
        const newService = responseData

        // Upload image if provided
        if (serviceImage && newService.service_id) {
          const formData = new FormData()
          formData.append("image", serviceImage)

          const imageResponse = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/${newService.service_id}/upload-image`, {
            method: "POST",
            body: formData,
          })

          if (!imageResponse.ok) {
            console.error("Failed to upload service image")
            // Don't fail the entire creation, just log the error
          }
        }

        showToast({
          type: "success",
          title: t("success"),
          message: t("serviceCreatedSuccessfully"),
          duration: 3000
        })
        // Refresh usage data after successful creation
        await refreshUsageForFeature("services")
        router.push("/dashboard/services")
      } else {
        showToast({
          type: "error",
          title: t("error"),
          message: responseData.message || responseData.error || t("createError"),
          duration: 5000
        })
      }
    } catch (error) {
      console.error("Error creating service:", error)
      showToast({
        type: "error",
        title: t("error"),
        message: t("createError"),
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentBusiness) return null

  // Find the plan limit for services
  const planLimitServices = planLimits?.find(l => l.feature === 'services' && l.limit_type === 'count' && l.scope === 'global')
  const currentUsage = usage?.services ?? 0
  const serviceLimitReached = planLimitServices ? !canCreateMore(currentUsage, planLimitServices) : false

  // Show loading state while context is loading
  if (contextLoading) {
    return (
      <DashboardLayout>
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className={`text-2xl lg:text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("createService")}</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={`${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>{tCommon("loading")}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show limit reached message instead of form
  if (serviceLimitReached) {
    return (
      <DashboardLayout>
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className={`text-2xl lg:text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("createService")}</h1>
          </div>
          
          <div className={`${
            theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
          } border rounded-lg p-8 text-center min`}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">{t("maxServicesReached")}</h3>
            <p className="text-red-700 mb-6">
              {formatUsageDisplay(currentUsage, planLimitServices || { value: 0 })}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push("/dashboard/services")}
                className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => router.push("/dashboard/plan")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("upgradePlan")}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto">
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl lg:text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{t("createService")}</h1>
            {planLimitServices && (
              <div className="ml-4 min-w-[220px]">
                <UsageLimitBar
                  current={currentUsage}
                  max={planLimitServices.value}
                  label={formatUsageDisplay(currentUsage, planLimitServices)}
                  showUpgrade={true}
                  onUpgrade={() => router.push("/dashboard/plan")}
                  upgradeText={t("upgradePlan")}
                  unlimitedText={t("unlimited")}
                />
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="">
          {/* Basic Information */}
          <div className="pb-4 lg:pb-6 border-b border-gray-200 dark:border-gray-700">
          
            <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-6 space-y-4">
              {/* Left Column - Image */}
              <div className="lg:col-span-1 h-full">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>{t("serviceImage")}</label>
                <ServiceImageUpload
                  onImageChange={setServiceImage}
                  currentImage={serviceImage}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />
              </div>

              {/* Right Column - Service Details */}
              <div className="lg:col-span-2 space-y-2">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{t("serviceName")} *</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className={`w-full text-lg px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    required
                  />
                </div>

                                 <div>
                   <label className={`block text-sm font-medium mb-2 ${
                     theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                   }`}>{t("category")}</label>
                   <select
                     value={categoryId || ""}
                     onChange={(e) => setCategoryId(e.target.value ? (e.target.value === "new" ? "new" : Number.parseInt(e.target.value)) : null)}
                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                       theme === 'dark' 
                         ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                         : 'border-gray-300 bg-white text-gray-900'
                     }`}
                   >
                     <option value="">{t("selectCategory")}</option>
                     {categories.map((category) => (
                       <option key={category.category_id} value={category.category_id}>
                         {category.category_name}
                       </option>
                     ))}
                     <option value="new">➕ New Category</option>
                   </select>
                 </div>
                 
                 {/* Conditional New Category Title Field */}
                 {categoryId === "new" && (
                   <div>
                     <label className={`block text-sm font-medium mb-2 ${
                       theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                     }`}>New Category Title</label>
                     <input
                       type="text"
                       value={newCategoryTitle}
                       onChange={(e) => setNewCategoryTitle(e.target.value)}
                       placeholder="Enter new category name..."
                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                         theme === 'dark' 
                           ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                           : 'border-gray-300 bg-white text-gray-900'
                       }`}
                     />
                   </div>
                 )}

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{t("description")}</label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder={t("description")}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{t("basePrice")} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceBase || ""}
                    onChange={(e) => setPriceBase(e.target.value ? Number.parseFloat(e.target.value) : null)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{t("priceType")}</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  >
                    <option value="fixed">{t("fixed")}</option>
                    <option value="per_unit">{t("perUnit")}</option>
                    <option value="per_hour">{t("perHour")}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>{t("priceUnit")}</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    disabled={priceType === "fixed"}
                  />
                </div>
              </div>
            </div>

            </div>

                               {/* Start Service Additional / Optional Sections */}
                <div className="mt-12 lg:mt-16 space-y-8">

                                    {/* Service Extras Section */}
                   <div className="mb-8">
                       <div className="flex justify-between items-center mb-6">
                         <h2 className={`text-xl font-bold ${
                           theme === 'dark' ? 'text-gray-100' : 
                           'text-gray-900'
                       }`}>Service Extras</h2>
                        <button
                          type="button"
                        onClick={addExtra}
                          className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                        >
                        Add Extra
                        </button>
                      </div>

                                       {extras.map((extra, index) => (
                         <div key={index} className="mb-4">
                                                                                                                                               <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
                          {/* Circular number icon - minimal width */}
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              theme === 'dark' 
                                ? 'bg-gray-700 text-gray-200' 
                                : 'bg-gray-600 text-white'
                            }`}>
                              {index + 1}
                            </div>
                          </div>

                          {/* Name - flexible width */}
                          <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>Extra Name</label>
                                <input
                                  type="text"
                              value={extra.extra_name}
                              onChange={(e) => updateExtra(index, "extra_name", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'dark' 
                                      ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                  }`}
                                />
                              </div>

                          {/* Description - flexible width */}
                          <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>Extra Description</label>
                            <input
                              type="text"
                              value={extra.extra_description}
                              onChange={(e) => updateExtra(index, "extra_description", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'dark' 
                                      ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                  }`}
                                />
                            </div>

                          {/* Price - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                  <label className={`block text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>{t("price")}</label>
                                  <input
                                    type="number"
                                    step="0.01"
                              value={extra.price_base}
                              onChange={(e) => updateExtra(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                  />
                                </div>

                          {/* Price Type - fixed width */}
                                <div className="w-28 flex-shrink-0">
                                  <label className={`block text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>{t("priceType")}</label>
                                  <select
                              value={extra.price_type}
                              onChange={(e) => updateExtra(index, "price_type", e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                  >
                                    <option value="fixed">{t("fixed")}</option>
                                    <option value="percentage">{t("percentage")}</option>
                                  </select>
                              </div>

                          {/* Red cross button - minimal width */}
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeExtra(index)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    theme === 'dark' 
                                  ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white' 
                                  : 'bg-gray-400 text-gray-600 hover:bg-red-500 hover:text-white'
                                  }`}
                            >
                              ×
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               {/* Quotation Section with Conditional Content */}
                                            <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-10 mb-10`}>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-xl font-bold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>Quotation</h2>
                       <button
                         type="button"
                           onClick={() => setAvailableQuotation(!availableQuotation)}
                           className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                             availableQuotation
                               ? 'bg-blue-600 text-white hover:bg-blue-700'
                               : 'bg-zinc-500 text-white hover:bg-zinc-700'
                           }`}
                         >
                           Configura Preventivo Online
                         </button>
                       </div>
                   
                                                                             {/* Items for Quotation Section - Only show when quotation is active and items exist */}
                                         {availableQuotation && items.length > 0 && (
                       <div className="mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                           }`}>Items for Quotation</h2>
                          <button
                            type="button"
                            onClick={addItem}
                         className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                       >
                             Add Item
                       </button>
                     </div>

                                                 {items.map((item, index) => (
                        <div key={index} className="mb-4">
                                                                                                                                                                                                                               <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
                              {/* Circular number icon - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  theme === 'dark' 
                                    ? 'bg-gray-700 text-gray-200' 
                                    : 'bg-gray-600 text-white'
                                }`}>
                                  {index + 1}
                                </div>
                         </div>

                              {/* Name - flexible width */}
                              <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{t("itemName")}</label>
                             <input
                               type="text"
                                  value={item.item_name}
                                  onChange={(e) => updateItem(index, "item_name", e.target.value)}
                               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                 theme === 'dark' 
                                   ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                   : 'border-gray-300 bg-white text-gray-900'
                               }`}
                             />
                           </div>

                              {/* Description - flexible width */}
                              <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                               theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{t("itemDescription")}</label>
                                <input
                                  type="text"
                                  value={item.item_description}
                                  onChange={(e) => updateItem(index, "item_description", e.target.value)}
                               className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                 theme === 'dark' 
                                   ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                   : 'border-gray-300 bg-white text-gray-900'
                               }`}
                             />
                           </div>

                              {/* Price - fixed width */}
                             <div className="w-24 flex-shrink-0">
                                <label className={`block text-xs font-medium mb-1 ${
                                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                               }`}>{t("price")}</label>
                               <input
                                 type="number"
                                 step="0.01"
                                  value={item.price_base}
                                  onChange={(e) => updateItem(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                   theme === 'dark' 
                                     ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                     : 'border-gray-300 bg-white text-gray-900'
                                 }`}
                               />
                             </div>

                              {/* Price Type - fixed width */}
                             <div className="w-28 flex-shrink-0">
                                <label className={`block text-xs font-medium mb-1 ${
                                 theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                               }`}>{t("priceType")}</label>
                               <select
                                  value={item.price_type}
                                  onChange={(e) => updateItem(index, "price_type", e.target.value)}
                                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                   theme === 'dark' 
                                     ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                     : 'border-gray-300 bg-white text-gray-900'
                                 }`}
                               >
                                 <option value="fixed">{t("fixed")}</option>
                                 <option value="percentage">{t("percentage")}</option>
                               </select>
                             </div>

                              {/* Red cross button - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                   theme === 'dark' 
                                      ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white' 
                                      : 'bg-gray-400 text-gray-600 hover:bg-red-500 hover:text-white'
                                 }`}
                                >
                                  ×
                                </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                    )}


                                 </div>

                                                                       {/* Booking Section with Conditional Content */}
                                          <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-10 mb-10`}>
                       <div className="flex justify-between items-center mb-6">
                         <h2 className={`text-xl font-bold ${
                           theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                         }`}>Booking</h2>
                        <button
                          type="button"
                          onClick={() => setAvailableBooking(!availableBooking)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            availableBooking
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-zinc-500 text-white hover:bg-zinc-700'
                          }`}
                        >
                          Configura Prenotazione
                        </button>
                      </div>
                  
                                     {/* Events Section - Only show when booking is active and events exist */}
                   {availableBooking && events.length > 0 && (
                     <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>{t("events")}</h2>
                        <button
                          type="button"
                          onClick={addEvent}
                          className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                        >
                          {t("addEvent")}
                        </button>
                      </div>

                                             {events.map((event, index) => (
                         <div key={index} className="mb-4">
                                                                                                           <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
                              {/* Circular number icon - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  theme === 'dark' 
                                    ? 'bg-gray-700 text-gray-200' 
                                    : 'bg-gray-600 text-white'
                                }`}>
                                  {index + 1}
                                </div>
                          </div>

                              {/* Name - flexible width */}
                              <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{t("eventName")}</label>
                                <input
                                  type="text"
                                  value={event.event_name}
                                  onChange={(e) => updateEvent(index, "event_name", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'dark' 
                                      ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                  }`}
                                />
                              </div>

                              {/* Description - flexible width */}
                              <div className="flex-1">
                                <label className={`block text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>{t("eventDescription")}</label>
                                <input
                                  type="text"
                                  value={event.event_description}
                                  onChange={(e) => updateEvent(index, "event_description", e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    theme === 'dark' 
                                      ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                      : 'border-gray-300 bg-white text-gray-900'
                                  }`}
                                />
                              </div>

                              {/* Duration - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                <label className={`block text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>{t("duration")} ({t("minutes")})</label>
                                  <input
                                    type="number"
                                    value={event.duration_minutes}
                                    onChange={(e) => updateEvent(index, "duration_minutes", Number.parseInt(e.target.value) || 60)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                  />
                                </div>

                              {/* Buffer Time - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                <label className={`block text-xs font-medium mb-1 ${
                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                  }`}>{t("bufferTime")} ({t("minutes")})</label>
                                  <input
                                    type="number"
                                    value={event.buffer_minutes}
                                    onChange={(e) => updateEvent(index, "buffer_minutes", Number.parseInt(e.target.value) || 0)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                  />
                              </div>

                              {/* Red cross button - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeEvent(index)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                    theme === 'dark' 
                                      ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white' 
                                      : 'bg-gray-400 text-gray-600 hover:bg-red-500 hover:text-white'
                                  }`}
                                >
                                  ×
                                </button>
                            </div>
                          </div>

                                                     {/* Availability Section */}
                           <div className="mt-6">
                             <h4 className={`text-sm font-semibold mb-3 ${
                               theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                             }`}>Availability</h4>
                                                           <div className="space-y-2">
                               {[
                                 { key: 'monday', label: 'Monday' },
                                 { key: 'tuesday', label: 'Tuesday' },
                                 { key: 'wednesday', label: 'Wednesday' },
                                 { key: 'thursday', label: 'Thursday' },
                                 { key: 'friday', label: 'Friday' },
                                 { key: 'saturday', label: 'Saturday' },
                                 { key: 'sunday', label: 'Sunday' }
                               ].map((day) => (
                                                                   <div key={day.key} className={`p-2 rounded border ${
                                    theme === 'dark' 
                                      ? 'border-gray-600 bg-zinc-800' 
                                      : 'border-gray-200 bg-gray-50'
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-sm font-medium w-20 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                      }`}>{day.label}</span>
                                      
                                      {/* Toggle Switch */}
                                      <button
                                        type="button"
                                        onClick={() => updateEventAvailability(index, day.key, 'enabled', !event.availability[day.key as keyof typeof event.availability].enabled)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                          event.availability[day.key as keyof typeof event.availability].enabled
                                            ? 'bg-blue-600'
                                            : 'bg-gray-300'
                                        }`}
                                      >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                          event.availability[day.key as keyof typeof event.availability].enabled
                                            ? 'translate-x-5'
                                            : 'translate-x-1'
                                        }`} />
                                      </button>
                                      
                                      {/* Time Fields */}
                                      <div className="flex items-center gap-2 ml-auto">
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded border ${
                                          theme === 'dark' 
                                            ? 'border-gray-500 bg-zinc-700' 
                                            : 'border-gray-300 bg-white'
                                        }`}>
                                          <label className={`text-xs text-gray-500`}>Start</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].start}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'start', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-16 px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none ${
                                              theme === 'dark' 
                                                ? 'text-gray-100' 
                                                : 'text-gray-900'
                                            } ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
                                          />
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded border ${
                                          theme === 'dark' 
                                            ? 'border-gray-500 bg-zinc-700' 
                                            : 'border-gray-300 bg-white'
                                        }`}>
                                          <label className={`text-xs text-gray-500`}>End</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].end}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'end', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-16 px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none ${
                                              theme === 'dark' 
                                                ? 'text-gray-100' 
                                                : 'text-gray-900'
                                            } ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                               ))}
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          





                                                                                       {/* Requirements Section */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-10 mb-10`}>
             <div className="flex justify-between items-center mb-6">
               <h2 className={`text-xl font-bold ${
                 theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
               }`}>{t("requirements")}</h2>
              <button
                type="button"
                onClick={addRequirement}
                className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
              >
                {t("addRequirement")}
              </button>
            </div>

                         {requirements.map((requirement, index) => (
               <div key={index} className="mb-4">
                <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
                  {/* Circular number icon - minimal width */}
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                </div>

                  {/* Title - fixed width */}
                  <div className="w-48 flex-shrink-0">
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{t("requirementTitle")}</label>
                    <input
                      type="text"
                      value={requirement.title}
                      onChange={(e) => updateRequirement(index, "title", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Description - flexible width */}
                  <div className="flex-1">
                    <label className={`block text-xs font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>{t("requirementText")}</label>
                    <input
                      type="text"
                      value={requirement.requirements_text}
                      onChange={(e) => updateRequirement(index, "requirements_text", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>

                  {/* Red cross button - minimal width */}
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        theme === 'dark' 
                          ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white' 
                          : 'bg-gray-400 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

                                                                                       {/* Questions Section */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-10 mb-10`}>
             <div className="flex justify-between items-center mb-6">
               <h2 className={`text-xl font-bold ${
                 theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
               }`}>{t("questions")}</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
              >
                {t("addQuestion")}
              </button>
            </div>

                             {questions.map((question, index) => (
                 <div key={index} className="mb-4">
                  <div className="space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
                    {/* Circular number icon - minimal width */}
                    <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-gray-200' 
                          : 'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                  </div>

                                         {/* Question Type - dropdown */}
                     <div className="w-48 flex-shrink-0">
                     <label className={`block text-xs font-medium mb-1 ${
                       theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                     }`}>{t("questionType")}</label>
                     <select
                       value={question.question_type}
                       onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                         theme === 'dark' 
                           ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                           : 'border-gray-300 bg-white text-gray-900'
                       }`}
                     >
                       <option value="open">📝 {t("openText")}</option>
                       <option value="checkbox_single">☑️ {t("singleCheckbox")}</option>
                       <option value="checkbox_multi">☑️☑️ {t("multipleChoice")}</option>
                     </select>
                     </div>

                                         {/* Question Text - flexible width */}
                     <div className="flex-1">
                       <label className={`block text-xs font-medium mb-1 ${
                         theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                       }`}>{t("questionText")}</label>
                       <input
                         type="text"
                         value={question.question_text}
                         onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                           theme === 'dark' 
                             ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                             : 'border-gray-300 bg-white text-gray-900'
                         }`}
                       />
                     </div>

                     {/* Max Length - fixed width (only for open questions) */}
                     {question.question_type === "open" && (
                       <div className="w-32 flex-shrink-0">
                         <label className={`block text-xs font-medium mb-1 ${
                           theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                         }`}>{t("maxLength")}</label>
                         <input
                           type="number"
                           value={question.max_length || ""}
                           onChange={(e) =>
                             updateQuestion(
                               index,
                               "max_length",
                               e.target.value ? Number.parseInt(e.target.value) : undefined,
                             )
                           }
                           placeholder="500"
                           className={`w-full px-3 py-2 border rounded-lg text-sm ${
                             theme === 'dark' 
                               ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                               : 'border-gray-300 bg-white text-gray-900'
                           }`}
                         />
                       </div>
                     )}

                     {/* Required checkbox - fixed width */}
                     <div className="w-20 flex-shrink-0 flex items-end">
                       <label className="flex items-center">
                         <input
                           type="checkbox"
                           checked={question.is_required}
                           onChange={(e) => updateQuestion(index, "is_required", e.target.checked)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                         <span className={`ml-2 text-xs ${
                           theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                         }`}>{t("required")}</span>
                       </label>
                     </div>

                    {/* Red cross button - minimal width */}
                    <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          theme === 'dark' 
                            ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white' 
                            : 'bg-gray-400 text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                                     {/* Conditional fields based on question type */}
                   {(question.question_type === "checkbox_single" || question.question_type === "checkbox_multi") && (
                     <div className="mt-4">
                       <div className="flex justify-between items-center mb-2">
                         <label className={`block text-sm font-medium ${
                           theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                         }`}>{t("options")}</label>
                         <button
                           type="button"
                           onClick={() => addQuestionOption(index)}
                           className={`text-sm px-2 py-1 rounded ${
                             theme === 'dark' 
                               ? 'text-blue-400 hover:text-blue-300 hover:bg-zinc-700' 
                               : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                           }`}
                         >
                           {t("addOption")}
                         </button>
                       </div>
                       {question.options?.map((option, optionIndex) => (
                         <div key={optionIndex} className="flex gap-2 mb-2">
                           <input
                             type="text"
                             value={option}
                             onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                             placeholder={`${t("option")} ${optionIndex + 1}`}
                             className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                               theme === 'dark' 
                                 ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                 : 'border-gray-300 bg-white text-gray-900'
                             }`}
                           />
                           <button
                             type="button"
                             onClick={() => removeQuestionOption(index, optionIndex)}
                             className={`px-3 py-2 rounded-lg ${
                               theme === 'dark' 
                                 ? 'text-red-400 hover:text-red-300 hover:bg-zinc-700' 
                                 : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                             }`}
                           >
                             ×
                           </button>
                         </div>
                       ))}
                       {(!question.options || question.options.length === 0) && (
                         <p className={`text-sm italic ${
                           theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                         }`}>
                           {t("addOptionsToContinue")}
                         </p>
                       )}
                     </div>
                   )}
                </div>
              ))}
            </div>

                                 {/* Additional Options Section */}
            <div className="mt-8 pb-4 lg:pb-6">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Additional Options</label>
                
                <div className="space-y-4">
                  {/* Newsletter Consent Card */}
                  <SelectableCard
                    title={t("requireConsentNewsletter")}
                    description={t("requireConsentNewsletterDescription")}
                    selected={requireConsentNewsletter}
                    onSelect={setRequireConsentNewsletter}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                  
                  {/* Conditional Newsletter Consent Text */}
                  {requireConsentNewsletter && (
                    <div className="ml-6">
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Newsletter Consent Text</label>
                      <input
                        type="text"
                        value={newsletterConsentText}
                        onChange={(e) => setNewsletterConsentText(e.target.value)}
                        placeholder="I agree to receive newsletter updates..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                  )}
                  
                  {/* Phone Number Card */}
                  <SelectableCard
                    title="Require Phone Number"
                    description="Require customers to provide their phone number when booking or requesting a quotation"
                    selected={requirePhoneNumber}
                    onSelect={setRequirePhoneNumber}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                  
                  {/* Conditional Phone Number Text */}
                  {requirePhoneNumber && (
                    <div className="ml-6">
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Phone Number Field Text</label>
                      <input
                        type="text"
                        value={phoneNumberText}
                        onChange={(e) => setPhoneNumberText(e.target.value)}
                        placeholder="Please provide your phone number..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

           {/* Submit Button */}
           <div className="mt-8 flex justify-end gap-2 lg:gap-4">
             <button
               type="button"
               onClick={() => router.back()}
               className={`px-6 py-2 border rounded-lg transition-colors ${
                 theme === 'dark' 
                   ? 'border-gray-600 text-gray-300 hover:bg-zinc-700' 
                   : 'border-gray-300 text-gray-700 hover:bg-zinc-50'
               }`}
             >
               {t("cancel")}
             </button>
             <button
               type="submit"
               disabled={loading}
               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
             >
               {loading ? t("creating") : t("createService")}
             </button>
           </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
