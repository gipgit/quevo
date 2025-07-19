# Service Board Action Type Renderers

This directory contains reusable rendering components for complex service board action types.

## When to Create a Renderer

Create a dedicated renderer component when an action type has:

1. Complex data structures that need consistent rendering across different views
2. Multiple fields with specific formatting requirements
3. Reusable display logic that needs to be shared
4. Configuration-driven rendering

## Current Renderers

### BaseRenderer
- Base component that handles common rendering patterns
- Supports text, date, currency, and status field types
- Can be extended for custom rendering needs

### PaymentRequestRenderer
- Extends BaseRenderer
- Handles payment-specific formatting (currency, amounts)
- Used by PaymentRequest action type

### AppointmentSchedulingRenderer
- Extends BaseRenderer
- Handles appointment-specific formatting (dates, location types)
- Used by AppointmentScheduling action type

### PropertyRenderer
- Generic renderer for common property types
- Used across multiple action types

## Custom Components

The `custom/` directory contains specialized rendering components that are used by multiple action types:

### ChecklistItems
- Renders interactive checklist items with completion status
- Used by: Checklist action type
- Features: Item completion, notes, attachments

### ApproversList
- Displays list of approvers with their status
- Used by: Approval Request action type
- Features: Approval status, role display

### VideoPlayer
- Custom video player component
- Used by: Video Message action type
- Features: Playback controls, thumbnail display

### ProgressBar
- Visual progress indicator
- Used by: Multiple action types
- Features: Percentage display, color coding

### CustomFields
- Renders dynamic form fields
- Used by: Information Request action type
- Features: Multiple field types, validation

## Action Type Categories

### Complex (With Dedicated Renderer)
- Payment Request (amounts, currencies, payment methods)
- Appointment Scheduling (dates, locations, meeting apps)

### Complex (Using Custom Components)
- Checklist (ChecklistItems component)
- Approval Request (ApproversList component)
- Video Message (VideoPlayer component)
- Information Request (CustomFields component)

### Simple (Direct Rendering)
- Generic Message
- Resource Link
- Document Download
- Milestone Update

## How to Create a New Renderer

1. Create a new file in the renderers directory
2. Extend BaseRenderer or implement BaseRendererProps
3. Add custom rendering logic for specific fields
4. Create a config file in the configs directory
5. Update the action type component to use the renderer

Example:
```typescript
import BaseRenderer, { BaseRendererProps } from './BaseRenderer';

type CustomRendererProps = BaseRendererProps<CustomActionDetails>;

export default function CustomRenderer({ 
  field, 
  value, 
  details 
}: CustomRendererProps) {
  // Add custom rendering logic here
  if (field.key === 'custom_field') {
    return <CustomComponent value={value} />;
  }

  // Use base renderer for standard fields
  return (
    <BaseRenderer<CustomActionDetails>
      field={field}
      value={value}
      details={details}
    />
  );
}
```

## Best Practices

1. Keep renderers focused on display logic only
2. Use shared styles from shared-styles.ts
3. Implement proper TypeScript interfaces
4. Document custom rendering behavior
5. Use consistent naming conventions
6. Test renderers with different data scenarios

## Future Improvements

Consider creating dedicated renderers for:
1. Checklist - Complex interactive items
2. Approval Request - Multiple approver states
3. Video Message - Media playback
4. Information Request - Dynamic form fields

This would provide better type safety and more consistent rendering patterns across the application. 