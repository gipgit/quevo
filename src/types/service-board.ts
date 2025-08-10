// Base interface for all action types
export interface BaseActionDetails {
  action_id?: string;  // Made optional since it's not always present
  created_at?: string;
  updated_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  customer_notes?: string;
  currency?: string;  // Added for currency formatting support
}

// Type definitions for service board actions
export type LocationType = 'online' | 'in_person';
export type MeetingApp = 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Other';
export type ConfirmationStatus = 'pending_customer' | 'confirmed' | 'rejected' | 'rescheduled' | 'cancelled';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type ActionPriority = 'low' | 'medium' | 'high';

// Document Download
export interface DocumentDownloadDetails {
  document_name: string;
  download_url: string;
  file_type: string;
}

// Payment Request
export interface PaymentRequestDetails extends BaseActionDetails {
  amount: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_reason?: string; // Reason for the payment
  hidden_payment_methods?: string[]; // Array of payment method IDs to hide (legacy)
  allowed_payment_methods?: string[]; // Array of payment method keys to show (preferred)
  available_payment_methods?: {
    id: string;
    label: string;
    details?: Record<string, any>;
  }[]; // Explicitly stored selected methods with details
  payment_declared_confirmed?: boolean; // Customer declared payment done
  payment_confirmation?: {
    confirmed_at: string;
    method_used: string;
    note?: string;
    paid_date?: string; // YYYY-MM-DD when user declared only a date
    declared_at?: string; // when the declaration was submitted
  };
}

// Appointment Scheduling
export type AppointmentSchedulingMode = 'fixed_confirmed' | 'fixed_pending_confirmation' | 'multiple_choice';
export type AppointmentSchedulingDetails = BaseActionDetails & {
  appointment_title: string;
  appointment_type: 'online' | 'in_person';
  appointment_mode: AppointmentSchedulingMode;
  address: string | null;
  confirmation_status: 'pending_customer' | 'confirmed' | 'cancelled' | 'rejected' | 'rescheduled';
  datetimes_options: string[];
  datetime_confirmed?: string | null;
  platform_confirmed?: string | null;
  platform_options?: string[];
  platforms_selected?: string[] | null;
  appointment_id?: string | null;
  reschedule_reason?: string | null;
};

// Information Request
export interface InformationRequestDetails {
  request_fields: {
    field_name: string;
    field_type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    is_required: boolean;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  }[];
  customer_response?: Record<string, any>;
  submission_status: 'pending' | 'submitted';
  submission_date?: string;
}

// Generic Message
export interface GenericMessageDetails {
  message_content: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  requires_acknowledgment?: boolean;
  acknowledged_at?: string;
}

// Feedback Request
export interface FeedbackRequestDetails {
  questions: {
    question_text: string;
    question_type: 'rating' | 'multiple_choice' | 'text';
    options?: string[];
  }[];
  responses?: Record<number, any>;
  submission_status: 'pending' | 'submitted';
  submitted_date?: string;
  survey_url?: string;
  survey_title?: string;
}

// Milestone Update
export interface MilestoneUpdateDetails {
  milestone_name: string;
  progress_percentage: number;
  is_completed: boolean;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  dependencies?: string[];
  customer_notes?: string;
}

// Resource Link
export interface ResourceLinkDetails {
  resource_url: string;
  resource_title: string;
  resource_type: 'pdf' | 'video' | 'image' | 'document' | 'other' | 'website' | 'link' | 'url';
  description?: string;
  requires_login?: boolean;
  is_external?: boolean;
  customer_notes?: string;
}

// Signature Request
export interface SignatureRequestDetails {
  document_url: string;
  document_name: string;
  signature_status: 'pending' | 'signed' | 'rejected';
  signature_method: 'draw' | 'type' | 'upload';
  signature_date?: string;
  signature_image_url?: string;
  rejection_reason?: string;
}

// Approval Request
export interface ApprovalRequestDetails {
  request_title: string;
  request_description: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_date?: string;
  approver_notes?: string;
  attachments?: {
    name: string;
    url: string;
  }[];
  required_approvers: {
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
  }[];
}

