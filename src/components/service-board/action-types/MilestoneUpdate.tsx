import { MilestoneUpdateDetails } from "@/types/service-board"

interface Props {
  details: MilestoneUpdateDetails
}

export default function MilestoneUpdate({ details }: Props) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Normalize for compatibility with form-generator fields
  const progress = typeof details.progress_percentage === 'number' ? Math.max(0, Math.min(100, details.progress_percentage)) : 0
  const isCompleted = !!details.is_completed || progress === 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-xl bg-white">
        <div className="flex items-center min-w-0">
          {isCompleted ? (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className="ml-4 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {details.milestone_name}
            </h3>
          </div>
        </div>
        {/* Right icon (duplicate small state icon) for symmetry */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {typeof progress === 'number' && (
        <div className="px-1">
          <div className="flex mb-1 items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-semibold text-gray-700">{progress}%</span>
          </div>
          <div className="overflow-hidden h-2 rounded bg-blue-100">
            <div style={{ width: `${progress}%` }} className="h-2 bg-blue-500" />
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 space-y-2">
        {details.estimated_completion_date && (
          <p>
            Estimated completion: {formatDate(details.estimated_completion_date)}
          </p>
        )}
        {details.actual_completion_date && (
          <p>
            Completed on: {formatDate(details.actual_completion_date)}
          </p>
        )}
        {details.dependencies && details.dependencies.length > 0 && (
          <div>
            <p className="font-medium text-gray-700">Dependencies:</p>
            <ul className="list-disc list-inside mt-1">
              {details.dependencies.map((dep, index) => (
                <li key={index}>{dep}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {details.customer_notes && (
        <div className="mt-4 bg-gray-50 rounded-md p-4">
          <p className="text-sm text-gray-700">{details.customer_notes}</p>
        </div>
      )}
    </div>
  )
} 