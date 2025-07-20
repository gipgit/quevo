"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { 
  DocumentDownload,
  PaymentRequest,
  AppointmentScheduling,
  InformationRequest,
  GenericMessage,
  SignatureRequest,
  ApprovalRequest,
  FeedbackRequest,
  MilestoneUpdate,
  ResourceLink,
  Checklist,
  VideoMessage,
  OptInRequest
} from "./action-types"
import { 
  ServiceBoardAction,
  isDocumentDownloadDetails,
  isPaymentRequestDetails,
  isAppointmentSchedulingDetails,
  isInformationRequestDetails,
  isGenericMessageDetails,
  isFeedbackRequestDetails,
  isMilestoneUpdateDetails,
  isResourceLinkDetails,
  isSignatureRequestDetails,
  isApprovalRequestDetails,
  isChecklistDetails,
  isVideoMessageDetails,
  isOptInRequestDetails
} from "@/types/service-board"

interface Props {
  action: ServiceBoardAction
  onActionUpdate: () => void
  onAppointmentConfirmed?: () => void
}

function getStatusText(status: string): string {
  switch (status.toLowerCase()) {
    case "in_progress":
      return "In Progress";
    case "pending":
    case "completed":
    case "cancelled":
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    default:
      return status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-300 text-yellow-800"
    case "completed":
      return "bg-green-300 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}



export default function ServiceBoardActionCard({ action, onActionUpdate, onAppointmentConfirmed }: Props) {
  const t = useTranslations("ServiceBoard")
  const [isExpanded, setIsExpanded] = useState(true) // Always start expanded

  const renderActionContent = () => {
    const details = action.action_details

    switch (action.action_type) {
      case "document_download":
        if (isDocumentDownloadDetails(details)) {
          return <DocumentDownload details={details} />
        }
        break
      case "payment_request":
        if (isPaymentRequestDetails(details)) {
          return <PaymentRequest details={details} onUpdate={onActionUpdate} />
        }
        break
      case "appointment-scheduling":
      case "appointment_scheduling":
        if (isAppointmentSchedulingDetails(details)) {
          return <AppointmentScheduling 
            details={details} 
            onUpdate={onActionUpdate} 
            action_id={action.action_id}
            onAppointmentConfirmed={onAppointmentConfirmed}
          />
        }
        break
      default:
        // Check if it's an appointment scheduling action with different casing or formatting
        if (action.action_type && action.action_type.toLowerCase().includes('appointment') && action.action_type.toLowerCase().includes('scheduling')) {
          if (isAppointmentSchedulingDetails(details)) {
            return <AppointmentScheduling 
              details={details} 
              onUpdate={onActionUpdate} 
              action_id={action.action_id}
              onAppointmentConfirmed={onAppointmentConfirmed}
            />
          }
        }
        break
      case "information_request":
        if (isInformationRequestDetails(details)) {
          return <InformationRequest details={details} onUpdate={onActionUpdate} />
        }
        break
      case "generic_message":
        if (isGenericMessageDetails(details)) {
          return <GenericMessage details={details} />
        }
        break
      case "feedback_request":
        if (isFeedbackRequestDetails(details)) {
          return <FeedbackRequest details={details} onUpdate={onActionUpdate} />
        }
        break
      case "milestone_update":
        if (isMilestoneUpdateDetails(details)) {
          return <MilestoneUpdate details={details} />
        }
        break
      case "resource_link":
        if (isResourceLinkDetails(details)) {
          return <ResourceLink details={details} />
        }
        break
      case "signature_request":
        if (isSignatureRequestDetails(details)) {
          return <SignatureRequest details={details} onUpdate={onActionUpdate} />
        }
        break
      case "approval_request":
        if (isApprovalRequestDetails(details)) {
          return <ApprovalRequest details={details} onUpdate={onActionUpdate} />
        }
        break
      case "checklist":
        if (isChecklistDetails(details)) {
          return <Checklist details={details} onUpdate={onActionUpdate} />
        }
        break
      case "video_message":
        if (isVideoMessageDetails(details)) {
          return <VideoMessage details={details} onUpdate={onActionUpdate} />
        }
        break
      case "opt_in_request":
        if (isOptInRequestDetails(details)) {
          return <OptInRequest details={details} onUpdate={onActionUpdate} />
        }
        break
    }

    return (
      <div className="text-red-600">
        <div>Invalid action details for type: {action.action_type}</div>
        <div className="text-xs mt-2">
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  const shouldShowExpandButton = action.action_status === 'completed'

  return (
    <div className={`
      ${action.is_customer_action_required && action.action_status !== 'completed' ? "border-[1px] rounded-2xl border-gray-400 p-6 shadow-sm bg-white" : "rounded-2xl border border-1 border-gray-500 p-6"}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div>
            <div className="flex items-center flex-wrap gap-1 mb-2">
              <span className="text-gray-500 text-xs">
                {format(new Date(action.created_at), "PPP")}
              </span>
              <span className={`
                px-3 py-1 rounded-full text-xs md:text-md
                ${getStatusColor(action.action_status)}
              `}>
                {getStatusText(action.action_status)}
              </span>
              {action.is_customer_action_required && action.action_status !== 'completed' && (
                <span className="px-2 py-1 rounded-full bg-blue-600 text-blue-100 text-xs md:text-md font-medium">
                  {t("actionRequired")}
                </span>
              )}
              {action.due_date && (
                <span className="text-orange-600 text-xs md:text-md">
                  {t("dueBy")}: {format(new Date(action.due_date), "PPP")}
                </span>
              )}
            </div>
          <h3 className="text-xl md:text-2xl font-bold mb-1">{action.action_title}</h3>
          <p className="text-gray-500 text-xs md:text-sm">{action.action_description}</p>
        </div>
        {shouldShowExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-1 pt-4 border-t">
          {renderActionContent()}
        </div>
      )}
    </div>
  )
} 