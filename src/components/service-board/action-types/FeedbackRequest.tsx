import { useState } from "react"
import { useTranslations } from "next-intl"
import { FeedbackRequestDetails } from "@/types/service-board"

interface Props {
  details: FeedbackRequestDetails
  onUpdate: () => void
}

export default function FeedbackRequest({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [responses, setResponses] = useState<Record<string, any>>(details.responses || {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`/api/service-board/feedback-request/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      onUpdate()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // You might want to show an error message to the user here
    }
  }

  const handleResponseChange = (questionIndex: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: value
    }))
  }

  if (details.submission_status === 'submitted') {
    return (
      <div className="text-sm text-gray-500">
        Thank you for your feedback! Submitted on {new Date(details.submitted_date!).toLocaleDateString()}
      </div>
    )
  }

  if (details.survey_url) {
    return (
      <div>
        <p className="text-sm text-gray-600 mb-4">{details.survey_title}</p>
        <a
          href={details.survey_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Open Survey
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {details.questions.map((question, index) => (
        <div key={index} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.question_text}
          </label>

          {question.question_type === 'rating' ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleResponseChange(index, rating)}
                  className={`w-10 h-10 rounded-full ${
                    responses[index] === rating
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          ) : question.question_type === 'multiple_choice' && question.options ? (
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={responses[index] === option}
                    onChange={(e) => handleResponseChange(index, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={responses[index] || ''}
              onChange={(e) => handleResponseChange(index, e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your response"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('submit')}
        </button>
      </div>
    </form>
  )
} 