// Checklist
export interface ChecklistItem {
  id: string;
  text: string;
  is_completed: boolean;
  required?: boolean;
  completed_at?: string;
  notes?: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

export interface ChecklistDetails {
  title: string;
  description?: string;
  items: ChecklistItem[];
}

// Video Message
export interface VideoMessageDetails {
  message_id: string;
  video_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  length_seconds: number;
  is_watched: boolean;
  language?: string;
  subtitles_url?: string;
  transcription?: string;
  related_files?: {
    name: string;
    url: string;
  }[];
}

// Opt-In Request
export interface OptInRequestDetails {
  id: string;
  title: string;
  description: string;
  service: string;
  status: 'pending' | 'accepted' | 'declined';
  terms?: string;
  benefits?: string[];
  accepted_at?: string;
  declined_at?: string;
}

// Tag System Types
export interface UserDefinedTag {
  tag_id: string;
  business_id: string;
  tag_name: string;
  tag_type: 'appointment_title' | 'payment_title' | 'general_tag' | 'category';
  created_at: string;
  updated_at: string;
}

export interface ServiceBoardActionTag {
  action_id: string;
  tag_id: string;
}

// ServiceBoardActionTemplate interface removed - now handled by action-configs.ts

// Service Board Action with Tags
export interface ServiceBoardAction {
  action_id: string;
  board_id: string;
  customer_id: string;
  action_type: string;
  action_title: string;
  action_description?: string;
  action_details: any;
  action_status: ActionStatus;
  action_priority?: ActionPriority;
  created_at: string;
  updated_at: string;
  due_date?: string;
  is_customer_action_required: boolean;
  is_archived: boolean;
  tags?: UserDefinedTag[]; // Associated tags
}

// Type Guards
export function isDocumentDownloadDetails(details: any): details is DocumentDownloadDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.document_name === 'string' &&
    typeof details.download_url === 'string' &&
    typeof details.file_type === 'string'
  );
}

export function isPaymentRequestDetails(details: any): details is PaymentRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.amount === 'number' &&
    typeof details.currency === 'string' &&
    typeof details.payment_status === 'string' &&
    ['pending', 'completed', 'failed', 'cancelled'].includes(details.payment_status) &&
    (details.hidden_payment_methods === undefined || 
      (Array.isArray(details.hidden_payment_methods) && 
       details.hidden_payment_methods.every((method: any) => typeof method === 'string'))) &&
    (details.payment_confirmation === undefined || details.payment_confirmation === null || 
      (typeof details.payment_confirmation === 'object' &&
       details.payment_confirmation !== null &&
       typeof details.payment_confirmation.confirmed_at === 'string' &&
       typeof details.payment_confirmation.method_used === 'string'))
  );
}

export function isAppointmentSchedulingDetails(details: any): details is AppointmentSchedulingDetails {
  // First check if details exists and is an object
  if (!details || typeof details !== 'object') {
    console.log("Failed: details is not an object");
    return false;
  }

  // Check required fields
  if (typeof details.appointment_title !== 'string') {
    console.log("Failed: appointment_title is not a string");
    return false;
  }

  if (typeof details.appointment_type !== 'string') {
    console.log("Failed: appointment_type is not a string");
    return false;
  }

  if (!['online', 'in_person'].includes(details.appointment_type)) {
    console.log("Failed: appointment_type is not valid:", details.appointment_type);
    return false;
  }

  if (typeof details.appointment_mode !== 'string') {
    console.log("Failed: appointment_mode is not a string");
    return false;
  }

  if (!['fixed_confirmed', 'fixed_pending_confirmation', 'multiple_choice'].includes(details.appointment_mode)) {
    console.log("Failed: appointment_mode is not valid:", details.appointment_mode);
    return false;
  }

  if (typeof details.confirmation_status !== 'string') {
    console.log("Failed: confirmation_status is not a string");
    return false;
  }

  if (!['pending_customer', 'confirmed', 'cancelled', 'rejected', 'rescheduled'].includes(details.confirmation_status)) {
    console.log("Failed: confirmation_status is not valid:", details.confirmation_status);
    return false;
  }

  if (!Array.isArray(details.datetimes_options)) {
    console.log("Failed: datetimes_options is not an array");
    return false;
  }

  if (!details.datetimes_options.every((datetime: any) => typeof datetime === 'string')) {
    console.log("Failed: datetimes_options contains non-string values");
    return false;
  }

  // Check nullable fields
  if (
    (details.address !== null && typeof details.address !== 'string') ||
    (details.datetime_confirmed !== undefined && details.datetime_confirmed !== null && typeof details.datetime_confirmed !== 'string') ||
    (details.reschedule_reason !== undefined && details.reschedule_reason !== null && typeof details.reschedule_reason !== 'string')
  ) {
    console.log("Failed: nullable fields validation");
    return false;
  }

  // Check platform-related fields
  if (details.platform_options !== undefined && !Array.isArray(details.platform_options)) {
    console.log("Failed: platform_options is not an array");
    return false;
  }
  
  if (details.platform_options && !details.platform_options.every((platform: any) => typeof platform === 'string')) {
    console.log("Failed: platform_options contains non-string values");
    return false;
  }
  
  if (details.platform_confirmed !== undefined && details.platform_confirmed !== null && typeof details.platform_confirmed !== 'string') {
    console.log("Failed: platform_confirmed validation");
    return false;
  }
  
  if (details.platforms_selected !== undefined && details.platforms_selected !== null && !Array.isArray(details.platforms_selected)) {
    console.log("Failed: platforms_selected is not an array");
    return false;
  }

  return true;
}

