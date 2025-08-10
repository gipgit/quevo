// Action Data Transformer
// Handles transformation between form data and expected data structures for rendering

import { 
  PaymentRequestDetails, 
  GenericMessageDetails, 
  AppointmentSchedulingDetails,
  InformationRequestDetails,
  FeedbackRequestDetails,
  MilestoneUpdateDetails,
  ResourceLinkDetails,
  SignatureRequestDetails,
  ApprovalRequestDetails,
  ChecklistDetails,
  VideoMessageDetails,
  OptInRequestDetails,
  DocumentDownloadDetails
} from '@/types/service-board';
import { ALLOWED_PAYMENT_METHODS } from '@/lib/payment-methods-config';

export interface ActionDataTransformer {
  transformFormDataToActionDetails(formData: any, actionType: string): any;
  validateActionDetails(details: any, actionType: string): boolean;
  getMissingFields(details: any, actionType: string): string[];
}

class ActionDataTransformerImpl implements ActionDataTransformer {
  
  transformFormDataToActionDetails(formData: any, actionType: string): any {
    // Some API updates may have stored a Prisma JSON "set" wrapper. Unwrap if present.
    const unwrapIfSet = (obj: any) => (obj && typeof obj === 'object' && obj.set && typeof obj.set === 'object') ? obj.set : obj
    const src = unwrapIfSet(formData)

    switch (actionType) {
      case 'payment_request':
        return this.transformPaymentRequest(src);
      case 'generic_message':
        return this.transformGenericMessage(src);
      case 'appointment_scheduling':
        return this.transformAppointmentScheduling(src);
      case 'information_request':
        return this.transformInformationRequest(src);
      case 'feedback_request':
        return this.transformFeedbackRequest(src);
      case 'milestone_update':
        return this.transformMilestoneUpdate(src);
      case 'resource_link':
        return this.transformResourceLink(src);
      case 'signature_request':
        return this.transformSignatureRequest(src);
      case 'approval_request':
        return this.transformApprovalRequest(src);
      case 'checklist':
        return this.transformChecklist(src);
      case 'video_message':
        return this.transformVideoMessage(src);
      case 'opt_in_request':
        return this.transformOptInRequest(src);
      case 'document_download':
        return this.transformDocumentDownload(src);
      default:
        console.warn(`Unknown action type: ${actionType}`);
        return src;
    }
  }

  private transformPaymentRequest(formData: any): PaymentRequestDetails {
    const selectedIds: string[] = Array.isArray(formData.payment_methods)
      ? formData.payment_methods.filter(Boolean)
      : Array.isArray(formData.allowed_payment_methods)
        ? formData.allowed_payment_methods.filter(Boolean)
        : [];

    return {
      amount: typeof formData.amount === 'number' ? formData.amount : Number(formData.amount) || 0,
      currency: typeof formData.currency === 'string' ? formData.currency : 'EUR',
      payment_status: typeof formData.payment_status === 'string' ? formData.payment_status : 'pending',
      payment_reason: formData.payment_reason,
      // Prefer allowed list only to keep payload small; renderer will use it directly
      allowed_payment_methods: selectedIds,
      available_payment_methods: Array.isArray(formData.available_payment_methods) ? formData.available_payment_methods : [],
      action_id: formData.action_id,
      created_at: formData.created_at,
      updated_at: formData.updated_at,
      status: typeof formData.status === 'string' ? formData.status : 'pending',
      customer_notes: formData.customer_notes,
      // Preserve declared confirmation and confirmation details if present
      payment_declared_confirmed: formData.payment_declared_confirmed === true,
      payment_confirmation: (typeof formData.payment_confirmation === 'object' && formData.payment_confirmation !== null)
        ? formData.payment_confirmation
        : undefined,
    };
  }

