"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import { useTheme } from "@/contexts/ThemeProvider"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useRouter } from "next/navigation"
import { useToaster } from "@/components/ui/ToasterProvider"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
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
  is_required: boolean
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
  const { currentBusiness, planLimits, usage, refreshUsageForFeature, loading: contextLoading } = useBusiness()
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
  const [availableBooking, setAvailableBooking] = useState(false)
  const [requireConsentNewsletter, setRequireConsentNewsletter] = useState(false)
  const [requireConsentNewsletterText, setRequireConsentNewsletterText] = useState("")
  const [requirePhone, setRequirePhone] = useState(false)
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
    if (availableQuotation && items.length === 0) {
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

  // Clear items when hasItems is disabled, or add first item when enabled
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
        is_required: false,
      },
    ])
  }

  const updateRequirement = (index: number, field: keyof ServiceRequirement, value: string | boolean) => {
    const updated = [...requirements]
    updated[index] = { ...updated[index], [field]: value }
    setRequirements(updated)
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const addItem = () => {
    // Automatically enable quotation when first item is added
    if (items.length === 0) {
      setAvailableQuotation(true)
    }
    
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
    const updatedItems = items.filter((_, i) => i !== index)
    setItems(updatedItems)
    
    // Automatically disable quotation when all items are removed
    if (updatedItems.length === 0) {
      setAvailableQuotation(false)
    }
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
    // Automatically enable booking when first event is added
    if (events.length === 0) {
      setAvailableBooking(true)
    }
    
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
    const updatedEvents = events.filter((_, i) => i !== index)
    setEvents(updatedEvents)
    
    // Automatically disable booking when all events are removed
    if (updatedEvents.length === 0) {
      setAvailableBooking(false)
    }
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

    // Validate category selection
    if (categoryId === "new" && !newCategoryTitle.trim()) {
      showToast({
        type: "error",
        title: t("error"),
        message: "Please enter a category name",
        duration: 4000
      })
      return
    }

    // Validate items if quotation is enabled
    if (availableQuotation && items.length === 0) {
      showToast({
        type: "error",
        title: t("error"),
        message: "Please add at least one item for quotation",
        duration: 4000
      })
      return
    }

    // Validate events if booking is enabled
    if (availableBooking && events.length === 0) {
      showToast({
        type: "error",
        title: t("error"),
        message: "Please add at least one event for booking",
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
             // Determine flags based on form data
             const hasItems = items.filter((i) => i.item_name.trim()).length > 0
             const hasExtras = extras.filter((e) => e.extra_name.trim()).length > 0
             const hasEvents = events.filter((e) => e.event_name.trim()).length > 0

             const serviceData = {
         service_name: serviceName,
         description: description ? sanitizeHtmlContent(description) : null,
                   category_id: categoryId,
          new_category_title: newCategoryTitle,
          price_base: priceBase,
         price_type: priceType,
         price_unit: priceUnit,
         has_items: hasItems, // Set based on actual items added
         has_extras: hasExtras, // Set based on actual extras added
         active_booking: hasEvents, // Set based on actual events added
                   require_consent_newsletter: requireConsentNewsletter,
          require_consent_newsletter_text: requireConsentNewsletterText,
          require_phone: requirePhone,
          active_quotation: availableQuotation,
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

        // Upload image if provided and update has_image flag
        if (serviceImage && newService.service_id) {
          const formData = new FormData()
          formData.append("image", serviceImage)

          const imageResponse = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/${newService.service_id}/upload-image`, {
            method: "POST",
            body: formData,
          })

          if (imageResponse.ok) {
            // Update the service to set has_image to true
            const updateResponse = await fetch(`/api/businesses/${currentBusiness?.business_id}/services/${newService.service_id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ has_image: true }),
            })

            if (!updateResponse.ok) {
              console.error("Failed to update service has_image flag")
            }
          } else {
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
        <div className="max-w-[1400px] mx-auto">
          {/* Top Navbar (simulated) */}
          <div className="sticky top-0 z-10 px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--dashboard-text-primary)]">{t("createService")}</h1>
              </div>
            </div>
          </div>

          {/* Content Wrapper with Background */}
          <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-[var(--dashboard-text-secondary)]">{tCommon("loading")}</p>
              </div>
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
        <div className="max-w-[1400px] mx-auto">
          {/* Top Navbar (simulated) */}
          <div className="sticky top-0 z-10 px-4 lg:px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-[var(--dashboard-text-primary)]">{t("createService")}</h1>
              </div>
            </div>
          </div>

          {/* Content Wrapper with Background */}
          <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-4 lg:p-6">
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-8 text-center min">
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
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navbar (simulated) */}
        <div className="sticky top-0 z-10 px-4 lg:px-6 py-4 lg:py-2 rounded-2xl mb-3 bg-[var(--dashboard-bg-primary)] border border-[var(--dashboard-border-primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-[var(--dashboard-text-primary)]">{t("createService")}</p>
            </div>
          </div>
        </div>

        {/* Content Wrapper with Background */}
        <div className="bg-[var(--dashboard-bg-primary)] rounded-2xl border border-[var(--dashboard-border-primary)] p-4 lg:p-8">
        <form onSubmit={handleSubmit} className="">
          {/* Basic Information */}
          <div className="pb-4 lg:pb-6 border-b border-[var(--dashboard-border-primary)]">
          
            <div className="grid grid-cols-1 lg:grid-cols-3 items-stretch gap-6 space-y-4">
              {/* Left Column - Image */}
              <div className="lg:col-span-1 h-full">
                <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("serviceImage")}</label>
                <ServiceImageUpload
                  onImageChange={setServiceImage}
                  currentImage={serviceImage}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  serviceTitle={serviceName}
                  businessId={currentBusiness?.business_id || ''}
                />
              </div>

              {/* Right Column - Service Details */}
              <div className="lg:col-span-2 space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("serviceName")} *</label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full text-lg px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    required
                  />
                </div>

                                 <div>
                   <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("category")}</label>
                   <select
                     value={categoryId || ""}
                     onChange={(e) => setCategoryId(e.target.value ? (e.target.value === "new" ? "new" : Number.parseInt(e.target.value)) : null)}
                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
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
                     <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">New Category Title</label>
                     <input
                       type="text"
                       value={newCategoryTitle}
                       onChange={(e) => setNewCategoryTitle(e.target.value)}
                       placeholder="Enter new category name..."
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                     />
                   </div>
                 )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("description")}</label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder={t("description")}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("basePrice")} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceBase || ""}
                    onChange={(e) => setPriceBase(e.target.value ? Number.parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("priceType")}</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                  >
                    <option value="fixed">{t("fixed")}</option>
                    <option value="per_unit">{t("perUnit")}</option>
                    <option value="per_hour">{t("perHour")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">{t("priceUnit")}</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
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
                         <h2 className="text-sm md:text-lg font-bold text-[var(--dashboard-text-primary)] uppercase">Service Extras</h2>
                        <button
                          type="button"
                        onClick={addExtra}
                          className="px-3 py-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] rounded-lg text-sm hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                        >
                        Add Extra
                        </button>
                      </div>

                                       {extras.map((extra, index) => (
                         <div key={index} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                           {/* Mobile Layout */}
                           <div className="lg:hidden space-y-4">
                             {/* Header with number and delete button */}
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                   {index + 1}
                                 </div>
                                 <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">Extra {index + 1}</span>
                               </div>
                               <button
                                 type="button"
                                 onClick={() => removeExtra(index)}
                                 className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                               >
                                 ×
                               </button>
                             </div>
                             
                             {/* Full width inputs on mobile */}
                             <div className="space-y-4">
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">Extra Name</label>
                                 <input
                                   type="text"
                                   value={extra.extra_name}
                                   onChange={(e) => updateExtra(index, "extra_name", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">Extra Description</label>
                                 <input
                                   type="text"
                                   value={extra.extra_description}
                                   onChange={(e) => updateExtra(index, "extra_description", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("price")}</label>
                                   <input
                                     type="number"
                                     step="0.01"
                                     value={extra.price_base}
                                     onChange={(e) => updateExtra(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   />
                                 </div>
                                 
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("priceType")}</label>
                                   <select
                                     value={extra.price_type}
                                     onChange={(e) => updateExtra(index, "price_type", e.target.value)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   >
                                     <option value="fixed">{t("fixed")}</option>
                                     <option value="percentage">{t("percentage")}</option>
                                   </select>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Desktop Layout */}
                           <div className="hidden lg:flex lg:gap-4 lg:items-center">
                          {/* Circular number icon - minimal width */}
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                              {index + 1}
                            </div>
                          </div>

                          {/* Name - flexible width */}
                          <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">Extra Name</label>
                                <input
                                  type="text"
                              value={extra.extra_name}
                              onChange={(e) => updateExtra(index, "extra_name", e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                />
                              </div>

                          {/* Description - flexible width */}
                          <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">Extra Description</label>
                            <input
                              type="text"
                              value={extra.extra_description}
                              onChange={(e) => updateExtra(index, "extra_description", e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                />
                            </div>

                          {/* Price - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                  <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("price")}</label>
                                  <input
                                    type="number"
                                    step="0.01"
                              value={extra.price_base}
                              onChange={(e) => updateExtra(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                  />
                                </div>

                          {/* Price Type - fixed width */}
                                <div className="w-28 flex-shrink-0">
                                  <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("priceType")}</label>
                                  <select
                              value={extra.price_type}
                              onChange={(e) => updateExtra(index, "price_type", e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
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
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                            >
                              ×
                            </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               {/* Quotation Section */}
                                            <div className="border-t-2 border-[var(--dashboard-border-primary)] pt-10 mb-10">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm md:text-lg font-bold text-[var(--dashboard-text-primary)] uppercase">Quotation</h2>
                       <button
                         type="button"
                         onClick={addItem}
                         className="px-3 py-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] rounded-lg text-sm hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                       >
                         Add Item
                         </button>
                       </div>
                   
                                                 {items.map((item, index) => (
                        <div key={index} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                           {/* Mobile Layout */}
                           <div className="lg:hidden space-y-4">
                             {/* Header with number and delete button */}
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                   {index + 1}
                                 </div>
                                 <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">Item {index + 1}</span>
                               </div>
                          <button
                            type="button"
                                 onClick={() => removeItem(index)}
                                 className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                       >
                                 ×
                       </button>
                     </div>

                             {/* Full width inputs on mobile */}
                             <div className="space-y-4">
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("itemName")}</label>
                                 <input
                                   type="text"
                                   value={item.item_name}
                                   onChange={(e) => updateItem(index, "item_name", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("itemDescription")}</label>
                                 <input
                                   type="text"
                                   value={item.item_description}
                                   onChange={(e) => updateItem(index, "item_description", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("price")}</label>
                                   <input
                                     type="number"
                                     step="0.01"
                                     value={item.price_base}
                                     onChange={(e) => updateItem(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   />
                                 </div>
                                 
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("priceType")}</label>
                                   <select
                                     value={item.price_type}
                                     onChange={(e) => updateItem(index, "price_type", e.target.value)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   >
                                     <option value="fixed">{t("fixed")}</option>
                                     <option value="percentage">{t("percentage")}</option>
                                   </select>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Desktop Layout */}
                           <div className="hidden lg:flex lg:gap-4 lg:items-center">
                              {/* Circular number icon - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                  {index + 1}
                                </div>
                         </div>

                              {/* Name - flexible width */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("itemName")}</label>
                             <input
                               type="text"
                                  value={item.item_name}
                                  onChange={(e) => updateItem(index, "item_name", e.target.value)}
                               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                             />
                           </div>

                              {/* Description - flexible width */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("itemDescription")}</label>
                                <input
                                  type="text"
                                  value={item.item_description}
                                  onChange={(e) => updateItem(index, "item_description", e.target.value)}
                               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                             />
                           </div>

                              {/* Price - fixed width */}
                             <div className="w-24 flex-shrink-0">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("price")}</label>
                               <input
                                 type="number"
                                 step="0.01"
                                  value={item.price_base}
                                  onChange={(e) => updateItem(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                               className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                               />
                             </div>

                              {/* Price Type - fixed width */}
                             <div className="w-28 flex-shrink-0">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("priceType")}</label>
                               <select
                                  value={item.price_type}
                                  onChange={(e) => updateItem(index, "price_type", e.target.value)}
                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
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
                                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                                >
                                  ×
                                </button>
                           </div>
                         </div>
                       </div>
                     ))}

                                 </div>

                                                                       {/* Booking Section */}
                                          <div className="border-t-2 border-[var(--dashboard-border-primary)] pt-10 mb-10">
                       <div className="flex justify-between items-center mb-6">
                         <h2 className="text-sm md:text-lg font-bold text-[var(--dashboard-text-primary)] uppercase">Booking</h2>
                        <button
                          type="button"
                          onClick={addEvent}
                          className="px-3 py-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] rounded-lg text-sm hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                        >
                          {t("addEvent")}
                        </button>
                      </div>
                  
                                             {events.map((event, index) => (
                         <div key={index} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                           {/* Mobile Layout */}
                           <div className="lg:hidden space-y-4">
                             {/* Header with number and delete button */}
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                   {index + 1}
                                 </div>
                                 <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">Event {index + 1}</span>
                               </div>
                        <button
                          type="button"
                                 onClick={() => removeEvent(index)}
                                 className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                        >
                                 ×
                        </button>
                      </div>

                             {/* Full width inputs on mobile */}
                             <div className="space-y-4">
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("eventName")}</label>
                                 <input
                                   type="text"
                                   value={event.event_name}
                                   onChange={(e) => updateEvent(index, "event_name", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div>
                                 <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("eventDescription")}</label>
                                 <input
                                   type="text"
                                   value={event.event_description}
                                   onChange={(e) => updateEvent(index, "event_description", e.target.value)}
                                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                 />
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("duration")} ({t("minutes")})</label>
                                   <input
                                     type="number"
                                     value={event.duration_minutes}
                                     onChange={(e) => updateEvent(index, "duration_minutes", Number.parseInt(e.target.value) || 60)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   />
                                 </div>
                                 
                                 <div>
                                   <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("bufferTime")} ({t("minutes")})</label>
                                   <input
                                     type="number"
                                     value={event.buffer_minutes}
                                     onChange={(e) => updateEvent(index, "buffer_minutes", Number.parseInt(e.target.value) || 0)}
                                     className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                   />
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Desktop Layout */}
                           <div className="hidden lg:flex lg:gap-4 lg:items-center">
                              {/* Circular number icon - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                                  {index + 1}
                                </div>
                          </div>

                              {/* Name - flexible width */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("eventName")}</label>
                                <input
                                  type="text"
                                  value={event.event_name}
                                  onChange={(e) => updateEvent(index, "event_name", e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                />
                              </div>

                              {/* Description - flexible width */}
                              <div className="flex-1">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("eventDescription")}</label>
                                <input
                                  type="text"
                                  value={event.event_description}
                                  onChange={(e) => updateEvent(index, "event_description", e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                />
                              </div>

                              {/* Duration - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("duration")} ({t("minutes")})</label>
                                  <input
                                    type="number"
                                    value={event.duration_minutes}
                                    onChange={(e) => updateEvent(index, "duration_minutes", Number.parseInt(e.target.value) || 60)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                  />
                                </div>

                              {/* Buffer Time - fixed width */}
                                <div className="w-24 flex-shrink-0">
                                <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("bufferTime")} ({t("minutes")})</label>
                                  <input
                                    type="number"
                                    value={event.buffer_minutes}
                                    onChange={(e) => updateEvent(index, "buffer_minutes", Number.parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                                  />
                              </div>

                              {/* Red cross button - minimal width */}
                              <div className="flex items-center justify-center w-8 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeEvent(index)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                                >
                                  ×
                                </button>
                            </div>
                          </div>

                                                     {/* Availability Section */}
                           <div className="mt-6">
                             <h4 className="text-sm font-semibold mb-3 text-[var(--dashboard-text-primary)]">Availability</h4>
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
                                                                   <div key={day.key} className="p-2 rounded border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-tertiary)]">
                                    {/* Mobile Layout - Stacked */}
                                    <div className="lg:hidden space-y-3">
                                      {/* Day name and toggle */}
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">{day.label}</span>
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
                                      </div>
                                      
                                      {/* Time Fields - Full width on mobile */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-input)]">
                                          <label className={`text-xs text-gray-500`}>Start</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].start}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'start', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-full px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none text-[var(--dashboard-text-primary)] ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
                                          />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-input)]">
                                          <label className={`text-xs text-gray-500`}>End</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].end}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'end', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-full px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none text-[var(--dashboard-text-primary)] ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Desktop Layout - Horizontal */}
                                    <div className="hidden lg:flex items-center gap-3">
                                      <span className="text-sm font-medium w-20 text-[var(--dashboard-text-secondary)]">{day.label}</span>
                                      
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
                                        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-input)]">
                                          <label className={`text-xs text-gray-500`}>Start</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].start}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'start', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-16 px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none text-[var(--dashboard-text-primary)] ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
                                          />
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-input)]">
                                          <label className={`text-xs text-gray-500`}>End</label>
                                          <input
                                            type="time"
                                            value={event.availability[day.key as keyof typeof event.availability].end}
                                            onChange={(e) => updateEventAvailability(index, day.key, 'end', e.target.value)}
                                            disabled={!event.availability[day.key as keyof typeof event.availability].enabled}
                                            className={`w-16 px-1 py-0.5 text-xs border-0 bg-transparent focus:ring-0 focus:outline-none text-[var(--dashboard-text-primary)] ${!event.availability[day.key as keyof typeof event.availability].enabled ? 'opacity-50' : ''}`}
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
              </div>
            </div>
          





                                                                                       {/* Requirements Section */}
               <div className="border-t-2 border-[var(--dashboard-border-primary)] pt-10 mb-10">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-sm md:text-lg font-bold text-[var(--dashboard-text-primary)] uppercase">{t("requirements")}</h2>
              <button
                type="button"
                onClick={addRequirement}
                className="px-3 py-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] rounded-lg text-sm hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
              >
                {t("addRequirement")}
              </button>
            </div>

                         {requirements.map((requirement, index) => (
               <div key={index} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                 {/* Mobile Layout */}
                 <div className="lg:hidden space-y-4">
                   {/* Header with number and delete button */}
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                         {index + 1}
                       </div>
                       <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">Requirement {index + 1}</span>
                     </div>
                     <button
                       type="button"
                       onClick={() => removeRequirement(index)}
                       className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                     >
                       ×
                     </button>
                   </div>
                   
                   {/* Full width inputs on mobile */}
                   <div className="space-y-4">
                     <div>
                       <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("requirementTitle")}</label>
                       <input
                         type="text"
                         value={requirement.title}
                         onChange={(e) => updateRequirement(index, "title", e.target.value)}
                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                       />
                     </div>
                     
                     <div>
                       <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("requirementText")}</label>
                       <input
                         type="text"
                         value={requirement.requirements_text}
                         onChange={(e) => updateRequirement(index, "requirements_text", e.target.value)}
                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                       />
                     </div>
                     
                     <div className="flex items-center">
                       <label className="flex items-center">
                         <input
                           type="checkbox"
                           checked={requirement.is_required}
                           onChange={(e) => updateRequirement(index, "is_required", e.target.checked)}
                           className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                         />
                         <span className="ml-2 text-xs text-[var(--dashboard-text-secondary)]">{t("required")}</span>
                       </label>
                     </div>
                   </div>
                 </div>

                 {/* Desktop Layout */}
                 <div className="hidden lg:flex lg:gap-4 lg:items-center">
                  {/* Circular number icon - minimal width */}
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                      {index + 1}
                    </div>
                </div>

                  {/* Title - fixed width */}
                  <div className="w-48 flex-shrink-0">
                    <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("requirementTitle")}</label>
                    <input
                      type="text"
                      value={requirement.title}
                      onChange={(e) => updateRequirement(index, "title", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    />
                  </div>

                  {/* Description - flexible width */}
                  <div className="flex-1">
                    <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("requirementText")}</label>
                    <input
                      type="text"
                      value={requirement.requirements_text}
                      onChange={(e) => updateRequirement(index, "requirements_text", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    />
                  </div>

                  {/* Required checkbox - fixed width */}
                  <div className="w-20 flex-shrink-0 flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={requirement.is_required}
                        onChange={(e) => updateRequirement(index, "is_required", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-xs text-[var(--dashboard-text-secondary)]">{t("required")}</span>
                    </label>
                  </div>

                  {/* Red cross button - minimal width */}
                  <div className="flex items-center justify-center w-8 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

                                                                                       {/* Questions Section */}
               <div className="border-t-2 border-[var(--dashboard-border-primary)] pt-10 mb-10">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-sm md:text-lg font-bold text-[var(--dashboard-text-primary)] uppercase">{t("questions")}</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] rounded-lg text-sm hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
              >
                {t("addQuestion")}
              </button>
            </div>

                             {questions.map((question, index) => (
                 <div key={index} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                   {/* Mobile Layout */}
                   <div className="lg:hidden space-y-4">
                     {/* Header with number and delete button */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                           {index + 1}
                         </div>
                         <span className="text-sm font-medium text-[var(--dashboard-text-secondary)]">Question {index + 1}</span>
                       </div>
                       <button
                         type="button"
                         onClick={() => removeQuestion(index)}
                         className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                       >
                         ×
                       </button>
                     </div>
                     
                     {/* Full width inputs on mobile */}
                     <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("questionType")}</label>
                         <select
                           value={question.question_type}
                           onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         >
                           <option value="open">📝 {t("openText")}</option>
                           <option value="checkbox_single">☑️ {t("singleCheckbox")}</option>
                           <option value="checkbox_multi">☑️☑️ {t("multipleChoice")}</option>
                         </select>
                       </div>
                       
                       <div>
                         <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("questionText")}</label>
                         <input
                           type="text"
                           value={question.question_text}
                           onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         />
                       </div>
                       
                       {/* Max Length - only for open questions */}
                       {question.question_type === "open" && (
                         <div>
                           <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("maxLength")}</label>
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
                             className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                           />
                         </div>
                       )}
                       
                       <div className="flex items-center">
                         <label className="flex items-center">
                           <input
                             type="checkbox"
                             checked={question.is_required}
                             onChange={(e) => updateQuestion(index, "is_required", e.target.checked)}
                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                           />
                           <span className="ml-2 text-xs text-[var(--dashboard-text-secondary)]">{t("required")}</span>
                         </label>
                       </div>
                     </div>
                   </div>

                   {/* Desktop Layout */}
                   <div className="hidden lg:flex lg:gap-4 lg:items-center">
                    {/* Circular number icon - minimal width */}
                    <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                        {index + 1}
                      </div>
                  </div>

                                         {/* Question Type - dropdown */}
                     <div className="w-48 flex-shrink-0">
                     <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("questionType")}</label>
                     <select
                       value={question.question_type}
                       onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                       className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                     >
                       <option value="open">📝 {t("openText")}</option>
                       <option value="checkbox_single">☑️ {t("singleCheckbox")}</option>
                       <option value="checkbox_multi">☑️☑️ {t("multipleChoice")}</option>
                     </select>
                     </div>

                                         {/* Question Text - flexible width */}
                     <div className="flex-1">
                       <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("questionText")}</label>
                       <input
                         type="text"
                         value={question.question_text}
                         onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                       />
                     </div>

                     {/* Max Length - fixed width (only for open questions) */}
                     {question.question_type === "open" && (
                       <div className="w-32 flex-shrink-0">
                         <label className="block text-xs font-medium mb-1 text-[var(--dashboard-text-secondary)]">{t("maxLength")}</label>
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
                           className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
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
                         <span className="ml-2 text-xs text-[var(--dashboard-text-secondary)]">{t("required")}</span>
                       </label>
                     </div>

                    {/* Red cross button - minimal width */}
                    <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                                     {/* Conditional fields based on question type */}
                   {(question.question_type === "checkbox_single" || question.question_type === "checkbox_multi") && (
                     <div className="mt-4">
                       <div className="flex justify-between items-center mb-2">
                         <label className="block text-sm font-medium text-[var(--dashboard-text-secondary)]">{t("options")}</label>
                         <button
                           type="button"
                           onClick={() => addQuestionOption(index)}
                           className="text-sm px-2 py-1 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-zinc-700"
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
                             className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                           />
                           <button
                             type="button"
                             onClick={() => removeQuestionOption(index, optionIndex)}
                             className="px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-zinc-700"
                           >
                             ×
                           </button>
                         </div>
                       ))}
                       {(!question.options || question.options.length === 0) && (
                         <p className="text-sm italic text-[var(--dashboard-text-secondary)]">
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
                <label className="block text-sm font-medium mb-3 text-[var(--dashboard-text-secondary)]">Additional Options</label>
                
                <div className="space-y-4">
                  {/* Newsletter Consent Card */}
                  <SelectableCard
                    title={t("requireConsentNewsletter")}
                    description={t("requireConsentNewsletterDescription")}
                    selected={requireConsentNewsletter}
                    onSelect={setRequireConsentNewsletter}
                    theme="light"
                  />
                  
                  {/* Conditional Newsletter Consent Text Field */}
                  {requireConsentNewsletter && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">Newsletter Consent Text</label>
                      <textarea
                        value={requireConsentNewsletterText}
                        onChange={(e) => setRequireConsentNewsletterText(e.target.value)}
                        placeholder="Enter the text that customers will see for newsletter consent..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                      />
                    </div>
                  )}
                  
                  {/* Phone Number Card */}
                  <SelectableCard
                    title="Require Phone Number"
                    description="Require customers to provide their phone number when booking or requesting a quotation"
                    selected={requirePhone}
                    onSelect={setRequirePhone}
                    theme="light"
                  />
                 </div>
               </div>
             </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-2 lg:gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border rounded-lg transition-colors border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-tertiary)]"
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
      </div>
     </DashboardLayout>
   )
 }