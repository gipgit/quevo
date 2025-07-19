import { useState } from "react"
import { useTranslations } from "next-intl"
import { ApprovalRequestDetails } from "@/types/service-board"

interface Props {
  details: ApprovalRequestDetails
  onUpdate: () => void
}

export default function ApprovalRequest({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [approverNotes, setApproverNotes] = useState("")

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/service-board/approval-request/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: approverNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve request')
      }

      onUpdate()
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/service-board/approval-request/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: approverNotes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject request')
      }

      onUpdate()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {details.request_title}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {details.request_description}
        </p>
      </div>

      {details.attachments && details.attachments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
          <ul className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            {details.attachments.map((attachment, index) => (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 flex-1 w-0 truncate text-sm text-gray-500">
                    {attachment.name}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-900">Required Approvers</h4>
        <ul className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
          {details.required_approvers.map((approver, index) => (
            <li key={index} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                  <p className="text-sm text-gray-500">{approver.role}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(approver.status)}
                  {approver.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(approver.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {details.approval_status === 'pending' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Add any notes about your decision"
              value={approverNotes}
              onChange={(e) => setApproverNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Approve
            </button>
          </div>
        </div>
      )}

      {details.approval_status !== 'pending' && (
        <div className="bg-gray-50 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              {details.approval_status === 'approved' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                Request {details.approval_status}
              </h3>
              {details.approval_date && (
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(details.approval_date).toLocaleDateString()}
                </p>
              )}
              {details.approver_notes && (
                <p className="mt-2 text-sm text-gray-700">
                  {details.approver_notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 