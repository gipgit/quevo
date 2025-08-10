// Shared Field Type Definitions
// This file unifies field types between action-configs and form-field-renderers

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'url' 
  | 'datetime' 
  | 'datetime_array'
  | 'select' 
  | 'checkbox' 
  | 'item_array' 
  | 'field_array' 
  | 'question_array'
  | 'file_upload'
  | 'rich_text'
  | 'multi_select'
  | 'date_range'
  | 'time_slot'
  | 'select_cards'
  | 'multi_select_pills';

// Unified field configuration interface
export interface FieldConfig {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: Array<{ key: string; label: string; icon?: string; description?: string }>;
  cardOptions?: Array<{ key: string; label: string; icon?: string; description?: string; color?: string }>;
  min?: number;
  max?: number;
  step?: number;
  conditional?: {
    dependsOn: string;
    showWhen: (value: any) => boolean;
  };
  dynamicOptions?: {
    source: 'business_payment_methods' | 'business_platforms' | 'custom';
    defaultOptions?: Array<{ key: string; label: string; icon?: string }>;
  };
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
    multiSelect?: boolean;
    minLength?: number;
    maxLength?: number;
  };
  planLimits?: {
    maxItems?: number;
    maxFields?: number;
    maxQuestions?: number;
  };
  fileUpload?: {
    acceptedTypes: string[];
    maxSize: number; // in bytes
    multiple?: boolean;
  };
  ui?: {
    rows?: number;
    cols?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'outline' | 'filled' | 'unstyled';
    helpText?: string;
    errorText?: string;
    gridClass?: string; // custom grid class for card/select layouts
  };
}

// Action configuration interface
export interface ActionConfig {
  actionType: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  availablePlans: number[]; // [1, 2, 3] for all plans
  fields: FieldConfig[];
  planLimits?: {
    maxChecklistItems?: number;
    maxInformationFields?: number;
    maxFeedbackQuestions?: number;
  };
}

// Form field renderer interface
export interface FieldRendererProps {
  fieldName: string;
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}
