import { ResourceLinkDetails } from "@/types/service-board"
import { useTranslations } from "next-intl"

interface Props {
  details: ResourceLinkDetails
}

export default function ResourceLink({ details }: Props) {
  const t = useTranslations("ServiceBoard")
  const getResourceIcon = (type?: string) => {
    if (!type || typeof type !== 'string') {
      return (
        <svg className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      )
    }
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
      case 'video':
        return (
          <svg className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        )
      case 'image':
        return (
          <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      case 'document':
        return (
          <svg className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        )
      case 'website':
      case 'link':
      case 'url':
        return (
          <svg className="h-6 w-6 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-1.414 1.414a1 1 0 11-1.414-1.414l1.414-1.414a2 2 0 10-2.828-2.828l-3 3a2 2 0 000 2.828 1 1 0 11-1.414 1.414 4 4 0 010-5.656l3-3zm-5 5a2 2 0 012.828 0l1.414 1.414a1 1 0 01-1.414 1.414L9 11.414a2 2 0 11-2.828-2.828l1.414-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-2 lg:space-y-4">
      <div className="flex items-start space-x-2 lg:space-x-4">
        <div className="flex-shrink-0">
          {getResourceIcon(details.resource_type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm lg:text-lg font-medium text-gray-900">
            {details.resource_title || t('resource')}
          </h3>
          {details.description && (
            <p className="mt-1 text-sm text-gray-500">
              {details.description}
            </p>
          )}
        </div>
      </div>

      <div>
        <a
          href={details.resource_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            inline-flex items-center px-2 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium
            ${details.requires_login
              ? 'text-blue-600 hover:text-blue-700'
              : 'text-blue-800  hover:text-blue-900'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          `}
        >
          {details.is_external && (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          )}
          {details.requires_login ? t('loginAndAccessResource') : t('accessResource')}
        </a>
      </div>

      {details.customer_notes && (
        <div className="mt-4 bg-gray-50 rounded-md p-4">
          <p className="text-sm text-gray-700">{details.customer_notes}</p>
        </div>
      )}
    </div>
  )
} 