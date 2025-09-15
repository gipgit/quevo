'use client'

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeProvider"
import { useToaster } from "@/components/ui/ToasterProvider"
import Image from "next/image"
import RichTextEditor from "@/components/ui/RichTextEditor"
import ServiceImageDisplay from "@/components/service/ServiceImageDisplay"

interface ServiceQuestion {
  question_id: number
  question_text: string
  question_type: string
  question_options?: Array<string | { id: number; text: string; value: string }>
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
  slot_interval_minutes?: number
  is_recurring: boolean
  date_effective_from: string | null
  date_effective_to: string | null
}

interface ServiceEvent {
  event_id: number
  event_name: string
  event_description: string | null
  event_type: string
  duration_minutes: number | null
  buffer_minutes: number | null
  slot_interval_minutes?: number | null
  is_required: boolean
  display_order: number
  is_active: boolean
  serviceeventavailability?: ServiceEventAvailability[]
}

interface Service {
  service_id: string
  service_name: string
  description: string | null
  price_base: number | null
  price_type: string | null
  price_unit: string | null
  has_items: boolean | null
  has_extras: boolean | null
  active_booking: boolean | null
  require_consent_newsletter: boolean | null
  require_consent_newsletter_text: string | null
  require_phone: boolean | null
  active_quotation: boolean | null
  is_active: boolean | null
  display_order: number | null
  demo: boolean | null
  has_image: boolean | null
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

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('basic')

  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    price_base: '',
     price_type: 'fixed',
     price_unit: '',
    is_active: true,
     active_booking: true,
     active_quotation: false,
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
  const [newQuestion, setNewQuestion] = useState<{
    question_text: string
    question_type: string
    question_options: Array<string | { id: number; text: string; value: string }>
    max_length?: number
    is_required: boolean
  }>({
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
    slot_interval_minutes: 15,
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
         active_booking: service.active_booking || false,
         active_quotation: service.active_quotation || false,
         require_phone: service.require_phone || false,
         require_consent_newsletter: service.require_consent_newsletter || false,
         require_consent_newsletter_text: service.require_consent_newsletter_text || ''
      })
      setItems(service.serviceitem || [])
      setExtras(service.serviceextra || [])
      // Normalize question options to ensure consistent format
      const normalizedQuestions = (service.servicequestion || []).map(q => {
        if (q.question_type === 'checkbox_single' || q.question_type === 'checkbox_multi') {
          // Ensure options are in the correct object format
          if (q.question_options && Array.isArray(q.question_options)) {
            const normalizedOptions = q.question_options.map((opt: any, idx: number) => {
              if (typeof opt === 'string') {
                return { id: idx + 1, text: opt, value: `option${idx + 1}` }
              }
              return opt
            })
            return { ...q, question_options: normalizedOptions }
          }
          // Initialize with default options if none exist
          return { 
            ...q, 
            question_options: [
              { id: 1, text: 'Option 1', value: 'option1' },
              { id: 2, text: 'Option 2', value: 'option2' }
            ]
          }
        }
        return q
      })
      setQuestions(normalizedQuestions)
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

