import React from 'react';
import { AppointmentSchedulingForm } from './appointment_scheduling';
import { PaymentRequestForm } from './payment_request';
import { SignatureRequestForm } from './signature_request';
import { GenericMessageForm } from './generic_message';
import { InformationRequestForm } from './information_request';
import { DocumentDownloadForm } from './document_download';
import { MediaUploadForm } from './media_upload';
import { ResourceLinkForm } from './resource_link';
import { ChecklistForm } from './checklist';
import { FeedbackRequestForm } from './feedback_request';
import { ApprovalRequestForm } from './approval_request';
import { MilestoneUpdateForm } from './milestone_update';
import { SimpleForm } from './simple-form';

// Export all form components
export { AppointmentSchedulingForm } from './appointment_scheduling';
export { PaymentRequestForm } from './payment_request';
export { SignatureRequestForm } from './signature_request';
export { GenericMessageForm } from './generic_message';
export { InformationRequestForm } from './information_request';
export { DocumentDownloadForm } from './document_download';
export { MediaUploadForm } from './media_upload';
export { ResourceLinkForm } from './resource_link';
export { ChecklistForm } from './checklist';
export { FeedbackRequestForm } from './feedback_request';
export { ApprovalRequestForm } from './approval_request';
export { MilestoneUpdateForm } from './milestone_update';
export { SimpleForm } from './simple-form';
export { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';

// Form factory function
export function getFormGenerator(actionType: string) {
  switch (actionType) {
    case 'appointment_scheduling':
      return AppointmentSchedulingForm;
    case 'payment_request':
      return PaymentRequestForm;
    case 'signature_request':
      return SignatureRequestForm;
    case 'generic_message':
      return GenericMessageForm;
    case 'information_request':
      return InformationRequestForm;
    case 'document_download':
      return DocumentDownloadForm;
    case 'media_upload':
      return MediaUploadForm;
    case 'resource_link':
      return ResourceLinkForm;
    case 'checklist':
      return ChecklistForm;
    case 'feedback_request':
      return FeedbackRequestForm;
    case 'approval_request':
      return ApprovalRequestForm;
    case 'milestone_update':
      return MilestoneUpdateForm;
    default:
      return SimpleForm;
  }
}

// Main dynamic form generator that routes to the appropriate form
export function DynamicFormGenerator(props: any) {
  const FormComponent = getFormGenerator(props.actionType);
  return React.createElement(FormComponent, props);
}