export function isInformationRequestDetails(details: any): details is InformationRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    Array.isArray(details.request_fields) &&
    details.request_fields.every((field: any) => 
      typeof field === 'object' &&
      typeof field.field_name === 'string' &&
      typeof field.field_type === 'string' &&
      typeof field.is_required === 'boolean'
    ) &&
    typeof details.submission_status === 'string' &&
    ['pending', 'submitted'].includes(details.submission_status)
  );
}

export function isGenericMessageDetails(details: any): details is GenericMessageDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.message_content === 'string' &&
    typeof details.severity === 'string' &&
    ['info', 'success', 'warning', 'error'].includes(details.severity)
  );
}

export function isFeedbackRequestDetails(details: any): details is FeedbackRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    Array.isArray(details.questions) &&
    details.questions.every((q: any) => 
      typeof q === 'object' &&
      typeof q.question_text === 'string' &&
      typeof q.question_type === 'string' &&
      ['rating', 'multiple_choice', 'text'].includes(q.question_type)
    ) &&
    typeof details.submission_status === 'string' &&
    ['pending', 'submitted'].includes(details.submission_status)
  );
}

export function isMilestoneUpdateDetails(details: any): details is MilestoneUpdateDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.milestone_name === 'string' &&
    typeof details.is_completed === 'boolean' &&
    (details.progress_percentage === undefined || typeof details.progress_percentage === 'number') &&
    (details.estimated_completion_date === undefined || typeof details.estimated_completion_date === 'string') &&
    (details.actual_completion_date === undefined || typeof details.actual_completion_date === 'string') &&
    (details.dependencies === undefined || Array.isArray(details.dependencies)) &&
    (details.customer_notes === undefined || typeof details.customer_notes === 'string')
  );
}

export function isResourceLinkDetails(details: any): details is ResourceLinkDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.resource_url === 'string' &&
    // title may be empty string; still a valid string
    typeof details.resource_title === 'string' &&
    typeof details.resource_type === 'string' &&
    ((): boolean => {
      const allowed = ['pdf','video','image','document','other','website','link','url']
      return allowed.includes(String(details.resource_type).toLowerCase())
    })() &&
    (details.description === undefined || typeof details.description === 'string') &&
    (details.requires_login === undefined || typeof details.requires_login === 'boolean') &&
    (details.is_external === undefined || typeof details.is_external === 'boolean') &&
    (details.customer_notes === undefined || typeof details.customer_notes === 'string')
  );
}

export function isSignatureRequestDetails(details: any): details is SignatureRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.document_url === 'string' &&
    typeof details.document_name === 'string' &&
    typeof details.signature_status === 'string' &&
    ['pending', 'signed', 'rejected'].includes(details.signature_status) &&
    typeof details.signature_method === 'string' &&
    ['draw', 'type', 'upload'].includes(details.signature_method)
  );
}

export function isApprovalRequestDetails(details: any): details is ApprovalRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.request_title === 'string' &&
    typeof details.request_description === 'string' &&
    typeof details.approval_status === 'string' &&
    ['pending', 'approved', 'rejected'].includes(details.approval_status)
  );
}

export function isChecklistDetails(details: any): details is ChecklistDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.title === 'string' &&
    Array.isArray(details.items) &&
    details.items.every((item: any) =>
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.text === 'string' &&
      typeof item.is_completed === 'boolean'
    )
  );
}

export function isVideoMessageDetails(details: any): details is VideoMessageDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.message_id === 'string' &&
    typeof details.video_url === 'string' &&
    typeof details.title === 'string' &&
    typeof details.length_seconds === 'number' &&
    typeof details.is_watched === 'boolean'
  );
}

export function isOptInRequestDetails(details: any): details is OptInRequestDetails {
  return (
    details &&
    typeof details === 'object' &&
    typeof details.id === 'string' &&
    typeof details.title === 'string' &&
    typeof details.description === 'string' &&
    typeof details.service === 'string' &&
    typeof details.status === 'string' &&
    ['pending', 'accepted', 'declined'].includes(details.status)
  );
} 