import { useTranslations } from "next-intl"
import { useState } from 'react'
import { SignatureRequestDetails } from "@/types/service-board"

interface Props {
  details: SignatureRequestDetails
  onUpdate: () => void
  action_id: string
}

export default function SignatureRequest({ details, onUpdate, action_id }: Props) {
  const t = useTranslations("ServiceBoard")
  const [isViewing, setIsViewing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSecureView = async () => {
    setIsViewing(true)
    setError(null)
    try {
      const resp = await fetch(`/api/service-board/actions/${action_id}/document-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'View failed')
      }
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      // Open in new tab for viewing
      window.open(url, '_blank')
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsViewing(false)
    }
  }

  const handleSecureDownload = async () => {
    setIsDownloading(true)
    setError(null)
    try {
      const resp = await fetch(`/api/service-board/actions/${action_id}/document-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'Download failed')
      }
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = details.document_name || 'document'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsDownloading(false)
    }
  }

  if (details.signature_status === 'signed') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t('signedOn')} {new Date(details.signature_date!).toLocaleDateString()}</span>
        </div>
        {details.signature_image_url && (
          <div className="mt-4">
            <img
              src={details.signature_image_url}
              alt="Signature"
              className="max-w-sm border rounded-lg shadow-sm"
            />
          </div>
        )}
      </div>
    )
  }

  if (details.signature_status === 'rejected') {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{t('rejected')}</span>
        </div>
        {details.rejection_reason && (
          <div className="mt-2 text-sm text-gray-600">
            {t('reason')}: {details.rejection_reason}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Urgency Level Display */}
      {details.urgency_level && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Urgency:</span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            details.urgency_level === 'high' 
              ? 'bg-red-100 text-red-800' 
              : details.urgency_level === 'medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {details.urgency_level === 'high' ? 'High' : 
             details.urgency_level === 'medium' ? 'Medium' : 'Low'}
          </span>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-900 mb-2 lg:mb-3 hidden">Document to Sign</p>
        <div className="mt-2">
          {details.document_method === 'email' ? (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
               <div className="flex items-center space-x-2 md:space-x-3">
                 <div className="flex-shrink-0">
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                     <svg className="h-4 w-4 md:h-5 md:w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                     </svg>
                   </div>
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="text-blue-900">
                     <p className="text-sm md:text-base font-medium">
                       Documento inviato a <span className="font-semibold">{details.email_address}</span> il giorno <span className="font-medium">{details.email_date ? new Date(details.email_date).toLocaleDateString('it-IT') : 'data non specificata'}</span>
                     </p>
                     {details.document_name && (
                       <p className="text-xs text-blue-700 mt-1">
                         <span className="font-medium">Titolo:</span> {details.document_name}
                       </p>
                     )}
                   </div>
                 </div>
               </div>
             </div>
                     ) : (
                                         <div className="bg-gradient-to-t from-blue-50 to-white border-2 border-blue-200 rounded-lg p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-2 md:space-x-3">
                                         {/* Edit Icon */}
                     <div className="p-1.5 md:p-2 bg-blue-100 text-blue-600 rounded-lg">
                       <img src="/icons/sanity/edit.svg" alt="Edit" className="w-5 h-5 md:w-7 md:h-7" />
                     </div>
                    {/* File Type Icon */}
                    <div className="flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Document Title */}
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm md:text-base font-medium text-gray-900 truncate">
                        {details.document_name || t('document')}
                      </h5>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <button
                      onClick={handleSecureView}
                      disabled={isViewing}
                      className="hidden items-center px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg className="mr-1.5 md:mr-2 h-3 w-3 md:h-4 md:w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {isViewing ? t('loading') : t('view')}
                    </button>
                    <button
                      onClick={handleSecureDownload}
                      disabled={isDownloading}
                      className="inline-flex items-center px-2 py-1.5 md:px-3 md:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 text-xs md:text-sm font-medium"
                    >
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {isDownloading ? t('downloading') : t("download")}
                    </button>
                  </div>
                </div>
               {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
             </div>
           )}
        </div>
      </div>
    </div>
  )
} 