  private transformGenericMessage(formData: any): GenericMessageDetails {
    return {
      message_content: formData.message_content || '',
      severity: formData.severity || 'info',
      requires_acknowledgment: formData.requires_acknowledgment || false,
      acknowledged_at: formData.acknowledged_at
    };
  }

  private transformAppointmentScheduling(formData: any): AppointmentSchedulingDetails {
    // Normalize confirmation and mode to be robust against various sources
    const effectiveConfirmation: 'pending_customer' | 'confirmed' | 'cancelled' | 'rejected' | 'rescheduled' = typeof formData.confirmation_status === 'string'
      ? formData.confirmation_status
      : (formData.appointment_status === 'confirmed' ? 'confirmed' : 'pending_customer');

    const normalizedMode: 'fixed_confirmed' | 'fixed_pending_confirmation' | 'multiple_choice' = (() => {
      const m = formData.appointment_mode;
      if (m === 'fixed_confirmed') return 'fixed_confirmed';
      if (m === 'fixed_date') return 'fixed_confirmed';
      return (m as any) || 'multiple_choice';
    })();

    // Determine confirmed datetime rules
    let datetimeConfirmed: string | null = null;
    if (effectiveConfirmation === 'confirmed') {
      datetimeConfirmed = formData.datetime_confirmed || null;
    } else if (normalizedMode === 'fixed_confirmed' || normalizedMode === 'fixed_pending_confirmation') {
      // pending + fixed date still carries a single datetime selection
      datetimeConfirmed = formData.datetime_confirmed || null;
    }

    // Platform rules
    const appointmentType = formData.appointment_type || 'in_person';
    const isOnline = appointmentType === 'online';
    const platformConfirmed = effectiveConfirmation === 'confirmed' && isOnline
      ? (formData.platform_confirmed || null)
      : null;

    const platformOptions = effectiveConfirmation !== 'confirmed'
      ? ((formData.platforms || formData.platform_options) || [])
      : [];

    const platformsSelected = effectiveConfirmation !== 'confirmed'
      ? ((formData.platforms_selected || formData.platforms) || null)
      : null;

    return {
      appointment_title: formData.appointment_title || '',
      appointment_type: appointmentType,
      appointment_mode: normalizedMode,
      address: formData.address || null,
      confirmation_status: effectiveConfirmation,
      datetimes_options: formData.datetimes_options || [],
      datetime_confirmed: datetimeConfirmed,
      platform_confirmed: platformConfirmed,
      platform_options: platformOptions,
      platforms_selected: platformsSelected,
      appointment_id: formData.appointment_id || null,
      reschedule_reason: formData.reschedule_reason || null,
      action_id: formData.action_id,
      created_at: formData.created_at,
      updated_at: formData.updated_at,
      status: 'pending',
      customer_notes: formData.customer_notes
    };
  }

  private transformInformationRequest(formData: any): InformationRequestDetails {
    // Transform request_fields to ensure they have the correct structure
    const transformedRequestFields = (formData.request_fields || []).map((field: any) => ({
      field_name: field.field_name || '',
      field_type: field.field_type || 'text',
      is_required: field.is_required !== undefined ? field.is_required : field.required || false,
      options: field.options,
      validation: field.validation
    }));

    return {
      request_fields: transformedRequestFields,
      customer_response: formData.customer_response || {},
      submission_status: formData.submission_status || 'pending',
      submission_date: formData.submission_date
    };
  }

  private transformFeedbackRequest(formData: any): FeedbackRequestDetails {
    return {
      questions: formData.questions || [],
      responses: formData.responses || {},
      submission_status: 'pending',
      submitted_date: formData.submitted_date,
      survey_url: formData.survey_url,
      survey_title: formData.survey_title
    };
  }

