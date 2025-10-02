"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { useLocale } from "next-intl"
import { enUS, it } from "date-fns/locale"
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
import FallbackRenderer from "./action-types/FallbackRenderer"
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
import { transformActionDetailsForRendering, validateActionDetails, getMissingFields } from "@/lib/action-data-transformer"

interface Props {
  action: ServiceBoardAction
  onActionUpdate: () => void
  onAppointmentConfirmed?: () => void
}

function getStatusText(status: string, t: any): string {
  switch (status.toLowerCase()) {
    case "in_progress":
      return t('inProgress');
    case "pending":
      return t('pending');
    case "completed":
      return t('completed');
    case "cancelled":
      return t('cancelled');
    default:
      return status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
}

// Updated to use border-bottom instead of background colors
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "text-gray-700 border-b-2 border-yellow-500"
    case "completed":
      return "text-gray-700 border-b-2 border-green-500"
    case "in_progress":
      return "text-gray-700 border-b-2 border-blue-500"
    case "cancelled":
      return "text-gray-700 border-b-2 border-red-500"
    default:
      return "text-gray-700 border-b-2 border-gray-500"
  }
}



export default function ServiceBoardActionCard({ action, onActionUpdate, onAppointmentConfirmed }: Props) {
  const t = useTranslations("ServiceBoard")
  const locale = useLocale()
  const [isExpanded, setIsExpanded] = useState(true) // Always start expanded

  const renderActionContent = () => {
    // Transform action details to ensure compatibility with renderers
    const details = transformActionDetailsForRendering(action.action_details, action.action_type)
    
    // Validate the transformed details
    const isValid = validateActionDetails(details, action.action_type)
    const missingFields = getMissingFields(details, action.action_type)
    
    // If validation fails, show fallback renderer
    if (!isValid) {
      return <FallbackRenderer 
        actionType={action.action_type} 
        details={action.action_details} 
        missingFields={missingFields}
      />
    }

    // Centralized renderer registry for maintainability
    const normalizeType = (type: string) => (type || '').toLowerCase().replace(/-/g, '_').trim()
    const normalizedType = normalizeType(action.action_type)
    const rendererMap: Record<string, () => JSX.Element | null> = {
      'document_download': () => isDocumentDownloadDetails(details) ? <DocumentDownload details={details} action_id={action.action_id} /> : null,
      'payment_request': () => isPaymentRequestDetails(details) ? <PaymentRequest details={details} onUpdate={onActionUpdate} action_id={action.action_id} /> : null,
      'appointment_scheduling': () => isAppointmentSchedulingDetails(details) ? (
        <AppointmentScheduling
          details={details}
          onUpdate={onActionUpdate}
          action_id={action.action_id}
          onAppointmentConfirmed={onAppointmentConfirmed}
        />
      ) : null,
      'information_request': () => isInformationRequestDetails(details) ? <InformationRequest details={details} onUpdate={onActionUpdate} /> : null,
      'generic_message': () => isGenericMessageDetails(details) ? <GenericMessage details={details} /> : null,
      'feedback_request': () => isFeedbackRequestDetails(details) ? <FeedbackRequest details={details} onUpdate={onActionUpdate} /> : null,
      'milestone_update': () => isMilestoneUpdateDetails(details) ? <MilestoneUpdate details={details} /> : null,
      'resource_link': () => isResourceLinkDetails(details) ? <ResourceLink details={details} /> : null,
      'signature_request': () => isSignatureRequestDetails(details) ? <SignatureRequest details={details} onUpdate={onActionUpdate} action_id={action.action_id} /> : null,
      'approval_request': () => isApprovalRequestDetails(details) ? <ApprovalRequest details={details} onUpdate={onActionUpdate} /> : null,
      'checklist': () => isChecklistDetails(details) ? <Checklist details={details} onUpdate={onActionUpdate} action_id={action.action_id} /> : null,
      'video_message': () => isVideoMessageDetails(details) ? <VideoMessage details={details} onUpdate={onActionUpdate} /> : null,
      'opt_in_request': () => isOptInRequestDetails(details) ? <OptInRequest details={details} onUpdate={onActionUpdate} /> : null,
    }

    const renderer = rendererMap[normalizedType] || (normalizedType.includes('appointment') && normalizedType.includes('scheduling') ? rendererMap['appointment_scheduling'] : undefined)
    if (renderer) {
      const node = renderer()
      if (node) return node
    }

    // If no renderer found, show fallback renderer
    return <FallbackRenderer 
      actionType={action.action_type} 
      details={action.action_details} 
      missingFields={missingFields}
    />
  }

  const shouldShowExpandButton = action.action_status === 'completed'

  return (
    <div className={`p-5 md:p-6 lg:p-7 rounded-2xl text-center lg:text-left 
      ${action.is_customer_action_required && action.action_status !== 'completed' ? "bg-white border-[1px] border-gray-300 shadow-sm" : "bg-white border-[1px] border-gray-200"}
    `}>
      <div className="flex items-start justify-between mb-4">
        <div>
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
        <div className="mt-1 pt-2 lg:pt-3 border-t text-center lg:text-left">
          {renderActionContent()}
        </div>
      )}

      {/* Status and Action Required Pills - moved to the end */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center lg:justify-start flex-wrap gap-2">
          <span className="text-gray-600 text-xs lg:text-base">
            {format(new Date(action.created_at), "PPP", { locale: locale === 'it' ? it : enUS })}
          </span>
          <span className={`
            text-xs md:text-md font-medium
            ${getStatusColor(action.action_status)}
          `}>
            {getStatusText(action.action_status, t)}
          </span>
          {action.is_customer_action_required && action.action_status !== 'completed' && (
            <span className="px-2 py-1 rounded-full text-blue-600 text-xs md:text-md font-medium">
              {t("actionRequired")}
            </span>
          )}
          {action.due_date && (
            <span className="text-gray-600 text-xs md:text-md flex items-center gap-1">
              <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">!</span>
              {t("dueBy")}: {format(new Date(action.due_date), "PPP", { locale: locale === 'it' ? it : enUS })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 