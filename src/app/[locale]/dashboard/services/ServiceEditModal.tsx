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
  question_options?: any
  max_length?: number
  is_required: boolean | null
}

interface ServiceRequirement {
  requirement_block_id: number
  title: string | null
  requirements_text: string
  is_required: boolean | null
}

interface ServiceItem {
  service_item_id: number
  item_name: string
  item_description: string | null
  price_base: number
  price_type: string
  price_unit: string | null
}

interface ServiceExtra {
  service_extra_id: number
  extra_name: string
  extra_description: string | null
  price_base: number
  price_type: string
  price_unit: string | null
}

interface ServiceEventAvailability {
  availability_id: number
  day_of_week: number
  time_start: string
  time_end: string
  is_recurring: boolean
  date_effective_from: string | null
  date_effective_to: string | null
}

interface ServiceEvent {
  event_id: number
  event_name: string
  event_description: string | null
  event_type: string
  duration_minutes: number
  buffer_minutes: number
  is_required: boolean
  display_order: number
  is_active: boolean
  serviceeventavailability?: ServiceEventAvailability[]
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  duration_minutes: number | null
  buffer_minutes: number | null
  price_base: number | null
  price_type: string | null
  price_unit: string | null
  has_items: boolean | null
  has_extras: boolean | null
  available_booking: boolean | null
  require_consent_newsletter: boolean | null
  require_consent_newsletter_text: string | null
  require_phone: boolean | null
  available_quotation: boolean | null
  is_active: boolean | null
  display_order: number | null
  servicecategory: {
    category_name: string
  } | null
  servicequestion: ServiceQuestion[]
  servicerequirementblock: ServiceRequirement[]
  serviceitem: ServiceItem[]
  serviceextra: ServiceExtra[]
  serviceevent: ServiceEvent[]
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
    price_base: '',
     price_type: 'fixed',
     price_unit: '',
    is_active: true,
     available_booking: true,
     available_quotation: false,
     require_phone: false,
     require_consent_newsletter: false,
     require_consent_newsletter_text: ''
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

  // Extras state
  const [extras, setExtras] = useState<ServiceExtra[]>([])
  const [newExtra, setNewExtra] = useState({
    extra_name: '',
    extra_description: '',
    price_base: '',
    price_type: 'fixed',
    price_unit: ''
  })