  private transformMilestoneUpdate(formData: any): MilestoneUpdateDetails {
    // Derive progress and completion from multiple possible form keys to remain compatible with the form generator
    const rawProgress =
      formData.progress_percentage ??
      formData.completion_percentage ??
      0;
    const clampedProgress = Math.max(0, Math.min(100, Number(rawProgress) || 0));

    // is_completed can be directly provided or inferred from milestone_status
    const status = typeof formData.milestone_status === 'string' ? formData.milestone_status : ''
    const inferredCompleted = status
      ? status === 'completed'
      : undefined;
    const isCompleted = typeof formData.is_completed === 'boolean'
      ? formData.is_completed
      : (inferredCompleted ?? false);

    const base: MilestoneUpdateDetails = {
      milestone_name: formData.milestone_name || '',
      progress_percentage: isCompleted ? 100 : clampedProgress,
      is_completed: isCompleted,
      estimated_completion_date: formData.estimated_completion_date,
      actual_completion_date: formData.actual_completion_date,
      dependencies: formData.dependencies || [],
      customer_notes: formData.customer_notes
    };

    // Derive actual_completion_date when completed and none provided
    if (base.is_completed && !base.actual_completion_date) {
      base.actual_completion_date = new Date().toISOString();
    }

    // Include optional start_date when status indicates started/in_progress
    if ((status === 'started' || status === 'in_progress') && formData.start_date) {
      // @ts-ignore - allow renderer to read it even if not in the strict interface
      base.start_date = formData.start_date;
    }

    return base;
  }

  private transformResourceLink(formData: any): ResourceLinkDetails {
    return {
      resource_url: formData.resource_url || '',
      resource_title: formData.resource_title || '',
      resource_type: formData.resource_type || 'other',
      description: formData.description,
      requires_login: formData.requires_login || false,
      is_external: formData.is_external || false,
      customer_notes: formData.customer_notes
    };
  }

  private transformSignatureRequest(formData: any): SignatureRequestDetails {
    return {
      document_url: formData.document_url || '',
      document_name: formData.document_name || '',
      signature_status: 'pending',
      signature_method: formData.signature_method || 'draw',
      signature_date: formData.signature_date,
      signature_image_url: formData.signature_image_url,
      rejection_reason: formData.rejection_reason
    };
  }

  private transformApprovalRequest(formData: any): ApprovalRequestDetails {
    return {
      request_title: formData.approval_type || '',
      request_description: formData.approval_details || '',
      approval_status: 'pending',
      approval_date: formData.approval_date,
      approver_notes: formData.approver_notes,
      attachments: formData.attachments || [],
      required_approvers: formData.required_approvers || []
    };
  }

  private transformChecklist(formData: any): ChecklistDetails {
    const rawItems = Array.isArray(formData.items)
      ? formData.items
      : Array.isArray(formData.checklist_items)
        ? formData.checklist_items
        : [];
    const items = rawItems.map((item: any, index: number) => {
      if (typeof item === 'string') {
        return {
          id: `item-${Date.now()}-${index}`,
          text: item,
          is_completed: false,
        };
      }
      // If already an object, normalize shape and ensure required fields
      return {
        id: typeof item?.id === 'string' ? item.id : `item-${Date.now()}-${index}`,
        text: typeof item?.text === 'string' ? item.text : String(item?.text ?? ''),
        is_completed: Boolean(item?.is_completed),
        required: item?.required === true,
        completed_at: typeof item?.completed_at === 'string' ? item.completed_at : undefined,
        attachments: Array.isArray(item?.attachments) ? item.attachments : undefined,
        notes: typeof item?.notes === 'string' ? item.notes : undefined,
      };
    });

    return {
      title: formData.title || formData.checklist_title || '',
      description: formData.description,
      items,
    };
  }

  private transformVideoMessage(formData: any): VideoMessageDetails {
    return {
      message_id: formData.message_id || '',
      video_url: formData.video_url || '',
      thumbnail_url: formData.thumbnail_url,
      title: formData.title || '',
      description: formData.description,
      length_seconds: formData.length_seconds || 0,
      is_watched: formData.is_watched || false,
      language: formData.language,
      subtitles_url: formData.subtitles_url,
      transcription: formData.transcription,
      related_files: formData.related_files || []
    };
  }

