import React from 'react';

interface Appointment {
  id: string;
  appointment_datetime: string;
  appointment_type: string;
  appointment_location: string;
  platform_name?: string;
  platform_link?: string;
  status: string;
  notes?: string;
  appointment_title?: string;
}

interface ShareButtonsProps {
  appointment: Appointment;
  locale: string;
  className?: string;
}

function formatAppointmentDate(dateString: string, locale: string) {
  const date = new Date(dateString);
  if (locale === 'it') {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

function formatAppointmentTime(dateString: string, locale: string) {
  const date = new Date(dateString);
  if (locale === 'it') {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}

function getAppointmentShareText(appointment: Appointment, locale: string) {
  let text = '';
  if (locale === 'it') {
    text += `Appuntamento: ${appointment.appointment_title || ''}\n`;
    text += `Data: ${formatAppointmentDate(appointment.appointment_datetime, locale)}\n`;
    text += `Ora: ${formatAppointmentTime(appointment.appointment_datetime, locale)}\n`;
    if (appointment.appointment_location) text += `Luogo: ${appointment.appointment_location}\n`;
    if (appointment.platform_link) text += `Piattaforma: ${appointment.platform_link}\n`;
    if (appointment.notes) text += `Note: ${appointment.notes}\n`;
  } else {
    text += `Appointment: ${appointment.appointment_title || ''}\n`;
    text += `Date: ${formatAppointmentDate(appointment.appointment_datetime, locale)}\n`;
    text += `Time: ${formatAppointmentTime(appointment.appointment_datetime, locale)}\n`;
    if (appointment.appointment_location) text += `Location: ${appointment.appointment_location}\n`;
    if (appointment.platform_link) text += `Platform: ${appointment.platform_link}\n`;
    if (appointment.notes) text += `Notes: ${appointment.notes}\n`;
  }
  return text;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ appointment, locale, className }) => {
  const text = getAppointmentShareText(appointment, locale);

  return (
    <div className={`flex flex-row gap-2 ${className || ''}`}>
      <button
        onClick={() => {
          const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
        }}
        className="flex-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow flex items-center gap-1 transition-colors justify-center min-w-[0]"
        title="Share via WhatsApp"
      >
        <span className="flex-none inline-flex items-center justify-center w-7 h-7 bg-green-500 text-white rounded-full mr-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
        </span>
        <span className="whitespace-nowrap">WhatsApp</span>
      </button>
      <button
        onClick={() => {
          const url = `mailto:?subject=Appointment&body=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
        }}
        className="flex-1 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow flex items-center gap-1 transition-colors justify-center min-w-[0]"
        title="Share via Email"
      >
        <span className="flex-none inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full mr-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </span>
        <span className="whitespace-nowrap">Email</span>
      </button>
    </div>
  );
};

export default ShareButtons; 