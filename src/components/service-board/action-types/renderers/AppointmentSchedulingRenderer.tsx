import React from 'react';
import { AppointmentSchedulingDetails } from '@/types/service-board';
import BaseRenderer, { BaseRendererConfig } from './BaseRenderer';
import { format } from 'date-fns';
import { enUS, it } from 'date-fns/locale';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AppointmentSchedulingRendererProps {
  field: BaseRendererConfig<AppointmentSchedulingDetails>;
  value: string | string[] | null | undefined;
  details: AppointmentSchedulingDetails;
  onDatetimeSelect?: (datetime: string) => void;
  onPlatformSelect?: (platform: string) => void;
  selectedDatetime?: string | null;
  selectedPlatform?: string | null;
}

export default function AppointmentSchedulingRenderer({
  field,
  value,
  details,
  onDatetimeSelect,
  onPlatformSelect,
  selectedDatetime,
  selectedPlatform
}: AppointmentSchedulingRendererProps) {
  const params = useParams();
  const locale = params.locale as string;
  
  const getDateLocale = () => {
    switch(locale) {
      case 'it':
        return it;
      default:
        return enUS;
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const dateLocale = getDateLocale();
    
    const formattedDate = format(date, 'PPPP', { locale: dateLocale });
    const formattedTime = format(date, 'HH:mm');
    
    return { formattedDate, formattedTime };
  };

  // Special handling for confirmation status
  if (field.key === 'confirmation_status') {
    const getStatusStyles = (status: string) => {
      switch (status) {
        case 'pending_customer':
          return 'bg-yellow-100 text-yellow-800';
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        case 'rescheduled':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending_customer':
          return 'Pending Confirmation';
        case 'confirmed':
          return 'Confirmed';
        case 'cancelled':
          return 'Cancelled';
        case 'rejected':
          return 'Rejected';
        case 'rescheduled':
          return 'Rescheduled';
        default:
          return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    };

    return (
      <div className="space-y-1 flex items-center gap-x-2">
        <label className="text-sm font-medium text-gray-900">{field.label}</label>
        <div className={`w-fit px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(value as string)}`}>
          {getStatusText(value as string)}
        </div>
      </div>
    );
  }

  // Special handling for address - moved before dates
  if (field.key === 'address' && value) {
    return (
      <div className="space-y-0">
        <label className="text-sm font-medium text-gray-500">{field.label}</label>
        <div className="text-lg font-bold text-gray-700">{value}</div>
      </div>
    );
  }

  // Special handling for appointment mode
  if (field.key === 'appointment_mode') {
    const modes = [
      {
        key: 'fixed_confirmed',
        title: 'Appointment with fixed date already confirmed',
        description: 'The appointment date and time are already set and confirmed',
        icon: '✓'
      },
      {
        key: 'fixed_pending_confirmation',
        title: 'Appointment with fixed date with request of confirmation',
        description: 'The appointment date and time are set but need customer confirmation',
        icon: '⏳'
      },
      {
        key: 'multiple_choice',
        title: 'Appointment with list of dates to choice and confirm',
        description: 'Customer can choose from multiple suggested dates and times',
        icon: '📅'
      }
    ];

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-800">{field.label}</label>
        <div className="grid gap-3">
          {modes.map((mode) => (
            <div
              key={mode.key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                value === mode.key
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                // This will be handled by the parent component
                console.log('Mode selected:', mode.key);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  value === mode.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {mode.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{mode.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                </div>
                {value === mode.key && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Special handling for appointment type
  if (field.key === 'appointment_type') {
    return (
      <div className="space-y-1 hidden">
        <label className="text-xs font-medium text-gray-800">{field.label}</label>
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
          {value === 'online' ? 'Online Meeting' : 'In Person'}
        </div>
      </div>
    );
  }

  // Special handling for fixed datetime
  if (field.key === 'datetime_confirmed' && typeof value === 'string') {
    const { formattedDate, formattedTime } = formatDateTime(value);
    
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-800">{field.label}</label>
        <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
          <div className="flex flex-col">
            <div className="text-md md:text-lg font-medium text-gray-900">
              {formattedDate}
            </div>
            <div className="text-sm text-gray-500">
              {formattedTime}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Special handling for suggested datetimes
  if (field.key === 'datetimes_options' && Array.isArray(value)) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-800">{field.label}</label>
        <div className="space-y-2">
          {value.map((datetime, index) => {
            const { formattedDate, formattedTime } = formatDateTime(datetime);
            const isSelected = datetime === selectedDatetime;
            
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg cursor-pointer flex justify-between items-center ${
                  isSelected 
                    ? 'border-[1px] border-green-500 bg-green-50' 
                    : 'border-[1px] border-gray-300 bg-gray-50 hover:bg-gray-50'
                }`}
                onClick={() => onDatetimeSelect?.(datetime)}
              >
                <div className="flex flex-col">
                  <div className="text-md md:text-lg font-medium text-gray-900">
                    {formattedDate}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formattedTime}
                  </div>
                </div>
                <button
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${
                    isSelected
                      ? 'text-white bg-green-600 hover:bg-green-700 w-8 h-8 p-0 flex items-center justify-center'
                      : 'bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDatetimeSelect?.(datetime);
                  }}
                >
                  {isSelected ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : 'Select'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Special handling for suggested platforms
  if (field.key === 'platform_options' && Array.isArray(value)) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-800">{field.label}</label>
        <div className="space-y-2">
          {value.map((platform, index) => {
            const isSelected = platform === selectedPlatform;
            
            return (
              <div 
                key={index} 
                className={`p-4 rounded-lg cursor-pointer flex justify-between items-center ${
                  isSelected 
                    ? 'border-[1px] border-green-500 bg-green-50' 
                    : 'border-[1px] border-gray-300 bg-gray-50 hover:bg-gray-50'
                }`}
                onClick={() => onPlatformSelect?.(platform)}
              >
                <div className="flex flex-col">
                  <div className="text-md font-medium text-gray-900">
                    {platform}
                  </div>
                </div>
                <button
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${
                    isSelected
                      ? 'text-white bg-green-600 hover:bg-green-700 w-8 h-8 p-0 flex items-center justify-center'
                      : 'bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlatformSelect?.(platform);
                  }}
                >
                  {isSelected ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : 'Select'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Special handling for selected platforms
  if (field.key === 'platforms_selected' && Array.isArray(value)) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-500">{field.label}</label>
        <div className="flex flex-wrap gap-2">
          {value.map((platform, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Special handling for appointment link when appointment_id is available
  if (field.key === 'appointment_id' && value) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-500">Appointment Details</label>
        <Link 
          href={`/appointments/${value}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Appointment
        </Link>
      </div>
    );
  }

  // Use base renderer for all other fields
  return (
    <BaseRenderer
      field={field}
      value={value}
      details={details}
    />
  );
} 