  private transformOptInRequest(formData: any): OptInRequestDetails {
    return {
      id: formData.id || '',
      title: formData.title || '',
      description: formData.description || '',
      service: formData.service || '',
      status: 'pending',
      terms: formData.terms,
      benefits: formData.benefits || [],
      accepted_at: formData.accepted_at,
      declined_at: formData.declined_at
    };
  }

  private transformDocumentDownload(formData: any): DocumentDownloadDetails {
    return {
      document_name: formData.document_name || '',
      download_url: formData.document_file || '',
      file_type: formData.file_type || 'pdf'
    };
  }

  private convertPaymentMethodsToHidden(selectedMethods: string[]): string[] {
    // Normalize selected to lowercase ids/labels
    const selected = new Set((selectedMethods || []).map((m) => m?.toString().toLowerCase()));
    // Hide all methods that are not selected (by id)
    const hidden = ALLOWED_PAYMENT_METHODS
      .map((m) => m.id.toLowerCase())
      .filter((id) => !selected.has(id));
    return hidden;
  }

  validateActionDetails(details: any, actionType: string): boolean {
    switch (actionType) {
      case 'payment_request':
        return this.validatePaymentRequest(details);
      case 'generic_message':
        return this.validateGenericMessage(details);
      case 'appointment_scheduling':
        return this.validateAppointmentScheduling(details);
      case 'information_request':
        return this.validateInformationRequest(details);
      case 'feedback_request':
        return this.validateFeedbackRequest(details);
      case 'milestone_update':
        return this.validateMilestoneUpdate(details);
      case 'resource_link':
        return this.validateResourceLink(details);
      case 'signature_request':
        return this.validateSignatureRequest(details);
      case 'approval_request':
        return this.validateApprovalRequest(details);
      case 'checklist':
        return this.validateChecklist(details);
      case 'video_message':
        return this.validateVideoMessage(details);
      case 'opt_in_request':
        return this.validateOptInRequest(details);
      case 'document_download':
        return this.validateDocumentDownload(details);
      default:
        return true;
    }
  }

  private validatePaymentRequest(details: any): boolean {
    return (
      typeof details.amount === 'number' &&
      typeof details.currency === 'string' &&
      typeof details.payment_status === 'string'
    );
  }

  private validateGenericMessage(details: any): boolean {
    return (
      typeof details.message_content === 'string' &&
      typeof details.severity === 'string' &&
      ['info', 'success', 'warning', 'error'].includes(details.severity)
    );
  }

  private validateAppointmentScheduling(details: any): boolean {
    // Basic validation
    const hasRequiredFields = (
      typeof details.appointment_title === 'string' &&
      typeof details.appointment_type === 'string' &&
      typeof details.confirmation_status === 'string'
    );

    if (!hasRequiredFields) {
      return false;
    }

    // For confirmed appointments, we need datetime_confirmed
    if (details.confirmation_status === 'confirmed') {
      return details.datetime_confirmed !== null && details.datetime_confirmed !== undefined;
    }

    // For to_schedule appointments
    if (details.confirmation_status === 'pending_customer') {
      if (details.appointment_mode === 'multiple_choice') {
        return Array.isArray(details.datetimes_options);
      }
      if (details.appointment_mode === 'fixed_date') {
        return details.datetime_confirmed !== null && details.datetime_confirmed !== undefined;
      }
      // default fallback
      return typeof details.appointment_mode === 'string';
    }

    return true;
  }

  private validateInformationRequest(details: any): boolean {
    return (
      Array.isArray(details.request_fields) &&
      typeof details.submission_status === 'string'
    );
  }

  private validateFeedbackRequest(details: any): boolean {
    return (
      Array.isArray(details.questions) &&
      typeof details.submission_status === 'string'
    );
  }

