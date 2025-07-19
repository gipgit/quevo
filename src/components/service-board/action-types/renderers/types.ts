import { AppointmentSchedulingDetails, ConfirmationStatus, MeetingApp } from '@/types/service-board';
import { commonStyles } from './configs/shared-styles';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type PropertyType = 'text' | 'datetime' | 'status' | 'file' | 'custom';
export type PropertyFormat = 'default' | 'heading';
export type PropertyLayout = 'full' | 'inline';
export type StatusColor = 'success' | 'error' | 'warning' | 'info';

export interface PropertyRendererConfig {
  type: PropertyType;
  format?: PropertyFormat;
  layout?: PropertyLayout;
  priority?: number;
  showLabel?: boolean;
  showDate?: boolean;
  showTime?: boolean;
  showIcon?: boolean;
  allowPreview?: boolean;
  colorMap?: Record<string, keyof typeof commonStyles.status.colors>;
  condition?: (data: any) => boolean;
  render?: (value: any, config: PropertyRendererConfig, data: any) => React.ReactNode;
}

export interface FieldConfig<T> {
  key: keyof T;
  label: string;
  shouldRender?: (data: T) => boolean;
  render: (value: any, data: T) => FieldRenderResult | null;
}

export interface FieldRenderResult {
  type: string;
  value: any;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
} 