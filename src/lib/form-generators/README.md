# Form Generators

This directory contains modular form generators for different action types. The structure is designed to be maintainable and extensible.

## Structure

```
form-generators/
├── index.ts                    # Main export and factory function
├── base-form-generator.tsx     # Shared base component and hooks
├── appointment_scheduling.tsx  # Appointment scheduling specific form
├── payment_request.tsx        # Payment request specific form
├── signature_request.tsx      # Signature request specific form
├── generic_message.tsx        # Generic message form
├── information_request.tsx    # Information request form
├── document_download.tsx      # Document download form
├── media_upload.tsx          # Media upload form
├── resource_link.tsx         # Resource link form
├── checklist.tsx             # Checklist form
├── feedback_request.tsx      # Feedback request form
├── approval_request.tsx      # Approval request form
├── milestone_update.tsx      # Milestone update form
├── simple-form.tsx           # Generic form for other action types
└── README.md                 # This file
```

## Supported Action Types

- **appointment_scheduling**: Calendar integration, date selection, time slots
- **payment_request**: Payment-specific styling and validation
- **signature_request**: Signature-specific styling and validation
- **generic_message**: Message-specific styling
- **information_request**: Information request styling
- **document_download**: Document download styling
- **media_upload**: Media upload styling
- **resource_link**: Resource link styling
- **checklist**: Checklist styling
- **feedback_request**: Feedback request styling
- **approval_request**: Approval request styling
- **milestone_update**: Milestone update styling

## Usage

### Basic Usage
```typescript
import { DynamicFormGenerator } from './form-generators';

// The component will automatically route to the appropriate form
<DynamicFormGenerator 
  actionType="appointment_scheduling"
  businessId="123"
  onSubmit={handleSubmit}
  // ... other props
/>
```

### Direct Usage
```typescript
import { AppointmentSchedulingForm } from './form-generators';

<AppointmentSchedulingForm 
  actionType="appointment_scheduling"
  businessId="123"
  onSubmit={handleSubmit}
  // ... appointment-specific props
/>
```

## Adding New Action Types

1. Create a new file named after the action type (e.g., `survey.tsx`)
2. Import and extend the base form functionality
3. Add the new form to the factory function in `index.ts`

### Example
```typescript
// survey.tsx
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';

export function SurveyForm(props: SurveyFormProps) {
  const { formData, errors, handleFieldChange, validateForm, shouldShowField, renderField, actionConfig, formPlaceholders } = useBaseForm(props.actionType, props.locale);
  
  // Add survey-specific logic here
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}

// index.ts
export function getFormGenerator(actionType: string) {
  switch (actionType) {
    case 'survey':
      return SurveyForm;
    // ... other cases
  }
}
```

## Benefits

- **Modularity**: Each action type has its own file
- **Maintainability**: Easier to find and fix issues
- **Extensibility**: Easy to add new action types
- **Reusability**: Shared components and hooks
- **Type Safety**: Proper TypeScript interfaces
- **Performance**: Only loads the specific form needed
- **Customization**: Each action type can have its own styling and behavior

## Shared Components

- `useBaseForm`: Hook for form state management
- `ActionTitleField`: Reusable title input component
- `ActionDescriptionField`: Reusable description textarea component
- `SubmitButton`: Reusable submit button component

## Action-Specific Features

- **Appointment Scheduling**: Calendar integration, date/time selection, appointment modes
- **Payment Request**: Payment-specific validation and styling
- **Signature Request**: Signature-specific validation and styling
- **All Others**: Custom submit button text and styling for each action type