  private validateMilestoneUpdate(details: any): boolean {
    return (
      typeof details.milestone_name === 'string' &&
      typeof details.is_completed === 'boolean'
    );
  }

  private validateResourceLink(details: any): boolean {
    if (!details || typeof details !== 'object') return false;
    if (typeof details.resource_url !== 'string') return false;
    if (typeof details.resource_type !== 'string') return false;
    // Accept empty title; renderer will fallback
    if (details.resource_title !== undefined && typeof details.resource_title !== 'string') return false;
    // Normalize resource_type to supported set
    const normalizedType = String(details.resource_type).toLowerCase();
    const allowed = ['pdf','video','image','document','other','website','link','url'];
    if (!allowed.includes(normalizedType)) return false;
    return true;
  }

  private validateSignatureRequest(details: any): boolean {
    return (
      typeof details.document_url === 'string' &&
      typeof details.document_name === 'string' &&
      typeof details.signature_status === 'string' &&
      typeof details.signature_method === 'string'
    );
  }

  private validateApprovalRequest(details: any): boolean {
    return (
      typeof details.request_title === 'string' &&
      typeof details.request_description === 'string' &&
      typeof details.approval_status === 'string'
    );
  }

  private validateChecklist(details: any): boolean {
    return (
      typeof details.title === 'string' &&
      Array.isArray(details.items)
    );
  }

  private validateVideoMessage(details: any): boolean {
    return (
      typeof details.message_id === 'string' &&
      typeof details.video_url === 'string' &&
      typeof details.title === 'string' &&
      typeof details.length_seconds === 'number' &&
      typeof details.is_watched === 'boolean'
    );
  }

  private validateOptInRequest(details: any): boolean {
    return (
      typeof details.id === 'string' &&
      typeof details.title === 'string' &&
      typeof details.description === 'string' &&
      typeof details.service === 'string' &&
      typeof details.status === 'string'
    );
  }

  private validateDocumentDownload(details: any): boolean {
    return (
      typeof details.document_name === 'string' &&
      typeof details.download_url === 'string' &&
      typeof details.file_type === 'string'
    );
  }

  getMissingFields(details: any, actionType: string): string[] {
    const missingFields: string[] = [];
    
    switch (actionType) {
      case 'payment_request':
        if (!details.amount) missingFields.push('amount');
        if (!details.currency) missingFields.push('currency');
        if (!details.payment_status) missingFields.push('payment_status');
        break;
      case 'generic_message':
        if (!details.message_content) missingFields.push('message_content');
        if (!details.severity) missingFields.push('severity');
        break;
      case 'appointment_scheduling':
        if (!details.appointment_title) missingFields.push('appointment_title');
        if (!details.appointment_type) missingFields.push('appointment_type');
        if (!details.confirmation_status) missingFields.push('confirmation_status');
        
        // For confirmed appointments
        if (details.confirmation_status === 'confirmed') {
          if (!details.datetime_confirmed) missingFields.push('datetime_confirmed');
        }
        
        // For to_schedule appointments
        if (details.confirmation_status === 'pending_customer') {
          if (!details.appointment_mode) missingFields.push('appointment_mode');
          if (!details.datetimes_options) missingFields.push('datetimes_options');
        }
        break;
      // Add more cases as needed
    }
    
    return missingFields;
  }
}

// Export singleton instance
export const actionDataTransformer = new ActionDataTransformerImpl();

// Helper function to transform action details before rendering
export function transformActionDetailsForRendering(actionDetails: any, actionType: string): any {
  return actionDataTransformer.transformFormDataToActionDetails(actionDetails, actionType);
}

// Helper function to validate action details
export function validateActionDetails(actionDetails: any, actionType: string): boolean {
  return actionDataTransformer.validateActionDetails(actionDetails, actionType);
}

// Helper function to get missing fields
export function getMissingFields(actionDetails: any, actionType: string): string[] {
  return actionDataTransformer.getMissingFields(actionDetails, actionType);
}
