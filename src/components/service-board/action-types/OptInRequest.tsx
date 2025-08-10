import { useState } from "react"
import { useTranslations } from "next-intl"
import { OptInRequestDetails } from "@/types/service-board"

interface Props {
  details: OptInRequestDetails
  onUpdate: () => void
}

export default function OptInRequest({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOptIn = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/service-board/opt-in/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: details.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to opt in')
      }

      onUpdate()
    } catch (error) {
      console.error('Error opting in:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOptOut = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/service-board/opt-in/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: details.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to opt out')
      }

      onUpdate()
    } catch (error) {
      console.error('Error opting out:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (details.status === 'accepted') {
    return (
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Opted In Successfully
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>You have opted in to {details.service || ''}</p>
            </div>
            {details.accepted_at && (
              <div className="mt-1 text-xs text-green-700">
                Accepted on {details.accepted_at ? new Date(details.accepted_at).toLocaleDateString() : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (details.status === 'declined') {
    return (
      <div className="rounded-md bg-gray-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              Opted Out
            </h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>You have opted out of {details.service || ''}</p>
            </div>
            {details.declined_at && (
              <div className="mt-1 text-xs text-gray-700">
                Declined on {details.declined_at ? new Date(details.declined_at).toLocaleDateString() : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {details.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {details.description}
        </p>
      </div>

      {details.terms && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                Please review our terms and conditions before proceeding.
              </p>
              <p className="mt-3 text-sm md:mt-0 md:ml-6">
                <a
                  href={details.terms}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                >
                  View terms
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {details.benefits && details.benefits.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Benefits</h4>
          <ul className="space-y-3">
            {details.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-600">{benefit}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleOptOut}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Declining...' : 'Decline'}
        </button>
        <button
          type="button"
          onClick={handleOptIn}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Accepting...' : 'Accept'}
        </button>
      </div>
    </div>
  )
} 