import { useState } from "react"
import { useTranslations } from "next-intl"
import { InformationRequestDetails } from "@/types/service-board"

interface Props {
  details: InformationRequestDetails
  onUpdate: () => void
}

export default function InformationRequest({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [formData, setFormData] = useState<Record<string, any>>(details.customer_response || {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/service-board/information-request/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit information')
      }

      onUpdate()
    } catch (error) {
      console.error('Error submitting information:', error)
      // You might want to show an error message to the user here
    }
  }

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {details.request_fields.map((field, index) => (
        <div key={index} className="space-y-2">
          <label 
            htmlFor={`field-${index}`}
            className="block text-sm font-medium text-gray-700"
          >
            {field.field_name}
            {field.is_required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.field_type === 'textarea' ? (
            <textarea
              id={`field-${index}`}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="p-2 mt-1 block w-full rounded-md border bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={3}
              placeholder={`${field.field_name.toLowerCase()}`}
              required={field.is_required}
            />
          ) : field.field_type === 'select' && field.options ? (
            <select
              id={`field-${index}`}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="p-2 mt-1 block w-full rounded-md border bg-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required={field.is_required}
            >
              <option value="">{t('selectAnOption')}</option>
              {field.options.map((option, optIndex) => (
                <option key={optIndex} value={option}>{option}</option>
              ))}
            </select>
          ) : field.field_type === 'checkbox' ? (
            <input
              id={`field-${index}`}
              type="checkbox"
              checked={formData[field.field_name] || false}
              onChange={(e) => handleInputChange(field.field_name, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required={field.is_required}
            />
          ) : (
            <input
              id={`field-${index}`}
              type={field.field_type}
              value={formData[field.field_name] || ''}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
              className="mt-1 p-2 block w-full rounded-md border bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder={`${field.field_name.toLowerCase()}`}
              required={field.is_required}
              {...(field.validation?.min !== undefined && { min: field.validation.min })}
              {...(field.validation?.max !== undefined && { max: field.validation.max })}
              {...(field.validation?.pattern && { pattern: field.validation.pattern })}
            />
          )}
        </div>
      ))}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {details.submission_status === 'submitted' && details.submission_date && (
            <span>{t('submittedOn')} {new Date(details.submission_date).toLocaleDateString()}</span>
          )}
        </div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={details.submission_status === 'submitted'}
        >
          {t('submit')}
        </button>
      </div>
    </form>
  )
} 