  // Questions state
  const [questions, setQuestions] = useState<ServiceQuestion[]>([])
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'open',
    question_options: [],
    max_length: undefined,
    is_required: false
  })

  // Requirements state
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([])
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    requirements_text: '',
    is_required: false
  })

  // Events state
  const [events, setEvents] = useState<ServiceEvent[]>([])
  const [newEvent, setNewEvent] = useState({
    event_name: '',
    event_description: '',
    event_type: 'appointment',
    duration_minutes: 60,
    buffer_minutes: 0,
    is_required: true,
    display_order: 0,
    is_active: true
  })

  // Helper function to get availability for a specific day
  const getAvailabilityForDay = (event: ServiceEvent, dayOfWeek: number) => {
    if (!event.serviceeventavailability) return null
    return event.serviceeventavailability.find(avail => avail.day_of_week === dayOfWeek)
  }

  // Helper function to format time for input fields
  const formatTimeForInput = (timeString: string) => {
    if (!timeString) return ''
    // Convert PostgreSQL time format to HTML time input format
    return timeString.substring(0, 5) // Extract HH:MM from HH:MM:SS
  }

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        description: service.description || '',
        price_base: service.price_base?.toString() || '',
         price_type: service.price_type || 'fixed',
         price_unit: service.price_unit || '',
        is_active: service.is_active || false,
         available_booking: service.available_booking || false,
         available_quotation: service.available_quotation || false,
         require_phone: service.require_phone || false,
         require_consent_newsletter: service.require_consent_newsletter || false,
         require_consent_newsletter_text: service.require_consent_newsletter_text || ''
      })
      setItems(service.serviceitem || [])
      setExtras(service.serviceextra || [])
      setQuestions(service.servicequestion || [])
      setRequirements(service.servicerequirementblock || [])
      setEvents(service.serviceevent || [])
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
      // Determine flags based on form data
      const hasItems = items.filter((i) => i.item_name.trim()).length > 0
      const hasExtras = extras.filter((e) => e.extra_name.trim()).length > 0
      const hasEvents = events.filter((e) => e.event_name.trim()).length > 0

      const response = await fetch(`/api/businesses/${businessId}/services/${service.service_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          has_items: hasItems,
          has_extras: hasExtras,
          available_booking: hasEvents || formData.available_booking,
          serviceitem: items,
          serviceextra: extras,
          servicequestion: questions,
          servicerequirementblock: requirements,
          serviceevent: events
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
      question_options: newQuestion.question_options,
      max_length: newQuestion.max_length,
      is_required: newQuestion.is_required
    }

    setQuestions(prev => [...prev, question])
    setNewQuestion({
      question_text: '',
      question_type: 'open',
      question_options: [],
      max_length: undefined,
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
      requirements_text: newRequirement.requirements_text,
      is_required: newRequirement.is_required
    }

    setRequirements(prev => [...prev, requirement])
    setNewRequirement({
      title: '',
      requirements_text: '',
      is_required: false
    })
  }

  const removeRequirement = (requirementId: number) => {
    setRequirements(prev => prev.filter(r => r.requirement_block_id !== requirementId))
  }

  // Extra management
  const addExtra = () => {
    if (!newExtra.extra_name || !newExtra.price_base) return

    const extra: ServiceExtra = {
      service_extra_id: Date.now(),
      extra_name: newExtra.extra_name,
      extra_description: newExtra.extra_description,
      price_base: parseFloat(newExtra.price_base),
      price_type: newExtra.price_type,
      price_unit: newExtra.price_unit
    }

    setExtras(prev => [...prev, extra])
    setNewExtra({
      extra_name: '',
      extra_description: '',
      price_base: '',
      price_type: 'fixed',
      price_unit: ''
    })
  }

  const removeExtra = (extraId: number) => {
    setExtras(prev => prev.filter(e => e.service_extra_id !== extraId))
  }

  // Event management
  const addEvent = () => {
    if (!newEvent.event_name) return

    const event: ServiceEvent = {
      event_id: Date.now(),
      event_name: newEvent.event_name,
      event_description: newEvent.event_description,
      event_type: newEvent.event_type,
      duration_minutes: newEvent.duration_minutes,
      buffer_minutes: newEvent.buffer_minutes,
      is_required: newEvent.is_required,
      display_order: newEvent.display_order,
      is_active: newEvent.is_active
    }

    setEvents(prev => [...prev, event])
    setNewEvent({
      event_name: '',
      event_description: '',
      event_type: 'appointment',
      duration_minutes: 60,
      buffer_minutes: 0,
      is_required: true,
      display_order: 0,
      is_active: true
    })
  }

  const removeEvent = (eventId: number) => {
    setEvents(prev => prev.filter(e => e.event_id !== eventId))
  }

  if (!isOpen || !service) return null

  const imagePath = `/uploads/business/${businessPublicUuid}/services/${service.service_id}.webp`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-7xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
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

                                     <div className="grid grid-cols-3 gap-4">
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

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                         {t("priceType")}
                      </label>
                       <select
                         value={formData.price_type}
                         onChange={(e) => handleInputChange('price_type', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                       >
                         <option value="fixed">{t("fixed")}</option>
                         <option value="percentage">{t("percentage")}</option>
                       </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                         {t("priceUnit")}
                    </label>
                    <input
                         type="text"
                         value={formData.price_unit}
                         onChange={(e) => handleInputChange('price_unit', e.target.value)}
                         placeholder="e.g., per hour, per session"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                     </div>
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

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

               {/* Service Items */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("serviceItems")} ({items.length})
                </h3>
                   <button
                     onClick={addItem}
                     className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                   >
                     Add Item
                   </button>
                 </div>

                 {/* Items list */}
                 <div className="space-y-4">
                   {items.map((item, index) => (
                     <div key={item.service_item_id} className="mb-4">
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
                             onChange={(e) => {
                               const updatedItems = [...items]
                               updatedItems[index] = { ...updatedItems[index], item_name: e.target.value }
                               setItems(updatedItems)
                             }}
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
                             value={item.item_description || ''}
                             onChange={(e) => {
                               const updatedItems = [...items]
                               updatedItems[index] = { ...updatedItems[index], item_description: e.target.value }
                               setItems(updatedItems)
                             }}
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
                             onChange={(e) => {
                               const updatedItems = [...items]
                               updatedItems[index] = { ...updatedItems[index], price_base: parseFloat(e.target.value) || 0 }
                               setItems(updatedItems)
                             }}
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
                             onChange={(e) => {
                               const updatedItems = [...items]
                               updatedItems[index] = { ...updatedItems[index], price_type: e.target.value }
                               setItems(updatedItems)
                             }}
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
                             onClick={() => removeItem(item.service_item_id)}
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
               </div>

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

               {/* Service Extras */}
                      <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className={`text-lg font-semibold ${
                          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                     Service Extras ({extras.length})
                   </h3>
                   <button
                     onClick={addExtra}
                     className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                   >
                     Add Extra
                   </button>
                        </div>

                 {/* Extras list */}
                 <div className="space-y-4">
                   {extras.map((extra, index) => (
                     <div key={extra.service_extra_id} className="mb-4">
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
                             onChange={(e) => {
                               const updatedExtras = [...extras]
                               updatedExtras[index] = { ...updatedExtras[index], extra_name: e.target.value }
                               setExtras(updatedExtras)
                             }}
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
                             value={extra.extra_description || ''}
                             onChange={(e) => {
                               const updatedExtras = [...extras]
                               updatedExtras[index] = { ...updatedExtras[index], extra_description: e.target.value }
                               setExtras(updatedExtras)
                             }}
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
                             onChange={(e) => {
                               const updatedExtras = [...extras]
                               updatedExtras[index] = { ...updatedExtras[index], price_base: parseFloat(e.target.value) || 0 }
                               setExtras(updatedExtras)
                             }}
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
                             onChange={(e) => {
                               const updatedExtras = [...extras]
                               updatedExtras[index] = { ...updatedExtras[index], price_type: e.target.value }
                               setExtras(updatedExtras)
                             }}
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
                             onClick={() => removeExtra(extra.service_extra_id)}
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
               </div>

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

                              {/* Service Questions */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("questions")} ({questions.length})
                </h3>
                   <button
                     onClick={addQuestion}
                     className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                   >
                     Add Question
                   </button>
                 </div>

                 {/* Questions list */}
                 <div className="space-y-4">
                   {questions.map((question, index) => (
                     <div key={question.question_id} className="mb-4">
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

                         {/* Question Text - flexible width */}
                         <div className="flex-1">
                           <label className={`block text-xs font-medium mb-1 ${
                             theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                           }`}>{t("questionText")}</label>
                    <input
                      type="text"
                             value={question.question_text}
                             onChange={(e) => {
                               const updatedQuestions = [...questions]
                               updatedQuestions[index] = { ...updatedQuestions[index], question_text: e.target.value }
                               setQuestions(updatedQuestions)
                             }}
                             className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === 'dark' 
                                 ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                 : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                         </div>

                         {/* Question Type - fixed width */}
                         <div className="w-32 flex-shrink-0">
                           <label className={`block text-xs font-medium mb-1 ${
                             theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                           }`}>{t("type")}</label>
                    <select
                             value={question.question_type}
                             onChange={(e) => {
                               const updatedQuestions = [...questions]
                               updatedQuestions[index] = { ...updatedQuestions[index], question_type: e.target.value }
                               setQuestions(updatedQuestions)
                             }}
                             className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === 'dark' 
                                 ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                 : 'border-gray-300 bg-white text-gray-900'
                             }`}
                           >
                             <option value="open">{t("open")}</option>
                             <option value="checkbox_single">{t("checkboxSingle")}</option>
                             <option value="checkbox_multi">{t("checkboxMulti")}</option>
                             <option value="media_upload">{t("mediaUpload")}</option>
                    </select>
                  </div>

                         {/* Required checkbox - fixed width */}
                         <div className="w-24 flex-shrink-0">
                           <label className="flex items-center h-full">
                    <input
                      type="checkbox"
                               checked={question.is_required || false}
                               onChange={(e) => {
                                 const updatedQuestions = [...questions]
                                 updatedQuestions[index] = { ...updatedQuestions[index], is_required: e.target.checked }
                                 setQuestions(updatedQuestions)
                               }}
                      className="mr-2"
                    />
                             <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {t("required")}
                    </span>
                  </label>
                </div>

                         {/* Red cross button - minimal width */}
                         <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <button
                             type="button"
                        onClick={() => removeQuestion(question.question_id)}
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
               </div>

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

                              {/* Service Requirements */}
              <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {t("requirements")} ({requirements.length})
                </h3>
                   <button
                     onClick={addRequirement}
                     className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                   >
                     Add Requirement
                   </button>
                 </div>

                 {/* Requirements list */}
                 <div className="space-y-4">
                   {requirements.map((requirement, index) => (
                     <div key={requirement.requirement_block_id} className="mb-4">
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

                          {/* Title - flexible width */}
                          <div className="flex-1">
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>{t("requirementTitle")}</label>
                  <input
                    type="text"
                              value={requirement.title || ''}
                              onChange={(e) => {
                                const updatedRequirements = [...requirements]
                                updatedRequirements[index] = { ...updatedRequirements[index], title: e.target.value }
                                setRequirements(updatedRequirements)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                                  ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                  : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                          </div>

                          {/* Requirements Text - flexible width */}
                          <div className="flex-1">
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>{t("requirementsText")}</label>
                            <input
                              type="text"
                              value={requirement.requirements_text}
                              onChange={(e) => {
                                const updatedRequirements = [...requirements]
                                updatedRequirements[index] = { ...updatedRequirements[index], requirements_text: e.target.value }
                                setRequirements(updatedRequirements)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      theme === 'dark' 
                                  ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Required checkbox - fixed width */}
                          <div className="w-24 flex-shrink-0">
                            <label className="flex items-center h-full">
                              <input
                                type="checkbox"
                                checked={requirement.is_required || false}
                                onChange={(e) => {
                                  const updatedRequirements = [...requirements]
                                  updatedRequirements[index] = { ...updatedRequirements[index], is_required: e.target.checked }
                                  setRequirements(updatedRequirements)
                                }}
                                className="mr-2"
                              />
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {t("required")}
                              </span>
                            </label>
                          </div>

                          {/* Red cross button - minimal width */}
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                  <button
                              type="button"
                              onClick={() => removeRequirement(requirement.requirement_block_id)}
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
               </div>

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

                {/* Service Events */}
                      <div>
                 <div className="flex justify-between items-center mb-4">
                   <h3 className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                     Service Events ({events.length})
                   </h3>
                   <button
                     onClick={addEvent}
                     className="px-3 py-1 bg-zinc-500 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                   >
                     Add Event
                   </button>
                          </div>

                 {/* Events list */}
                 <div className="space-y-4">
                   {events.map((event, index) => (
                     <div key={event.event_id} className="mb-4">
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

                          {/* Event Name - flexible width */}
                          <div className="flex-1">
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>Event Name</label>
                            <input
                              type="text"
                              value={event.event_name}
                              onChange={(e) => {
                                const updatedEvents = [...events]
                                updatedEvents[index] = { ...updatedEvents[index], event_name: e.target.value }
                                setEvents(updatedEvents)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'dark' 
                                  ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Event Description - flexible width */}
                          <div className="flex-1">
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>Event Description</label>
                            <input
                              type="text"
                              value={event.event_description || ''}
                              onChange={(e) => {
                                const updatedEvents = [...events]
                                updatedEvents[index] = { ...updatedEvents[index], event_description: e.target.value }
                                setEvents(updatedEvents)
                              }}
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
                            }`}>Duration (min)</label>
                            <input
                              type="number"
                              value={event.duration_minutes}
                              onChange={(e) => {
                                const updatedEvents = [...events]
                                updatedEvents[index] = { ...updatedEvents[index], duration_minutes: parseInt(e.target.value) || 60 }
                                setEvents(updatedEvents)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'dark' 
                                  ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Buffer - fixed width */}
                          <div className="w-24 flex-shrink-0">
                            <label className={`block text-xs font-medium mb-1 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>Buffer (min)</label>
                            <input
                              type="number"
                              value={event.buffer_minutes}
                              onChange={(e) => {
                                const updatedEvents = [...events]
                                updatedEvents[index] = { ...updatedEvents[index], buffer_minutes: parseInt(e.target.value) || 0 }
                                setEvents(updatedEvents)
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                theme === 'dark' 
                                  ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                            />
                          </div>

                          {/* Required checkbox - fixed width */}
                          <div className="w-24 flex-shrink-0">
                            <label className="flex items-center h-full">
                              <input
                                type="checkbox"
                                checked={event.is_required}
                                onChange={(e) => {
                                  const updatedEvents = [...events]
                                  updatedEvents[index] = { ...updatedEvents[index], is_required: e.target.checked }
                                  setEvents(updatedEvents)
                                }}
                                className="mr-2"
                              />
                              <span className={`text-xs ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Required
                              </span>
                            </label>
                          </div>

                          {/* Red cross button - minimal width */}
                          <div className="flex items-center justify-center w-8 flex-shrink-0">
                      <button
                              type="button"
                              onClick={() => removeEvent(event.event_id)}
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

                        {/* Event Availability - full width below */}
                        <div className="mt-3 ml-12">
                          <label className={`block text-xs font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>Event Availability</label>
                          <div className="grid grid-cols-7 gap-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => (
                              <div key={day} className="text-center">
                                <div className={`text-xs font-medium mb-1 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}>
                                  {day.slice(0, 3)}
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <input
                                    type="time"
                                    className={`w-full px-2 py-1 text-xs border rounded ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                    placeholder="Start"
                                  />
                                  <input
                                    type="time"
                                    className={`w-full px-2 py-1 text-xs border rounded ${
                                      theme === 'dark' 
                                        ? 'border-gray-600 bg-zinc-800 text-gray-100' 
                                        : 'border-gray-300 bg-white text-gray-900'
                                    }`}
                                    placeholder="End"
                                  />
                                </div>
                    </div>
                  ))}
                          </div>
                        </div>
                     </div>
                   ))}
                                                    </div>
               </div>

               {/* Horizontal separator */}
               <div className={`border-t-2 border-gray-300 dark:border-gray-600 pt-6 mb-6`}></div>

                {/* Consent Options */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Consent Options
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.require_phone}
                          onChange={(e) => handleInputChange('require_phone', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Require Phone Number
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.require_consent_newsletter}
                          onChange={(e) => handleInputChange('require_consent_newsletter', e.target.checked)}
                          className="mr-2"
                        />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Require Newsletter Consent
                        </span>
                      </label>
                    </div>

                    {formData.require_consent_newsletter && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Newsletter Consent Text
                        </label>
                        <textarea
                          value={formData.require_consent_newsletter_text}
                          onChange={(e) => handleInputChange('require_consent_newsletter_text', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'bg-zinc-700 border-gray-600 text-gray-100' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          rows={3}
                          placeholder="Enter custom newsletter consent text..."
                        />
                      </div>
                    )}
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
