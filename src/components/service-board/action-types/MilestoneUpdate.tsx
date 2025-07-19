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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {details.is_completed ? (
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
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {details.milestone_name}
            </h3>
            {details.progress_percentage !== undefined && (
              <div className="mt-1">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {details.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${details.progress_percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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