  const handleRemoveImage = async () => {
    if (!service) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/businesses/${businessId}/services/${service.service_id}/delete-image`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove image')
      }

      showToast({
        type: "success",
        title: t("imageRemoved"),
        message: t("imageRemovedMessage"),
        duration: 3000
      })

      onServiceUpdated()
    } catch (error) {
      console.error('Error removing image:', error)
      showToast({
        type: "error",
        title: t("imageRemoveError"),
        message: t("imageRemoveErrorMessage"),
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
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
          active_booking: hasEvents || formData.active_booking,
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

    // Format question options based on type
    let formattedOptions = newQuestion.question_options
    if ((newQuestion.question_type === 'checkbox_single' || newQuestion.question_type === 'checkbox_multi') && 
        (!formattedOptions || formattedOptions.length === 0)) {
      formattedOptions = [
        { id: 1, text: 'Option 1', value: 'option1' },
        { id: 2, text: 'Option 2', value: 'option2' }
      ]
    }

    const question: ServiceQuestion = {
      question_id: Date.now(), // Temporary ID
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      question_options: formattedOptions,
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

  // Helper function to get add button for current tab
  const getAddButtonForTab = () => {
    switch (activeTab) {
      case 'extras':
        return (
          <button
            onClick={addExtra}
            disabled={!newExtra.extra_name.trim() || !newExtra.price_base}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !newExtra.extra_name.trim() || !newExtra.price_base
                ? theme === 'dark' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Add Extra
          </button>
        )
      case 'items':
        return (
          <button
            onClick={addItem}
            disabled={!newItem.item_name.trim() || !newItem.price_base}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !newItem.item_name.trim() || !newItem.price_base
                ? theme === 'dark' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Add Item
          </button>
        )
      case 'questions':
        return (
          <button
            onClick={addQuestion}
            disabled={!newQuestion.question_text.trim()}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !newQuestion.question_text.trim()
                ? theme === 'dark' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Add Question
          </button>
        )
      case 'requirements':
        return (
          <button
            onClick={addRequirement}
            disabled={!newRequirement.title.trim() || !newRequirement.requirements_text.trim()}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !newRequirement.title.trim() || !newRequirement.requirements_text.trim()
                ? theme === 'dark' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Add Requirement
          </button>
        )
      case 'events':
        return (
          <button
            onClick={addEvent}
            disabled={!newEvent.event_name.trim()}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              !newEvent.event_name.trim()
                ? theme === 'dark' 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Add Event
          </button>
        )
      default:
        return null
    }
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
      slot_interval_minutes: newEvent.slot_interval_minutes,
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
      slot_interval_minutes: 15,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 lg:p-2">
      <div className="max-w-7xl w-full max-h-[90vh] min-h-[600px] rounded-xl flex flex-col bg-[var(--dashboard-bg-card)]">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-[var(--dashboard-border-primary)]">
          {/* Mobile: Service title and close button in same row, toggles below */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
            
            {/* Row 1: Service title and close button (mobile) / Service title and right group (desktop) */}
            <div className="flex justify-between items-start md:flex-1 md:items-center">
              
              {/* Service Title */}
              <div className="flex flex-col">
                <h2 className="text-xs lg:text-sm font-medium text-[var(--dashboard-text-secondary)] mb-0.5 lg:mb-1">
                  {t("editService")}
                </h2>
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight md:leading-normal text-[var(--dashboard-text-primary)]">
                  {service.service_name}
                </h1>
              </div>
              
              {/* Close Button - Mobile only */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors md:hidden text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Desktop: Right Group - Toggle Switches and Close Button */}
              <div className="hidden md:flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm text-[var(--dashboard-text-secondary)]">
                    {t("active")}
                  </span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-sm text-[var(--dashboard-text-secondary)]">
                    {t("activeBooking")}
                  </span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.active_booking 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.active_booking}
                      onChange={(e) => handleInputChange('active_booking', e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.active_booking ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-sm text-[var(--dashboard-text-secondary)]">
                    {t("activeQuotation")}
                  </span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.active_quotation 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.active_quotation}
                      onChange={(e) => handleInputChange('active_quotation', e.target.checked)}
                      className="sr-only"
                    />
                    <span className={`inline-block h-4 w-4 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.active_quotation ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
            </div>
            
            {/* Row 2: Toggle Switches - Mobile only, aligned to left */}
            <div className="flex items-center justify-start gap-4 md:hidden">
              <label className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--dashboard-text-secondary)]">
                  {t("active")}
                </span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  formData.is_active 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="sr-only"
                  />
                  <span className={`inline-block h-3 w-3 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>

              <label className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--dashboard-text-secondary)]">
                  {t("activeBooking")}
                </span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  formData.active_booking 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.active_booking}
                    onChange={(e) => handleInputChange('active_booking', e.target.checked)}
                    className="sr-only"
                  />
                  <span className={`inline-block h-3 w-3 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.active_booking ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>

              <label className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--dashboard-text-secondary)]">
                  {t("activeQuotation")}
                </span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  formData.active_quotation 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.active_quotation}
                    onChange={(e) => handleInputChange('active_quotation', e.target.checked)}
                    className="sr-only"
                  />
                  <span className={`inline-block h-3 w-3 transform rounded-full transition-transform bg-white dark:bg-gray-200 ${formData.active_quotation ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
            
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[var(--dashboard-border-primary)]">
          <div className="flex space-x-1 px-4 lg:px-6 overflow-x-auto scroll-smooth">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'basic'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.basicInfo")}
            </button>
            <button
              onClick={() => setActiveTab('extras')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'extras'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.extras")} ({extras.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'items'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.items")} ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'questions'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.questions")} ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'requirements'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.requirements")} ({requirements.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'events'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.events")} ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('consent')}
              className={`px-4 md:px-3 lg:px-4 py-3 md:py-2 lg:py-3 text-xs lg:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === 'consent'
                  ? 'bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)] border-b-2 border-blue-500'
                  : 'text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]'
              }`}
            >
              {t("tabs.consent")}
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 overflow-y-auto flex-1 bg-[var(--dashboard-bg-tab-content)]">
          {/* Basic Information Section - Column Layout */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            {/* Left Column - Basic Information Fields */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                    {t("serviceName")}
                  </label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) => handleInputChange('service_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                    {t("description")}
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleInputChange('description', value)}
                    theme={theme}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                       {t("price")} (€)
                    </label>
                    <input
                      type="number"
                       step="0.01"
                       value={formData.price_base}
                       onChange={(e) => handleInputChange('price_base', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                       {t("priceType")}
                    </label>
                     <select
                       value={formData.price_type}
                       onChange={(e) => handleInputChange('price_type', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                     >
                       <option value="fixed">{t("fixed")}</option>
                       <option value="per_unit">{t("perUnit")}</option>
                     </select>
                </div>

                <div>
                  <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                       {t("priceUnit")}
                  </label>
                  <input
                       type="text"
                       value={formData.price_unit}
                       onChange={(e) => handleInputChange('price_unit', e.target.value)}
                       placeholder="e.g., per hour, per session"
                    className="w-full px-3 py-2 border rounded-lg bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                  />
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column - Service Image */}
            <div className="lg:col-span-1">
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <ServiceImageDisplay
                  serviceId={service.service_id}
                  serviceName={service.service_name}
                  demo={service.demo}
                  hasImage={service.has_image}
                  businessPublicUuid={businessPublicUuid}
                  className="w-full h-full"
                  showDemoBadge={false}
                />
                
                {/* Delete Image Button - positioned near the image */}
                {service?.has_image && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className={`absolute top-2 right-2 p-2 rounded-full transition-colors flex items-center gap-1 ${
                      isLoading
                        ? "bg-red-400 text-white cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Service Extras - Full Width */}
          {activeTab === 'extras' && (
            <div className="mb-8">

             {/* Extras list */}
             <div className="space-y-3">
               {extras.map((extra, index) => (
                 <div key={extra.service_extra_id} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                   <div className="space-y-2 lg:space-y-0 lg:flex lg:gap-3 lg:items-center">
                     {/* Header row with number icon and delete button - mobile only */}
                     <div className="flex justify-between items-center lg:hidden mb-2">
                       {/* Circular number icon - minimal width */}
                       <div className="flex items-center justify-center w-8 flex-shrink-0">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                           {index + 1}
                        </div>
                       </div>
                       
                       {/* Red cross button - mobile only */}
                       <button
                         type="button"
                         onClick={() => removeExtra(extra.service_extra_id)}
                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          theme === 'dark' 
                           ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                           : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                         }`}
                       >
                         <span className="text-sm font-light">×</span>
                       </button>
                     </div>
                     
                     {/* Circular number icon - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal ${
                         theme === 'dark' 
                           ? 'bg-gray-700 text-gray-400' 
                           : 'bg-gray-600 text-gray-300'
                       }`}>
                         {index + 1}
                      </div>
                    </div>

                                                                                       {/* Name - even less width */}
                      <div className="w-full lg:w-1/4 flex-shrink-0 relative">
                                                                      <input
                         type="text"
                         value={extra.extra_name}
                         onChange={(e) => {
                           const updatedExtras = [...extras]
                           updatedExtras[index] = { ...updatedExtras[index], extra_name: e.target.value }
                           setExtras(updatedExtras)
                         }}
                         className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="Extra Name"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Extra Name
                       </span>
                  </div>

                     {/* Description - more width */}
                     <div className="w-full lg:flex-1 relative">
                       <input
                         type="text"
                         value={extra.extra_description || ''}
                         onChange={(e) => {
                           const updatedExtras = [...extras]
                           updatedExtras[index] = { ...updatedExtras[index], extra_description: e.target.value }
                           setExtras(updatedExtras)
                         }}
                         className="w-full px-3 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="Description"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Description
                       </span>
                     </div>

                     {/* Price - fixed width */}
                     <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <input
                         type="number"
                         step="0.01"
                         value={extra.price_base}
                         onChange={(e) => {
                           const updatedExtras = [...extras]
                           updatedExtras[index] = { ...updatedExtras[index], price_base: parseFloat(e.target.value) || 0 }
                           setExtras(updatedExtras)
                         }}
                         className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="0.00"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Price
                       </span>
                     </div>

                     {/* Price Type - fixed width */}
                     <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <select
                         value={extra.price_type}
                         onChange={(e) => {
                           const updatedExtras = [...extras]
                           updatedExtras[index] = { ...updatedExtras[index], price_type: e.target.value }
                           setExtras(updatedExtras)
                         }}
                         className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                       >
                       <option value="fixed">{t("fixed")}</option>
                       <option value="per_unit">{t("perUnit")}</option>
                     </select>
                     <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                       Type
                     </span>
                   </div>

                     {/* Red cross button - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                  <button
                       type="button"
                       onClick={() => removeExtra(extra.service_extra_id)}
                       className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        theme === 'dark' 
                         ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                         : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                  }`}
                  >
                       <span className="text-sm font-light">×</span>
                  </button>
                     </div>
                   </div>
                </div>
              ))}
                             </div>

              {/* Add Extra Form */}
              <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className={`text-md font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Add New Extra
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={newExtra.extra_name}
                      onChange={(e) => setNewExtra(prev => ({ ...prev, extra_name: e.target.value }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="Extra Name"
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Extra Name
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={newExtra.extra_description}
                      onChange={(e) => setNewExtra(prev => ({ ...prev, extra_description: e.target.value }))}
                      className={`w-full px-3 py-2 pr-24 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      placeholder="Description"
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Description
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={newExtra.price_base}
                      onChange={(e) => setNewExtra(prev => ({ ...prev, price_base: e.target.value }))}
                      className={`w-full px-3 py-2 pr-16 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="0.00"
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Price
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Items - Full Width */}
          {activeTab === 'items' && (
            <div className="mb-8">

                          {/* Items list */}
             <div className="space-y-3">
               {items.map((item, index) => (
                   <div key={item.service_item_id} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                     <div className="space-y-2 lg:space-y-0 lg:flex lg:gap-3 lg:items-center">
                                           {/* Header row with number icon and delete button - mobile only */}
                      <div className="flex justify-between items-center lg:hidden mb-2">
                        {/* Circular number icon - minimal width */}
                        <div className="flex items-center justify-center w-8 flex-shrink-0">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Red cross button - mobile only */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.service_item_id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                           theme === 'dark' 
                            ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                            : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-light">×</span>
                        </button>
                      </div>
                      
                      {/* Circular number icon - desktop only */}
                      <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                          {index + 1}
                        </div>
                      </div>

                                             {/* Name - even less width */}
                       <div className="w-full lg:w-1/4 flex-shrink-0 relative">
                                                                                            <input
                   type="text"
                   value={item.item_name}
                   onChange={(e) => {
                     const updatedItems = [...items]
                     updatedItems[index] = { ...updatedItems[index], item_name: e.target.value }
                     setItems(updatedItems)
                   }}
                   className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                   placeholder={t("itemName")}
                 />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                   {t("itemName")}
                 </span>
                      </div>

                                           {/* Description - more width */}
                       <div className="w-full lg:flex-1 relative">
                                                                                                                                                               <input
                   type="text"
                   value={item.item_description || ''}
                   onChange={(e) => {
                     const updatedItems = [...items]
                     updatedItems[index] = { ...updatedItems[index], item_description: e.target.value }
                     setItems(updatedItems)
                   }}
                   className="w-full px-3 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                   placeholder={t("itemDescription")}
                 />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                            {t("itemDescription")}
                          </span>
                      </div>

                     {/* Price - fixed width */}
                     <div className="w-full lg:w-32 flex-shrink-0 relative">
                                                                                                                           <input
                    type="number"
                    step="0.01"
                    value={item.price_base}
                    onChange={(e) => {
                      const updatedItems = [...items]
                      updatedItems[index] = { ...updatedItems[index], price_base: parseFloat(e.target.value) || 0 }
                      setItems(updatedItems)
                    }}
                    className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    placeholder="0.00"
                  />
                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                   {t("price")}
                 </span>
                     </div>

                     {/* Price Type - fixed width */}
                     <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <select
                         value={item.price_type}
                         onChange={(e) => {
                           const updatedItems = [...items]
                           updatedItems[index] = { ...updatedItems[index], price_type: e.target.value }
                           setItems(updatedItems)
                         }}
                         className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
            >
                       <option value="fixed">{t("fixed")}</option>
                       <option value="per_unit">{t("perUnit")}</option>
                     </select>
                     <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                       {t("priceType")}
                     </span>
            </div>

                     {/* Red cross button - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                       <button
                         type="button"
                         onClick={() => removeItem(item.service_item_id)}
                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                theme === 'dark' 
                         ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                         : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
               }`}
                       >
                         <span className="text-sm font-light">×</span>
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
                                                         </div>

              {/* Add Item Form */}
              <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className={`text-md font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Add New Item
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={newItem.item_name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, item_name: e.target.value }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t("itemName")}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {t("itemName")}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={newItem.item_description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, item_description: e.target.value }))}
                      className={`w-full px-3 py-2 pr-24 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t("itemDescription")}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t("itemDescription")}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price_base}
                      onChange={(e) => setNewItem(prev => ({ ...prev, price_base: e.target.value }))}
                      className={`w-full px-3 py-2 pr-16 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="0.00"
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t("price")}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addItem}
                      disabled={!newItem.item_name.trim() || !newItem.price_base}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !newItem.item_name.trim() || !newItem.price_base
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

                           {/* Service Questions - Full Width */}
          {activeTab === 'questions' && (
            <div className="mb-8">

             {/* Questions list */}
             <div className="space-y-3">
               {questions.map((question, index) => (
                 <div key={question.question_id} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                   <div className="space-y-2 lg:space-y-0 lg:flex lg:gap-3 lg:items-center">
                     {/* Header row with number icon and delete button - mobile only */}
                     <div className="flex justify-between items-center lg:hidden mb-2">
                       {/* Circular number icon - minimal width */}
                       <div className="flex items-center justify-center w-8 flex-shrink-0">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                           {index + 1}
                         </div>
                       </div>
                       
                       {/* Red cross button - mobile only */}
                       <button
                         type="button"
                         onClick={() => removeQuestion(question.question_id)}
                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          theme === 'dark' 
                           ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                           : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                         }`}
                       >
                         <span className="text-sm font-light">×</span>
                       </button>
                     </div>
                     
                     {/* Circular number icon - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal ${
                         theme === 'dark' 
                           ? 'bg-gray-700 text-gray-400' 
                           : 'bg-gray-600 text-gray-300'
                       }`}>
                         {index + 1}
                       </div>
                     </div>

                     {/* Question Text - flexible width */}
                     <div className="w-full lg:flex-1 relative">
                             <input
                 type="text"
                 value={question.question_text}
                 onChange={(e) => {
                   const updatedQuestions = [...questions]
                   updatedQuestions[index] = { ...updatedQuestions[index], question_text: e.target.value }
                   setQuestions(updatedQuestions)
                 }}
                                   className="w-full px-3 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                 placeholder={t("questionText")}
               />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                {t("questionText")}
              </span>
                     </div>

                     {/* Question Type - fixed width */}
                     <div className="w-full lg:w-36 flex-shrink-0 relative">
              <select
                       value={question.question_type}
                       onChange={(e) => {
                         const updatedQuestions = [...questions]
                         const newType = e.target.value
                         
                         // Initialize options if switching to checkbox types
                         if ((newType === 'checkbox_single' || newType === 'checkbox_multi') && 
                             (!question.question_options || question.question_options.length === 0)) {
                           updatedQuestions[index] = { 
                             ...updatedQuestions[index], 
                             question_type: newType,
                             question_options: [
                               { id: 1, text: 'Option 1', value: 'option1' },
                               { id: 2, text: 'Option 2', value: 'option2' }
                             ]
                           }
                         } else if (newType === 'checkbox_single' || newType === 'checkbox_multi') {
                           // Ensure only 2 options when switching to checkbox types
                           const existingOptions = question.question_options || []
                           const formattedOptions = existingOptions.map((opt: any, idx: number) => {
                             if (typeof opt === 'string') {
                               return { id: idx + 1, text: opt, value: `option${idx + 1}` }
                             }
                             return opt
                           }).slice(0, 2)
                           
                           if (formattedOptions.length < 2) {
                             formattedOptions.push(
                               { id: formattedOptions.length + 1, text: `Option ${formattedOptions.length + 1}`, value: `option${formattedOptions.length + 1}` }
                             )
                           }
                           
                           updatedQuestions[index] = { 
                             ...updatedQuestions[index], 
                             question_type: newType,
                             question_options: formattedOptions
                           }
                         } else {
                           updatedQuestions[index] = { ...updatedQuestions[index], question_type: newType }
                         }
                         
                         setQuestions(updatedQuestions)
                       }}
                       className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                       >
                       <option value="open">{t("open")}</option>
                       <option value="checkbox_single">{t("checkboxSingle")}</option>
                       <option value="checkbox_multi">{t("checkboxMulti")}</option>
                       <option value="media_upload">{t("mediaUpload")}</option>
              </select>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                {t("type")}
              </span>
            </div>

                     {/* Required checkbox - fixed width */}
                     <div className="w-full lg:w-24 flex-shrink-0">
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
                       <span className="text-xs text-[var(--dashboard-text-secondary)]">
                {t("required")}
              </span>
            </label>
          </div>

                     {/* Red cross button - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                  <button
                       type="button"
                  onClick={() => removeQuestion(question.question_id)}
                       className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        theme === 'dark' 
                         ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                         : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                  }`}
                  >
                       <span className="text-sm font-light">×</span>
                  </button>
                     </div>
                   </div>

                   {/* Question Options - shown only for checkbox types */}
                   {(question.question_type === 'checkbox_single' || question.question_type === 'checkbox_multi') && (
                     <div className="mt-2 ml-12">
                       <label className="block text-xs font-normal mb-1 text-[var(--dashboard-text-secondary)]">
                         Options
                       </label>
                       <div className="flex flex-wrap items-center gap-2">
                         {(question.question_options || []).map((option: any, optionIndex: number) => (
                           <div key={optionIndex} className="flex items-center gap-1">
                             <input
                               type="text"
                               value={typeof option === 'string' ? option : option?.text || ''}
                               onChange={(e) => {
                                 const updatedQuestions = [...questions]
                                 const updatedOptions = [...(updatedQuestions[index].question_options || [])]
                                 // Handle both string and object formats
                                 if (typeof option === 'object' && option !== null) {
                                   updatedOptions[optionIndex] = { ...option, text: e.target.value }
                                 } else {
                                   updatedOptions[optionIndex] = e.target.value
                                 }
                                 updatedQuestions[index] = { 
                                   ...updatedQuestions[index], 
                                   question_options: updatedOptions
                                 }
                                 setQuestions(updatedQuestions)
                               }}
                               className="w-28 px-2 py-1 border rounded text-xs bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                               placeholder={`Option ${optionIndex + 1}`}
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 const updatedQuestions = [...questions]
                                 const updatedOptions = [...(updatedQuestions[index].question_options || [])]
                                 updatedOptions.splice(optionIndex, 1)
                                 updatedQuestions[index] = { 
                                   ...updatedQuestions[index], 
                                   question_options: updatedOptions
                                 }
                                 setQuestions(updatedQuestions)
                               }}
                               className="w-4 h-4 rounded-full flex items-center justify-center transition-colors bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-red-600 hover:text-white"
                               disabled={(question.question_options || []).length <= 2}
                             >
                               <span className="text-xs font-light">×</span>
                             </button>
                           </div>
                         ))}
                         <button
                           type="button"
                           onClick={() => {
                             const updatedQuestions = [...questions]
                             const currentOptions = updatedQuestions[index].question_options || []
                             const newOptionId = currentOptions.length + 1
                             const newOption = { 
                               id: newOptionId, 
                               text: `Option ${newOptionId}`, 
                               value: `option${newOptionId}` 
                             }
                             const updatedOptions = [...currentOptions, newOption]
                             updatedQuestions[index] = { 
                               ...updatedQuestions[index], 
                               question_options: updatedOptions
                             }
                             setQuestions(updatedQuestions)
                           }}
                           className="px-2 py-1 border border-[var(--dashboard-border-primary)] bg-transparent text-[var(--dashboard-text-secondary)] rounded text-xs hover:bg-[var(--dashboard-bg-tertiary)] hover:text-[var(--dashboard-text-primary)] transition-colors"
                         >
                           Add Option
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              ))}
                             </div>

              {/* Add Question Form */}
              <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className={`text-md font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Add New Question
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                      className={`w-full px-3 py-2 pr-24 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t("questionText")}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {t("questionText")}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={newQuestion.question_type}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, question_type: e.target.value }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="open">{t("open")}</option>
                      <option value="checkbox_single">{t("checkboxSingle")}</option>
                      <option value="checkbox_multi">{t("checkboxMulti")}</option>
                      <option value="media_upload">{t("mediaUpload")}</option>
                    </select>
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t("type")}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addQuestion}
                      disabled={!newQuestion.question_text.trim()}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !newQuestion.question_text.trim()
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

                           {/* Service Requirements - Full Width */}
          {activeTab === 'requirements' && (
            <div className="mb-8">

             {/* Requirements list */}
             <div className="space-y-3">
               {requirements.map((requirement, index) => (
                                  <div key={requirement.requirement_block_id} className="mb-3 border rounded-xl p-3 lg:py-2 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                                                 <div className="space-y-2 lg:space-y-0 lg:flex lg:gap-3 lg:items-center">
                                         {/* Header row with number icon and delete button - mobile only */}
                     <div className="flex justify-between items-center lg:hidden mb-2">
                       {/* Circular number icon - minimal width */}
                       <div className="flex items-center justify-center w-8 flex-shrink-0">
                         <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                           {index + 1}
                         </div>
                       </div>
                       
                       {/* Red cross button - mobile only */}
                       <button
                         type="button"
                         onClick={() => removeRequirement(requirement.requirement_block_id)}
                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          theme === 'dark' 
                           ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                           : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                         }`}
                       >
                         <span className="text-sm font-light">×</span>
                       </button>
                     </div>
                     
                     {/* Circular number icon - desktop only */}
                     <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal ${
                         theme === 'dark' 
                           ? 'bg-gray-700 text-gray-400' 
                           : 'bg-gray-600 text-gray-300'
                       }`}>
                         {index + 1}
                       </div>
                     </div>

                                                                                                                                                                                                                                                                                                                                                                   {/* Title - very narrow */}
                         <div className="w-full lg:w-1/5 flex-shrink-0 relative">
            <input
              type="text"
                        value={requirement.title || ''}
                        onChange={(e) => {
                          const updatedRequirements = [...requirements]
                          updatedRequirements[index] = { ...updatedRequirements[index], title: e.target.value }
                          setRequirements(updatedRequirements)
                        }}
                        className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
              placeholder={t("requirementTitle")}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
              {t("requirementTitle")}
            </span>
                    </div>

                                                                                      {/* Requirements Text - more width */}
                        <div className="w-full lg:flex-1 relative">
                        <input
                          type="text"
                          value={requirement.requirements_text}
                          onChange={(e) => {
                            const updatedRequirements = [...requirements]
                            updatedRequirements[index] = { ...updatedRequirements[index], requirements_text: e.target.value }
                            setRequirements(updatedRequirements)
                          }}
                          className="w-full px-3 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                        placeholder={t("requirementsText")}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                          {t("requirementsText")}
                        </span>
                      </div>

                                          {/* Required checkbox - fixed width */}
                      <div className="w-full lg:w-24 flex-shrink-0">
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
                                                                                                           <span className="text-xs text-[var(--dashboard-text-secondary)]">
                              {t("required")}
                            </span>
                        </label>
                      </div>

                      {/* Red cross button - desktop only */}
                      <div className="hidden lg:flex items-center justify-center w-8 flex-shrink-0">
            <button
                        type="button"
                        onClick={() => removeRequirement(requirement.requirement_block_id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              theme === 'dark' 
                            ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                            : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
              }`}
            >
                        <span className="text-sm font-light">×</span>
            </button>
                      </div>
                  </div>
                 </div>
               ))}
                                                   </div>

              {/* Add Requirement Form */}
              <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className={`text-md font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Add New Requirement
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={newRequirement.title}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 pr-16 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t("requirementTitle")}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {t("requirementTitle")}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={newRequirement.requirements_text}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, requirements_text: e.target.value }))}
                      className={`w-full px-2 py-2 pr-24 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder={t("requirementsText")}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {t("requirementsText")}
                    </span>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addRequirement}
                      disabled={!newRequirement.requirements_text.trim()}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !newRequirement.requirements_text.trim()
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Add Requirement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Service Events - Full Width */}
          {activeTab === 'events' && (
            <div className="mb-8">

             {/* Events list */}
             <div className="space-y-3">
               {events.map((event, index) => (
                                  <div key={event.event_id} className="mb-3 border rounded-xl p-3 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                                                 <div className="space-y-2 lg:space-y-0 lg:flex lg:gap-3 lg:items-center">
                                         {/* Circular number icon - minimal width */}
                     <div className="flex items-center justify-center w-8 flex-shrink-0">
                       <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-normal bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)]">
                         {index + 1}
                   </div>
                 </div>

                                           {/* Event Name - narrower width */}
                      <div className="w-full lg:w-1/4 flex-shrink-0 relative">
                       <input
                         type="text"
                         value={event.event_name}
                         onChange={(e) => {
                           const updatedEvents = [...events]
                           updatedEvents[index] = { ...updatedEvents[index], event_name: e.target.value }
                           setEvents(updatedEvents)
                         }}
                         className="w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="Event Name"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Event Name
                       </span>
                     </div>

                                          {/* Event Description - flexible width */}
                      <div className="w-full lg:flex-1 relative">
                       <input
                         type="text"
                         value={event.event_description || ''}
                         onChange={(e) => {
                           const updatedEvents = [...events]
                           updatedEvents[index] = { ...updatedEvents[index], event_description: e.target.value }
                           setEvents(updatedEvents)
                         }}
                         className="w-full px-3 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="Description"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Description
                       </span>
                     </div>

                                          {/* Duration - fixed width */}
                      <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <input
                         type="number"
                         value={event.duration_minutes || 60}
                         onChange={(e) => {
                           const updatedEvents = [...events]
                           updatedEvents[index] = { ...updatedEvents[index], duration_minutes: parseInt(e.target.value) || 60 }
                           setEvents(updatedEvents)
                         }}
                         className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="60"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Duration
                       </span>
                     </div>

                                          {/* Buffer - fixed width */}
                      <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <input
                         type="number"
                         value={event.buffer_minutes || 0}
                         onChange={(e) => {
                           const updatedEvents = [...events]
                           updatedEvents[index] = { ...updatedEvents[index], buffer_minutes: parseInt(e.target.value) || 0 }
                           setEvents(updatedEvents)
                         }}
                         className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="0"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Buffer
                       </span>
                     </div>

                                          {/* Slot Interval - fixed width */}
                      <div className="w-full lg:w-32 flex-shrink-0 relative">
                       <input
                         type="number"
                         value={event.slot_interval_minutes || 15}
                         onChange={(e) => {
                           const updatedEvents = [...events]
                           updatedEvents[index] = { ...updatedEvents[index], slot_interval_minutes: parseInt(e.target.value) || 15 }
                           setEvents(updatedEvents)
                         }}
                         className="w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                         placeholder="15"
                         min="5"
                         step="5"
                       />
                       <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 text-[var(--dashboard-text-secondary)]">
                         Interval
                       </span>
                     </div>



                     {/* Red cross button - minimal width */}
                     <div className="flex items-center justify-center w-8 flex-shrink-0">
                   <button
                         type="button"
                         onClick={() => removeEvent(event.event_id)}
                         className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                         theme === 'dark' 
                             ? 'bg-gray-500 text-gray-400 hover:bg-red-600 hover:text-white' 
                             : 'bg-gray-200 text-gray-500 hover:bg-red-500 hover:text-white'
                   }`}
                   >
                         <span className="text-sm font-light">×</span>
                   </button>
                     </div>
                  </div>

                  {/* Event Availability - full width below */}
                  <div className="mt-4 ml-12">
                    <div className="grid grid-cols-7 gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dayIndex) => {
                        // Find availability for this day (dayIndex + 1 because dayIndex is 0-based but day_of_week is 1-based)
                        const dayOfWeek = dayIndex + 1;
                        const availability = event.serviceeventavailability?.find(avail => avail.day_of_week === dayOfWeek);
                        
                        // Parse time values for the input fields
                        const startTime = availability?.time_start ? availability.time_start.substring(0, 5) : '';
                        const endTime = availability?.time_end ? availability.time_end.substring(0, 5) : '';
                        
                        // Check if this day is enabled (has availability)
                        const isDayEnabled = availability !== undefined;
                        
                        return (
                          <div key={day} className="text-center">
                            <div className="text-[10px] font-medium mb-1 text-[var(--dashboard-text-secondary)]">
                              {day.slice(0, 3)}
                            </div>
                            
                            {/* Toggle Switch */}
                            <div className="flex justify-center mb-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedEvents = [...events];
                                  const currentEvent = updatedEvents[index];
                                  
                                  // Initialize serviceeventavailability array if it doesn't exist
                                  if (!currentEvent.serviceeventavailability) {
                                    currentEvent.serviceeventavailability = [];
                                  }
                                  
                                  if (isDayEnabled) {
                                    // Remove availability for this day
                                    currentEvent.serviceeventavailability = currentEvent.serviceeventavailability.filter(
                                      avail => avail.day_of_week !== dayOfWeek
                                    );
                                  } else {
                                    // Add availability for this day
                                    const newAvailability = {
                                      availability_id: Date.now() + dayIndex, // Temporary ID
                                      day_of_week: dayOfWeek,
                                      time_start: '08:00:00',
                                      time_end: '18:00:00',
                                      is_recurring: true,
                                      date_effective_from: null,
                                      date_effective_to: null
                                    };
                                    currentEvent.serviceeventavailability.push(newAvailability);
                                  }
                                  
                                  setEvents(updatedEvents);
                                }}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  isDayEnabled
                                    ? 'bg-blue-600 focus:ring-blue-500'
                                    : 'bg-gray-200 focus:ring-gray-500'
                                } ${theme === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'}`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                    isDayEnabled ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                            
                            <div className={`flex flex-col space-y-1 ${!isDayEnabled ? 'opacity-50' : ''}`}>
                              <input
                                type="time"
                                value={startTime}
                                disabled={!isDayEnabled}
                                onChange={(e) => {
                                  if (!isDayEnabled) return; // Don't allow changes if day is disabled
                                  
                                  const updatedEvents = [...events];
                                  const currentEvent = updatedEvents[index];
                                  
                                  // Initialize serviceeventavailability array if it doesn't exist
                                  if (!currentEvent.serviceeventavailability) {
                                    currentEvent.serviceeventavailability = [];
                                  }
                                  
                                  // Find or create availability for this day
                                  let dayAvailability = currentEvent.serviceeventavailability.find(avail => avail.day_of_week === dayOfWeek);
                                  if (!dayAvailability) {
                                    dayAvailability = {
                                      availability_id: Date.now() + dayIndex, // Temporary ID
                                      day_of_week: dayOfWeek,
                                      time_start: '08:00:00',
                                      time_end: '18:00:00',
                                      is_recurring: true,
                                      date_effective_from: null,
                                      date_effective_to: null
                                    };
                                    currentEvent.serviceeventavailability.push(dayAvailability);
                                  }
                                  
                                  // Update the start time
                                  dayAvailability.time_start = e.target.value + ':00';
                                  setEvents(updatedEvents);
                                }}
                                className={`w-full px-2 py-1 text-xs border rounded bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)] ${!isDayEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                placeholder="Start"
                              />
                              <input
                                type="time"
                                value={endTime}
                                disabled={!isDayEnabled}
                                onChange={(e) => {
                                  if (!isDayEnabled) return; // Don't allow changes if day is disabled
                                  
                                  const updatedEvents = [...events];
                                  const currentEvent = updatedEvents[index];
                                  
                                  // Initialize serviceeventavailability array if it doesn't exist
                                  if (!currentEvent.serviceeventavailability) {
                                    currentEvent.serviceeventavailability = [];
                                  }
                                  
                                  // Find or create availability for this day
                                  let dayAvailability = currentEvent.serviceeventavailability.find(avail => avail.day_of_week === dayOfWeek);
                                  if (!dayAvailability) {
                                    dayAvailability = {
                                      availability_id: Date.now() + dayIndex, // Temporary ID
                                      day_of_week: dayOfWeek,
                                      time_start: '08:00:00',
                                      time_end: '18:00:00',
                                      is_recurring: true,
                                      date_effective_from: null,
                                      date_effective_to: null
                                    };
                                    currentEvent.serviceeventavailability.push(dayAvailability);
                                  }
                                  
                                  // Update the end time
                                  dayAvailability.time_end = e.target.value + ':00';
                                  setEvents(updatedEvents);
                                }}
                                className={`w-full px-2 py-1 text-xs border rounded bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)] ${!isDayEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                                placeholder="End"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                 </div>
               ))}
                                                    </div>

              {/* Add Event Form */}
              <div className="mt-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className={`text-md font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Add New Event
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={newEvent.event_name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, event_name: e.target.value }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="Event Name"
                    />
                                         <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                     }`}>
                       Event Name
                     </span>
                  </div>
                                      <div className="relative">
                      <input
                        type="text"
                        value={newEvent.event_description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, event_description: e.target.value }))}
                        className={`w-full px-3 py-2 pr-24 border rounded-lg ${
                          theme === 'dark'
                            ? 'bg-zinc-700 border-gray-700 text-gray-100'
                            : 'bg-white border-gray-200 text-gray-900'
                        }`}
                        placeholder="Description"
                      />
                     <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                     }`}>
                       Description
                     </span>
                    </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={newEvent.duration_minutes}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="60"
                    />
                                         <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                     }`}>
                       Duration
                     </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={newEvent.slot_interval_minutes}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, slot_interval_minutes: parseInt(e.target.value) || 15 }))}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-zinc-700 border-gray-700 text-gray-100' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                      placeholder="15"
                      min="5"
                      step="5"
                    />
                                         <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium transition-opacity duration-200 ${
                       theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                     }`}>
                       Interval
                     </span>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={addEvent}
                      disabled={!newEvent.event_name.trim()}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        !newEvent.event_name.trim()
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Add Event
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

           {/* Consent Options - Full Width */}
          {activeTab === 'consent' && (
            <div className="mb-8">
            <div className="space-y-3">
              {/* Require Phone Number Toggle */}
              <div className="border rounded-xl p-4 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-[var(--dashboard-text-primary)]">
                    Require Phone Number
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_phone}
                    onChange={(e) => handleInputChange('require_phone', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      theme === 'dark' ? 'after:bg-gray-200' : 'after:bg-white'
                    }`}></div>
                </label>
                </div>
              </div>

              {/* Require Newsletter Consent Toggle */}
              <div className="border rounded-xl p-4 shadow-sm border-[var(--dashboard-border-primary)] bg-[var(--dashboard-bg-card)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs md:text-sm font-medium text-[var(--dashboard-text-primary)]">
                    Require Newsletter Consent
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.require_consent_newsletter}
                    onChange={(e) => handleInputChange('require_consent_newsletter', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${
                      theme === 'dark' ? 'after:bg-gray-200' : 'after:bg-white'
                    }`}></div>
                </label>
              </div>

              {formData.require_consent_newsletter && (
                <div>
                    <label className="block text-xs md:text-sm font-medium mb-2 text-[var(--dashboard-text-secondary)]">
                    Newsletter Consent Text
                  </label>
                  <textarea
                    value={formData.require_consent_newsletter_text}
                    onChange={(e) => handleInputChange('require_consent_newsletter_text', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-[var(--dashboard-bg-input)] border-[var(--dashboard-border-primary)] text-[var(--dashboard-text-primary)]"
                    rows={3}
                    placeholder="Enter custom newsletter consent text..."
                  />
                </div>
              )}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-between items-center p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {/* Left side - Add button for current tab */}
          <div>
            {getAddButtonForTab()}
          </div>
          
          {/* Right side - Cancel and Save buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 lg:px-6 lg:py-3 rounded-lg transition-colors text-sm lg:text-base bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
            >
              {tCommon("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
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
    </div>
  )
}
