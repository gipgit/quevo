"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useBusiness } from "@/lib/business-context"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { useRouter } from "next/navigation"
import { useToaster } from "@/components/ui/ToasterProvider"
import { canCreateMore, formatUsageDisplay } from "@/lib/usage-utils"
import { UsageLimitBar } from "@/components/dashboard/UsageLimitBar"

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

export default function CreateServicePage() {
  const t = useTranslations("services")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const { currentBusiness, userPlan, planLimits, usage, refreshUsageForFeature, loading: contextLoading } = useBusiness()
  const { showToast } = useToaster()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // Service basic info
  const [serviceName, setServiceName] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [priceBase, setPriceBase] = useState<number | null>(null)
  const [priceType, setPriceType] = useState("fixed")
  const [priceUnit, setPriceUnit] = useState("")
  const [hasItems, setHasItems] = useState(false)
  const [dateSelection, setDateSelection] = useState(false)

  // Dynamic sections
  const [questions, setQuestions] = useState<ServiceQuestion[]>([])
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([])
  const [items, setItems] = useState<ServiceItem[]>([])

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
        description: description || null,
        category_id: categoryId,
        duration_minutes: durationMinutes,
        buffer_minutes: bufferMinutes,
        price_base: priceBase,
        price_type: priceType,
        price_unit: priceUnit,
        has_items: hasItems,
        date_selection: dateSelection,
        questions: questions.filter((q) => q.question_text.trim()),
        requirements: requirements.filter((r) => r.requirements_text.trim()),
        items: items.filter((i) => i.item_name.trim()),
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("createService")}</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{tCommon("loading")}</p>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("createService")}</h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center min">
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t("createService")}</h1>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="border-b border-gray-500p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("basicInformation")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("serviceName")} *</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full text-lg px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("category")}</label>
                <select
                  value={categoryId || ""}
                  onChange={(e) => setCategoryId(e.target.value ? Number.parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t("selectCategory")}</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("description")}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("basePrice")} (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceBase || ""}
                    onChange={(e) => setPriceBase(e.target.value ? Number.parseFloat(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("priceType")}</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="fixed">{t("fixed")}</option>
                    <option value="per_unit">{t("perUnit")}</option>
                    <option value="per_hour">{t("perHour")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("priceUnit")}</label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={priceType === "fixed"}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">{t("requiresDateSelection")}</label>
                  <div className="flex items-center">
                    <span className={`text-sm mr-2 ${!dateSelection ? 'text-gray-500' : 'text-gray-700'}`}>
                      {!dateSelection ? 'Off' : 'On'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDateSelection(!dateSelection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        dateSelection ? 'bg-blue-600' : 'bg-zinc-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dateSelection ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {dateSelection && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("duration")} ({t("minutes")})
                    </label>
                    <input
                      type="number"
                      value={durationMinutes || ""}
                      onChange={(e) => setDurationMinutes(e.target.value ? Number.parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("bufferTime")} ({t("minutes")})
                    </label>
                    <input
                      type="number"
                      value={bufferMinutes}
                      onChange={(e) => setBufferMinutes(Number.parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Items Section */}
          <div className="border-bottom border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("additionalItems")}</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {t("addItem")}
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-zinc-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    {t("item")} {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    {t("remove")}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Title and Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("itemName")}</label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateItem(index, "item_name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("itemDescription")}</label>
                      <input
                        type="text"
                        value={item.item_description}
                        onChange={(e) => updateItem(index, "item_description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Price fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("itemPrice")} (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price_base}
                        onChange={(e) => updateItem(index, "price_base", Number.parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("priceType")}</label>
                        <select
                          value={item.price_type}
                          onChange={(e) => updateItem(index, "price_type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="fixed">{t("fixed")}</option>
                          <option value="per_unit">{t("perUnit")}</option>
                          <option value="per_hour">{t("perHour")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("priceUnit")}</label>
                        <input
                          type="text"
                          value={item.price_unit || ""}
                          onChange={(e) => updateItem(index, "price_unit", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={item.price_type === "fixed"}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Requirements Section */}
          <div className="border-bottom border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("requirements")}</h2>
              <button
                type="button"
                onClick={addRequirement}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {t("addRequirement")}
              </button>
            </div>

            {requirements.map((requirement, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-zinc-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900">
                    {t("requirement")} {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    {t("remove")}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("requirementTitle")}</label>
                    <input
                      type="text"
                      value={requirement.title}
                      onChange={(e) => updateRequirement(index, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("requirementText")}</label>
                    <textarea
                      value={requirement.requirements_text}
                      onChange={(e) => updateRequirement(index, "requirements_text", e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Questions Section */}
          <div className="border-bottom border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{t("questions")}</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {t("addQuestion")}
              </button>
            </div>

              {questions.map((question, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-zinc-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">
                      {t("question")} {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      {t("remove")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("questionText")}</label>
                      <input
                        type="text"
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t("questionType")}</label>
                      <select
                        value={question.question_type}
                        onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="open">{t("openText")}</option>
                        <option value="checkbox_single">{t("singleCheckbox")}</option>
                        <option value="checkbox_multi">{t("multipleChoice")}</option>
                        <option value="media_upload">{t("mediaUpload")}</option>
                      </select>
                    </div>
                  </div>

                  {(question.question_type === "radio" || question.question_type === "checkbox") && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">{t("options")}</label>
                        <button
                          type="button"
                          onClick={() => addQuestionOption(index)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
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
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeQuestionOption(index, optionIndex)}
                            className="text-red-600 hover:text-red-700 px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={question.is_required}
                        onChange={(e) => updateQuestion(index, "is_required", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t("required")}</span>
                    </label>

                    {question.question_type === "text" && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">{t("maxLength")}:</label>
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
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-zinc-50 transition-colors"
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
