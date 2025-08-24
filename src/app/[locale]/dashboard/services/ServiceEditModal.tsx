'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { useToaster } from "@/components/ui/ToasterProvider"
import Image from "next/image"
import RichTextEditor from "@/components/ui/RichTextEditor"

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
  price_base: number
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
  available_booking: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
}

interface ServiceEditModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
  businessId: string
  businessPublicUuid: string
  onServiceUpdated: () => void
}

export default function ServiceEditModal({
  isOpen,
  onClose,
  service,
  businessId,
  businessPublicUuid,
  onServiceUpdated
}: ServiceEditModalProps) {
  const t = useTranslations("services")
  const tCommon = useTranslations("Common")
  const { theme } = useTheme()
  const { showToast } = useToaster()

  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    duration_minutes: '',
    buffer_minutes: '',
    price_base: '',
    is_active: true,
    available_booking: true
  })

  // Items state
  const [items, setItems] = useState<ServiceItem[]>([])
  const [newItem, setNewItem] = useState({
    item_name: '',
    item_description: '',
    price_base: '',
    price_type: 'fixed',
    price_unit: ''
  })

  // Questions state
  const [questions, setQuestions] = useState<ServiceQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'text',
    is_required: false
  })

  // Requirements state
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([])
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    requirements_text: ''
  })

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        description: service.description || '',
        duration_minutes: service.duration_minutes?.toString() || '',
        buffer_minutes: service.buffer_minutes?.toString() || '',
        price_base: service.price_base?.toString() || '',
        is_active: service.is_active || false,
        available_booking: service.available_booking || false
      })
      setItems(service.serviceitem || [])
      setQuestions(service.servicequestion || [])
      setRequirements(service.servicerequirementblock || [])
    }
  }, [service])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!service) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/businesses/${businessId}/services/${service.service_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          serviceitem: items,
          servicequestion: questions,
          servicerequirementblock: requirements
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update service')
      }

      showToast({
        type: "success",
        title: t("updateSuccess"),
        message: t("updateSuccessMessage"),
        duration: 3000
      })

      onServiceUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating service:', error)
      showToast({
        type: "error",
        title: t("updateError"),
        message: t("updateErrorMessage"),
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Item management
  const addItem = () => {
    if (!newItem.item_name || !newItem.price_base) return

    const item: ServiceItem = {
      service_item_id: Date.now(), // Temporary ID
      item_name: newItem.item_name,
      item_description: newItem.item_description,
      price_base: parseFloat(newItem.price_base),
      price_type: newItem.price_type,
      price_unit: newItem.price_unit
    }

    setItems(prev => [...prev, item])
    setNewItem({
      item_name: '',
      item_description: '',
      price_base: '',
      price_type: 'fixed',
      price_unit: ''
    })
  }

  const removeItem = (itemId: number) => {
    setItems(prev => prev.filter(item => item.service_item_id !== itemId))
  }

  // Question management
  const addQuestion = () => {
    if (!newQuestion.question_text) return

    const question: ServiceQuestion = {
      question_id: Date.now(), // Temporary ID
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      is_required: newQuestion.is_required
    }

    setQuestions(prev => [...prev, question])
    setNewQuestion({
      question_text: '',
      question_type: 'text',
      is_required: false
    })
  }

  const removeQuestion = (questionId: number) => {
    setQuestions(prev => prev.filter(q => q.question_id !== questionId))
  }

  // Requirement management
  const addRequirement = () => {
    if (!newRequirement.requirements_text) return

    const requirement: ServiceRequirement = {
      requirement_block_id: Date.now(), // Temporary ID
      title: newRequirement.title,
      requirements_text: newRequirement.requirements_text
    }

    setRequirements(prev => [...prev, requirement])
    setNewRequirement({
      title: '',
      requirements_text: ''
    })
  }

  const removeRequirement = (requirementId: number) => {
    setRequirements(prev => prev.filter(r => r.requirement_block_id !== requirementId))
  }

  if (!isOpen || !service) return null

  const imagePath = `/uploads/business/${businessPublicUuid}/services/${service.service_id}.webp`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
        theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            {t("editService")}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Service Image */}
            <div className="lg:col-span-1">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {!imageError ? (
                  <Image
                    src={imagePath}
                    alt={service.service_name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("basicInformation")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t("serviceName")}
                    </label>
                    <input
                      type="text"
                      value={formData.service_name}
                      onChange={(e) => handleInputChange('service_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t("description")}
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => handleInputChange('description', value)}
                      theme={theme}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t("duration")} ({t("minutes")})
                      </label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t("buffer")} ({t("minutes")})
                      </label>
                      <input
                        type="number"
                        value={formData.buffer_minutes}
                        onChange={(e) => handleInputChange('buffer_minutes', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t("price")} (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price_base}
                      onChange={(e) => handleInputChange('price_base', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t("active")}
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.available_booking}
                        onChange={(e) => handleInputChange('available_booking', e.target.checked)}
                        className="mr-2"
                      />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {t("availableForBooking")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Service Items */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("serviceItems")} ({items.length})
                </h3>
                
                {/* Add new item */}
                <div className={`p-4 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder={t("itemName")}
                      value={newItem.item_name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, item_name: e.target.value }))}
                      className={`px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t("price")}
                      value={newItem.price_base}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price_base: e.target.value }))}
                      className={`px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={addItem}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {t("addItem")}
                    </button>
                  </div>
                  <textarea
                    placeholder={t("itemDescription")}
                    value={newItem.item_description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, item_description: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={2}
                  />
                </div>

                {/* Existing items */}
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.service_item_id} className={`p-4 rounded-lg flex justify-between items-center ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                    }`}>
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {item.item_name}
                        </div>
                        {item.item_description && (
                          <div className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.item_description}
                          </div>
                        )}
                        <div className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          €{item.price_base}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.service_item_id)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'text-red-400 hover:text-red-300 hover:bg-zinc-600' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Questions */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("questions")} ({questions.length})
                </h3>
                
                {/* Add new question */}
                <div className={`p-4 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder={t("questionText")}
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                      className={`px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <select
                      value={newQuestion.question_type}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_type: e.target.value }))}
                      className={`px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="text">{t("text")}</option>
                      <option value="textarea">{t("textarea")}</option>
                      <option value="select">{t("select")}</option>
                      <option value="checkbox">{t("checkbox")}</option>
                    </select>
                    <button
                      onClick={addQuestion}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {t("addQuestion")}
                    </button>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newQuestion.is_required}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t("required")}
                    </span>
                  </label>
                </div>

                {/* Existing questions */}
                <div className="space-y-2">
                  {questions.map((question) => (
                    <div key={question.question_id} className={`p-4 rounded-lg flex justify-between items-center ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                    }`}>
                      <div>
                        <div className={`font-medium ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {question.question_text}
                        </div>
                        <div className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {t("type")}: {question.question_type} • {question.is_required ? t("required") : t("optional")}
                        </div>
                      </div>
                      <button
                        onClick={() => removeQuestion(question.question_id)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'text-red-400 hover:text-red-300 hover:bg-zinc-600' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Requirements */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("requirements")} ({requirements.length})
                </h3>
                
                {/* Add new requirement */}
                <div className={`p-4 rounded-lg mb-4 ${
                  theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                }`}>
                  <input
                    type="text"
                    placeholder={t("requirementTitle")}
                    value={newRequirement.title}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg mb-4 ${
                      theme === 'dark' 
                        ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <textarea
                    placeholder={t("requirementsText")}
                    value={newRequirement.requirements_text}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, requirements_text: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg mb-4 ${
                      theme === 'dark' 
                        ? 'bg-zinc-600 border-gray-500 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                  />
                  <button
                    onClick={addRequirement}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {t("addRequirement")}
                  </button>
                </div>

                {/* Existing requirements */}
                <div className="space-y-2">
                  {requirements.map((requirement) => (
                    <div key={requirement.requirement_block_id} className={`p-4 rounded-lg flex justify-between items-start ${
                      theme === 'dark' ? 'bg-zinc-700' : 'bg-gray-50'
                    }`}>
                      <div>
                        {requirement.title && (
                          <div className={`font-medium ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {requirement.title}
                          </div>
                        )}
                        <div className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {requirement.requirements_text}
                        </div>
                      </div>
                      <button
                        onClick={() => removeRequirement(requirement.requirement_block_id)}
                        className={`p-2 rounded-lg transition-colors ${
                          theme === 'dark' 
                            ? 'text-red-400 hover:text-red-300 hover:bg-zinc-600' 
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tCommon("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isLoading
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  )
}
