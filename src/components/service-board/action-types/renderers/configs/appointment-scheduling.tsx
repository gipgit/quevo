import { BaseRendererConfig } from '../BaseRenderer';
import { AppointmentSchedulingDetails } from '@/types/service-board';

export const appointmentSchedulingConfig: BaseRendererConfig<AppointmentSchedulingDetails>[] = [
  {
    key: 'appointment_title',
    label: 'Appointment Title',
    type: 'text',
  },
  {
    key: 'confirmation_status',
    label: 'Status',
    type: 'custom',
  },
  {
    key: 'appointment_type',
    label: 'Appointment Type',
    type: 'custom',
  },
  {
    key: 'address',
    label: 'Address',
    type: 'text',
    shouldRender: (details) => details.appointment_type === 'in_person',
  },
  {
    key: 'datetimes_options',
    label: 'Suggested Times',
    type: 'custom',
    shouldRender: (details) => details.confirmation_status === 'pending_customer' && details.appointment_mode === 'multiple_choice',
  },
  {
    key: 'datetime_confirmed',
    label: 'Appointment Time',
    type: 'custom',
    shouldRender: (details) => details.datetime_confirmed !== null,
  },
  {
    key: 'platform_options',
    label: 'Available Platforms',
    type: 'custom',
    shouldRender: (details) => details.appointment_type === 'online' && details.confirmation_status === 'pending_customer',
  },
  {
    key: 'platform_confirmed',
    label: 'Confirmed Platform',
    type: 'custom',
    shouldRender: (details) => details.appointment_type === 'online' && details.platform_confirmed !== null,
  },
  {
    key: 'platforms_selected',
    label: 'Selected Platforms',
    type: 'custom',
    shouldRender: (details) => Boolean(details.appointment_type === 'online' && details.platforms_selected && details.platforms_selected.length > 0),
  },
  {
    key: 'reschedule_reason',
    label: 'Reschedule Reason',
    type: 'text',
    shouldRender: (details) => details.reschedule_reason !== null,
  },
  {
    key: 'appointment_id',
    label: 'Appointment ID',
    type: 'text',
    shouldRender: (details) => details.appointment_id !== null,
  },
]; 