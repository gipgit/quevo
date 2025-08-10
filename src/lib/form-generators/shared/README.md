# Shared Form Generator Architecture

This directory contains the shared components and configuration system for the modular form generators.

## Architecture Overview

### Before (Monolithic):
```
action-configs.ts (786 lines) - All field definitions
form-field-renderers.tsx (841 lines) - All rendering logic
dynamic-form-generator.tsx (Complex, hard to maintain)
```

### After (Modular):
```
form-generators/
├── shared/
│   ├── types.ts - Unified type definitions
│   ├── config.ts - Configuration registry system
│   └── README.md - This file
├── generic_message.tsx - Self-contained with own field config
├── payment_request.tsx - Self-contained with own field config
├── appointment_scheduling.tsx - Self-contained with own field config
└── [other action-specific files...]
```

## Benefits

1. **Modularity**: Each action type defines its own field configuration
2. **Maintainability**: Easy to find and modify field definitions
3. **Type Safety**: Unified type definitions across the system
4. **Extensibility**: Easy to add new action types
5. **Separation of Concerns**: Configuration separated from rendering logic

## How to Use

### 1. Define Field Configuration in Action-Specific File

```typescript
// generic_message.tsx
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

// Define fields for this action type
const genericMessageFields = [
  createFieldConfig('message_content', 'textarea', true, {
    label: 'Contenuto del messaggio',
    placeholder: 'Inserisci il contenuto del messaggio da inviare'
  }),
  createFieldConfig('severity', 'select', true, {
    label: 'Tipo di messaggio',
    options: [
      { key: 'info', label: 'Informazione' },
      { key: 'success', label: 'Successo' }
    ]
  })
];

// Register the configuration
registerActionConfig(createActionConfig(
  'generic_message',
  'Messaggio Generico',
  'Invia un messaggio informativo ai tuoi clienti',
  '/icons/sanity/message.svg',
  'bg-blue-100',
  [1, 2, 3],
  genericMessageFields
));
```

### 2. Use the Configuration System

```typescript
// In your form component
import { getActionConfig } from './shared/config';

const actionConfig = getActionConfig('generic_message');
// actionConfig now contains all field definitions for this action type
```

### 3. Render Fields

```typescript
// The base-form-generator automatically renders fields using FieldRenderer
{actionConfig.fields
  .filter(field => !['action_title', 'action_description'].includes(field.name))
  .filter(shouldShowField)
  .map(field => renderField(field))
}
```

## Migration Strategy

1. **Phase 1**: Create shared types and configuration system ✅
2. **Phase 2**: Move field configurations from action-configs.ts to individual files
3. **Phase 3**: Update all form generators to use the new system
4. **Phase 4**: Remove the old action-configs.ts file

## File Structure

- **types.ts**: Unified type definitions for FieldConfig, ActionConfig, etc.
- **config.ts**: Configuration registry system with helper functions
- **README.md**: This documentation

## Helper Functions

- `createFieldConfig()`: Create field configurations with type safety
- `createActionConfig()`: Create action configurations
- `registerActionConfig()`: Register configurations in the system
- `getActionConfig()`: Retrieve configurations by action type
- `getAllActionConfigs()`: Get all registered configurations
- `getAvailableActionsForPlan()`: Get actions available for a specific plan
