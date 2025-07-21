import { useState } from "react"
import { useTranslations } from "next-intl"
import { SignatureRequestDetails } from "@/types/service-board"

interface Props {
  details: SignatureRequestDetails
  onUpdate: () => void
}

export default function SignatureRequest({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'type' | 'upload'>(details.signature_method)
  const [signatureData, setSignatureData] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleSign = async () => {
    try {
      const response = await fetch(`/api/service-board/signature-request/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureMethod,
          signatureData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit signature')
      }

      onUpdate()
    } catch (error) {
      console.error('Error submitting signature:', error)
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/service-board/signature-request/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject signature request')
      }

      onUpdate()
    } catch (error) {
      console.error('Error rejecting signature request:', error)
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
          <span className="font-medium">Rejected</span>
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
      <div>
        <h4 className="text-sm font-medium text-gray-900">Document to Sign</h4>
        <div className="mt-2">
          <a
            href={details.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="mr-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            {t('viewDocument', { documentName: details.document_name })}
          </a>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-900">Signature Method</label>
        <div className="mt-2 space-y-4">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setSignatureMethod('draw')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                signatureMethod === 'draw'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setSignatureMethod('type')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                signatureMethod === 'type'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Type
            </button>
            <button
              type="button"
              onClick={() => setSignatureMethod('upload')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                signatureMethod === 'upload'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Upload
            </button>
          </div>

          {signatureMethod === 'draw' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-sm text-gray-500 text-center">
                Drawing pad will be implemented here
              </div>
            </div>
          )}

          {signatureMethod === 'type' && (
            <input
              type="text"
              value={signatureData}
              onChange={(e) => setSignatureData(e.target.value)}
              placeholder="Type your full name"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          )}

          {signatureMethod === 'upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">Upload a signature image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setSignatureData(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="mt-2 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>



      <div className="flex items-center justify-between space-x-4">
        <button
          type="button"
          onClick={() => {
            const rejectDialog = document.getElementById('reject-dialog')
            if (rejectDialog instanceof HTMLDialogElement) {
              rejectDialog.showModal()
            }
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={handleSign}
          disabled={!signatureData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Sign Document
        </button>
      </div>

      <dialog
        id="reject-dialog"
        className="rounded-lg shadow-xl p-6 max-w-sm w-full"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Reject Document
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
              Reason for Rejection
            </label>
            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Please provide a reason for rejecting this document"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                const rejectDialog = document.getElementById('reject-dialog')
                if (rejectDialog instanceof HTMLDialogElement) {
                  rejectDialog.close()
                }
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleReject()
                const rejectDialog = document.getElementById('reject-dialog')
                if (rejectDialog instanceof HTMLDialogElement) {
                  rejectDialog.close()
                }
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reject
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
} 