"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useBusinessProfile } from '@/contexts/BusinessProfileContext';
import PasswordVerification from '@/components/service-board/PasswordVerification';
import ServiceBoardActionCard from '@/components/service-board/ServiceBoardActionCard';
import { ServiceBoardAction, isAppointmentSchedulingDetails } from '@/types/service-board';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import ContactModal from '@/components/modals/ContactModal';
import PaymentsModal from '@/components/modals/PaymentsModal';
import AddActionModal from '@/components/modals/AddActionModal';
import ActionSubmissionModal from '@/components/modals/ActionSubmissionModal';
import ShareModal from '@/components/modals/ShareModal';
import SupportRequestModal from '@/components/modals/SupportRequestModal';
import { getPlatformIcon } from '@/lib/platform-icons';
import { QRCodeSVG } from 'qrcode.react';
import ShareButtons from '@/components/service-board/ShareButtons';
import MapButtons from '@/components/service-board/MapButtons';
import RescheduleCancelButton from '@/components/service-board/RescheduleCancelButton';
import RichTextDisplay from '@/components/ui/RichTextDisplay';


interface BusinessData {
  business_id: string;
  business_name: string;
  business_public_uuid?: string;
  business_description?: string;
  business_phone?: any;
  business_email?: any;
  business_img_cover_mobile?: string;
  business_img_cover_desktop?: string;
  business_img_profile?: string;
}

interface ServiceBoardData {
  board_id: string;
  board_title: string;
  board_description?: string;
  status: string;
  created_at: string;
  service?: {
    service_name: string;
    service_description?: string;
  };
  servicerequest?: {
    request_id: string;
    request_reference: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_notes?: string;
    status: string;
    price_subtotal?: number;
    request_date?: string;
    request_time_start?: string;
    request_time_end?: string;
    date_created: string;
    date_updated?: string;
    selected_service_items_snapshot?: Array<{
      service_item_id: number;
      item_name: string;
      quantity: number;
      price_at_request: number;
    }>;
    question_responses_snapshot?: Array<{
      question_id: number;
      question_text: string;
      question_type: string;
      response_text?: string;
      selected_options?: Array<{
        option_id: number;
        option_text: string;
      }>;
    }>;
    requirement_responses_snapshot?: Array<{
      requirement_block_id: number;
      title?: string;
      requirements_text: string;
      customer_confirmed: boolean;
    }>;
  };
}

interface BusinessProfileContextValue {
  businessData: BusinessData;
  businessSettings: any;
  businessLinks: any[];
  websiteLinkUrl?: string;
  googleReviewLinkUrl?: string;
  bookingLinkUrl?: string;
  businessPaymentMethods: any[];
  themeVariables: any;
  isDarkBackground: boolean;
  themeColorText: string;
  themeColorButton: string;
  themeColorBackground: string;
  themeColorBackgroundSecondary: string;
  themeColorBackgroundCard: string;
}

interface ServiceBoardPageProps {
  params: {
    locale: string;
    business_urlname: string;
    board_ref: string;
  };
}

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


// Helper function to get relative time
const platformLabelMap: Record<string, string> = {
  google_meet: 'Google Meet',
  microsoft_teams: 'Microsoft Teams',
  zoom: 'Zoom',
  skype: 'Skype'
};

const humanizePlatformName = (name?: string): string => {
  if (!name) return '';
  const lower = name.toLowerCase();
  if (platformLabelMap[lower as keyof typeof platformLabelMap]) {
    return platformLabelMap[lower as keyof typeof platformLabelMap];
  }
  // if snake_case like microsoft_teams
  if (name.includes('_')) {
    return name
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  // default: capitalize words
  return name.replace(/\b\w/g, c => c.toUpperCase());
};

const getRelativeTime = (dateString: string, t: any) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return t('justNow');
  if (diffInSeconds < 3600) return t('minutesAgo', { minutes: Math.floor(diffInSeconds / 60) });
  if (diffInSeconds < 86400) return t('hoursAgo', { hours: Math.floor(diffInSeconds / 3600) });
  if (diffInSeconds < 604800) return t('daysAgo', { days: Math.floor(diffInSeconds / 86400) });
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to get status text with translations
const getStatusText = (status: string, t: any): string => {
  switch (status.toLowerCase()) {
    case "in_progress":
      return t('inProgress');
    case "pending":
      return t('pending');
    case "completed":
      return t('completed');
    case "cancelled":
      return t('cancelled');
    case "confirmed":
      return t('confirmed');
    case "rejected":
      return t('rejected');
    case "rescheduled":
      return t('rescheduled');
    default:
      return status.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('pending') || statusLower === 'waiting') {
    return 'bg-yellow-200 text-yellow-800';
  }
  if (statusLower.includes('confirm') || statusLower === 'scheduled') {
    return 'bg-green-100 text-green-800';
  }
  if (statusLower.includes('reject') || statusLower === 'failed') {
    return 'bg-red-100 text-red-800';
  }
  if (statusLower.includes('reschedul')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (statusLower.includes('cancel')) {
    return 'bg-gray-100 text-gray-800';
  }
  if (statusLower.includes('progress')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending_customer':
      return (
        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'confirmed':
      return (
        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'rejected':
      return (
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'rescheduled':
      return (
        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
      );
    case 'cancelled':
      return (
        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
};

// Helper function to get status color for timeline dots
const getTimelineDotColor = (action: ServiceBoardAction) => {
  if (action.action_type === 'appointment_scheduling' && isAppointmentSchedulingDetails(action.action_details)) {
    const status = action.action_details.confirmation_status.toLowerCase();
    if (status.includes('confirm')) {
      return 'bg-green-500 border-green-600';
    }
    if (status.includes('reject')) {
      return 'bg-red-500 border-red-600';
    }
    if (status.includes('cancel')) {
      return 'bg-gray-500 border-gray-600';
    }
    if (status.includes('reschedul')) {
      return 'bg-orange-500 border-orange-600';
    }
    return 'bg-yellow-500 border-yellow-600';
  }

  // For other action types, use action_status
  const status = action.action_status.toLowerCase();
  if (status === 'completed') {
    return 'bg-green-500 border-green-600';
  }
  if (status === 'failed') {
    return 'bg-red-500 border-red-600';
  }
  if (status === 'cancelled') {
    return 'bg-gray-500 border-gray-600';
  }
  if (status === 'in_progress') {
    return 'bg-blue-500 border-blue-600';
  }
  return 'bg-yellow-500 border-yellow-600';
};

// Move these above getAppointmentShareText
const formatAppointmentDate = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  if (locale === 'it') {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

const formatAppointmentTime = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  if (locale === 'it') {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};

// Helper for WhatsApp and Email share
const getAppointmentShareText = (appointment: Appointment, locale: string) => {
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
};

export default function ServiceBoardPage({ params }: ServiceBoardPageProps) {
  const [actions, setActions] = useState<ServiceBoardAction[]>([]);
  const [boardData, setBoardData] = useState<ServiceBoardData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSupportRequestModal, setShowSupportRequestModal] = useState(false);
  const [showUpcomingAppointmentModal, setShowUpcomingAppointmentModal] = useState(false);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const hasShownUpcomingRef = useRef(false);
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [isCopied, setIsCopied] = useState(false);
  const [showRescheduleCancelModal, setShowRescheduleCancelModal] = useState<string | null>(null); // appointment id or null
  const [rescheduleCancelReason, setRescheduleCancelReason] = useState('');
  const [rescheduleCancelLoading, setRescheduleCancelLoading] = useState(false);
  const rescheduleCancelReasons = [
    'Unexpected commitment',
    'Feeling unwell',
    'Transport issues',
    'Work conflict',
    'Family emergency',
    'Other',
  ];
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Action submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isSuccess: boolean;
    message: string;
    technicalDetails?: string;
  } | null>(null);
  const [submissionModalCopied, setSubmissionModalCopied] = useState(false);
  
  // Animation state for new actions
  const [newlyAddedActionId, setNewlyAddedActionId] = useState<string | null>(null);
  
  const { board_ref } = params;
  const { 
    businessData, 
    businessSettings, 
    businessLinks, 
    websiteLinkUrl, 
    googleReviewLinkUrl, 
    bookingLinkUrl, 
    businessPaymentMethods, 
    themeVariables, 
    isDarkBackground, 
    themeColorText, 
    themeColorButton,
    themeColorBackground,
    themeColorBackgroundSecondary,
    themeColorBackgroundCard
  } = useBusinessProfile() as BusinessProfileContextValue;

  const t = useTranslations('Common');
  const tBooking = useTranslations('Booking');
  const tServiceBoard = useTranslations('ServiceBoard');

  const businessCoverImageUrl = businessData.business_img_cover_mobile || 'https://placehold.co/1200x300/e0e0e0/ffffff?text=Business+Cover';

  const fetchServiceBoardData = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/service-boards/${board_ref}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch service board data');
      }
      setBoardData(data.board);
    } catch (err) {
      console.error('Error fetching board data:', err);
    }
  };

  const fetchServiceBoardActions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/businesses/${businessData.business_id}/service-boards/${board_ref}/actions`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.requiresPassword) {
          setRequiresPassword(true);
          return;
        }
        throw new Error(data.error || 'Failed to fetch service board actions');
      }
      
      // Sort actions by created_at date, most recent first
      const sortedActions = data.sort((a: ServiceBoardAction, b: ServiceBoardAction) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setActions(sortedActions);
      setRequiresPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching actions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/service-boards/${board_ref}/appointments`);
      const data = await response.json();
      console.log('Appointments API response:', data); // Debug log
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
      setAppointments(data.appointments);
      console.log('Appointments state updated:', data.appointments); // Debug log
      
      // Check for upcoming appointments
      const now = new Date();
      const upcomingAppointments = data.appointments.filter((appointment: Appointment) => {
        const appointmentDate = new Date(appointment.appointment_datetime);
        return appointmentDate > now;
      });
      
      if (upcomingAppointments.length > 0) {
        // Sort by date and get the next one
        const sortedUpcoming = upcomingAppointments.sort((a: Appointment, b: Appointment) => 
          new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
        );
        setNextAppointment(sortedUpcoming[0]);
        setShowUpcomingAppointmentModal(true);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  useEffect(() => {
    if (businessData.business_id) {
      console.log('Fetching data for business:', businessData.business_id); // Debug log
      fetchServiceBoardData();
      fetchServiceBoardActions();
      fetchAppointments();
    }
  }, [businessData.business_id, board_ref]);

  // Safety: if nextAppointment arrives later from any source, open the modal once
  useEffect(() => {
    if (nextAppointment && !hasShownUpcomingRef.current) {
      setShowUpcomingAppointmentModal(true);
      hasShownUpcomingRef.current = true;
    }
  }, [nextAppointment]);



  if (requiresPassword) {
    return (
      <PasswordVerification
        businessId={businessData.business_id}
        boardRef={board_ref}
        onVerified={fetchServiceBoardActions}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="container h-screen mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container h-screen flex flex-col items-center justify-center mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="flex flex-col justify-center items-center">
            <svg className="h-8 w-8 text-red-800 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="mt-2 text-md  text-red-700">{error}</div>
          </div>
          <button
            onClick={fetchServiceBoardActions}
            className="mt-3 text-sm font-medium text-gray-60"
          >
            {tServiceBoard('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const toggleContactModal = (type: 'phone' | 'email') => {
    setContactType(type);
    setShowContactModal(!showContactModal);
  };

  const togglePaymentsModal = () => {
    setShowPaymentsModal(!showPaymentsModal);
  };

  const getCurrentBoardUrl = () => {
    return `${window.location.origin}/${params.locale}/${params.business_urlname}/s/${params.board_ref}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentBoardUrl());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaWhatsApp = () => {
    const url = encodeURIComponent(getCurrentBoardUrl());
    const text = encodeURIComponent(`Check out this service board: ${boardData?.board_title || 'Service Board'}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const url = getCurrentBoardUrl();
    const subject = encodeURIComponent(`Service Board: ${boardData?.board_title || 'Service Board'}`);
    const body = encodeURIComponent(`Check out this service board: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  // Submission modal helper functions
  const copyToClipboardForSubmission = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentBoardUrl());
      setSubmissionModalCopied(true);
      setTimeout(() => setSubmissionModalCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const shareViaWhatsAppForSubmission = () => {
    const url = encodeURIComponent(getCurrentBoardUrl());
    const text = encodeURIComponent('Check out this service board: ');
    window.open(`https://wa.me/?text=${text}${url}`, '_blank');
  };

  const shareViaEmailForSubmission = () => {
    const url = getCurrentBoardUrl();
    const subject = encodeURIComponent('Service Board Link');
    const body = encodeURIComponent(`Check out this service board: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareForSubmission = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Service Board',
        text: 'Check out this service board',
        url: getCurrentBoardUrl(),
      });
    } else {
      // Fallback to WhatsApp
      shareViaWhatsAppForSubmission();
    }
  };

  const handleSubmissionModalClose = () => {
    setShowSubmissionModal(false);
    setSubmissionResult(null);
    setSubmissionModalCopied(false);
    
    // No need to refresh actions since they're already added immediately
    // The silent refresh is no longer needed
  };

  // Add new action to timeline with animation
  const addNewActionToTimeline = (newAction: any) => {
    // Transform the new action to match the ServiceBoardAction format
    const transformedAction: ServiceBoardAction = {
      action_id: newAction.action_id,
      board_id: newAction.board_id,
      customer_id: newAction.customer_id,
      action_type: newAction.action_type,
      action_title: newAction.action_title,
      action_description: newAction.action_description,
      action_details: newAction.action_details,
      action_status: newAction.action_status,
      is_customer_action_required: newAction.is_customer_action_required,
      is_archived: newAction.is_archived,
      created_at: newAction.created_at,
      updated_at: newAction.updated_at,
      due_date: newAction.due_date
    };

    // Add the new action to the beginning of the actions array
    setActions(prevActions => [transformedAction, ...prevActions]);
    
    // Set animation state for the new action
    setNewlyAddedActionId(transformedAction.action_id);
    
    // Clear animation state after animation completes
    setTimeout(() => {
      setNewlyAddedActionId(null);
    }, 800);
  };

  // Silent refresh function that doesn't show loading state
  const refreshActionsSilently = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessData.business_id}/service-boards/${board_ref}/actions`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 && data.requiresPassword) {
          setRequiresPassword(true);
          return;
        }
        throw new Error(data.error || 'Failed to fetch service board actions');
      }
      
      // Sort actions by created_at date, most recent first
      const sortedActions = data.sort((a: ServiceBoardAction, b: ServiceBoardAction) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setActions(sortedActions);
      setRequiresPassword(false);
    } catch (err) {
      console.error('Error silently refreshing actions:', err);
      // Don't show error to user for silent refresh
    }
  };

  const getButtonContentColor = (bgColor: string) => {
    if (!bgColor) return 'white';
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  const buttonContentColor = getButtonContentColor(themeColorButton || '#000000');
  const primaryButtonStyle = {
    backgroundColor: themeColorButton || '#000000',
    color: buttonContentColor
  };

  const circularButtonBaseClass = `flex flex-col items-center rounded-full transition-colors duration-200`;

  const getButtonIconStyle = () => {
    return {
      filter: buttonContentColor === 'white' ? 'invert(1)' : 'none',
    };
  };

  const filteredSocialLinks = businessLinks.filter(
    (link) =>
      link.link_type !== 'website' &&
      link.link_type !== 'google_review' &&
      link.link_type !== 'phone' &&
      link.link_type !== 'email' &&
      link.link_type !== 'booking'
  );

  return (
    <div className="container mx-auto max-w-none" style={{backgroundColor: themeColorBackground}}>
      {/* Business Cover for xs to md devices */}
      <div className="lg:hidden w-full relative">
        <div className="relative w-full h-[150px] overflow-hidden bg-gray-100">
          <img
            src={businessCoverImageUrl}
            alt={businessData.business_name || 'Business cover'}
            className="w-full h-full object-cover"
          />
          {/* Gradient mask for fade effect from bottom to navbar */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${themeColorBackground} 20%, ${themeColorBackground}90, transparent)`
            }}
          ></div>
        </div>
        {/* Profile image positioned to align with navbar content */}
        <div className="absolute bottom-2 left-6 w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-3 border-white shadow-lg">
          {businessData.business_public_uuid ? (
            <img
              src={`/uploads/business/${businessData.business_public_uuid}/profile.webp`}
              alt={businessData.business_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <span className="text-xs font-medium text-gray-500">
                {businessData.business_name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Navbar */}
      <div className="px-6 lg:px-8 py-2 lg:py-5 pb-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Column - Board Info */}
          <div className="flex-1 flex items-center gap-x-4">
            <div className="hidden lg:block w-14 h-14 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {businessData.business_img_profile ? (
                    <Image
                      src={businessData.business_img_profile}
                      alt={businessData.business_name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-2xl font-medium text-gray-500">
                        {businessData.business_name.charAt(0)}
                      </span>
                    </div>
                  )}
            </div>
            {boardData && (
              <div className="flex flex-col gap-y-3 gap-x-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{boardData.board_title}</h1>
                  <div className="flex items-center flex-wrap gap-y-1 gap-x-2 mt-1">
                  <p className="font-semibold">{businessData.business_name}</p>
                  {boardData.service && (
                       <div className="text-sm">
                            <p className="text-sm opacity-80 font-medium">{boardData.service.service_name}</p>
                       </div>
                  )}
                  {boardData.board_description && (
                    <p className="hidden text-xs line-clamp-1 opacity-80">{boardData.board_description}</p>
                  )}
                </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-lg px-2 py-1 lg:px-2 lg:py-1 font-medium whitespace-nowrap ${
                    boardData.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                    boardData.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    boardData.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                    boardData.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>{getStatusText(boardData.status, tServiceBoard)}</span>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="lg:hidden flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  <span className='border-1 border-gray-400 rounded-lg px-2 py-1 text-xs whitespace-nowrap'>Ref: {params.board_ref}</span>
                  <span className='text-xs whitespace-nowrap'>{getRelativeTime(boardData.created_at, tServiceBoard)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Actions and Share */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {/* Share Menu Container - Hidden on xs to md, visible on lg+ */}
            <div className="relative share-menu-container hidden lg:block">
              {/* Pill Link Container */}
              <div className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                isCopied 
                  ? 'border-green-500 shadow-lg' 
                  : 'border-gray-500 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: isCopied ? (themeColorButton  || '#ffffff') : (themeColorBackgroundCard || '#ffffff')
              }}>
                <div className='flex items-center gap-2'>
                {/* Globe Icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: themeColorText || '#000000' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                {/* URL Text */}
                <span className="text-sm font-medium truncate max-w-[250px]" style={{ color: themeColorText || '#000000' }}>
                  {getCurrentBoardUrl().replace(/^https?:\/\//, '')}
                </span>
                </div>
                <div>
                {/* Copy Button */}
                <button
                  onClick={copyToClipboard}
                  className={`p-1 rounded-full transition-all duration-200 ${
                    isCopied 
                      ? 'bg-green-600 text-white' 
                      : 'hover:bg-gray-600'
                  }`}
                  style={{
                    color: isCopied ? undefined : (themeColorText || '#000000')
                  }}
                  title={isCopied ? 'Copied!' : 'Copy link'}
                >
                  {isCopied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                
                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-1 rounded-full hover:bg-gray-600 transition-all duration-200"
                  style={{
                    color: themeColorText || '#000000'
                  }}
                  title="Share"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                </div>
              </div>
              

            </div>
            
            {/* Support Button */}
             <button
              onClick={() => setShowSupportRequestModal(true)}
              className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: themeColorBackgroundCard || '#ffffff',
                color: themeColorText || '#000000',
                border: `2px solid ${themeColorText || '#000000'}`
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Support Request</span>
            </button>

            {/* Add Action Button on right of the Share Menu Container - Hidden on xs to md, visible on lg+ */}
            <button
              onClick={() => setShowAddActionModal(true)}
              className="hidden lg:flex items-center gap-2 px-5 py-3 bg-black text-white border border-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">{tServiceBoard('addAction')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between">

        {/* Appointments section */}
        {appointments && appointments.length > 0 && (
                <div className="mb-5 lg:w-[25%] lg:order-2 p-5 md:p-6 bg-black/5 lg:bg-transparent">
                  <div className="space-y-4 sticky top-0 lg:pt-2">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="text-gray-900 bg-white rounded-2xl border border-gray-200 p-5 lg:p-6 shadow-sm">
                        <div className="flex flex-col gap-4">
                          {/* Left column: appointment details */}
                          <div className="flex-1 min-w-0">
                        {appointment.appointment_title && (
                          <div className="mb-3 flex flex-row items-center justify-between gap-2">
                            <h3 className="text-xl font-semibold text-gray-900">{appointment.appointment_title}</h3>
                            <span className={`text-xs md:text-sm px-3 py-1 capitalize rounded-full ${getStatusColor(appointment.status)}`}>
                              {getStatusText(appointment.status, tServiceBoard)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center flex-row flex-wrap gap-x-6 gap-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            {/* Date and Time */}
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <div className="flex flex-col -space-y-1">
                                <span className="text-lg lg:text-xl font-medium text-gray-900">
                                  {formatAppointmentDate(appointment.appointment_datetime, params.locale)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-lg lg:text-xl font-medium text-gray-900">
                                {formatAppointmentTime(appointment.appointment_datetime, params.locale)}
                              </span>
                            </div>
                          </div>
                          <div>
                                  {/* Location with Maps/Waze*/}
                                  {appointment.appointment_location && appointment.appointment_type !== 'online' && (
                                        <div className="flex items-center gap-2 flex-wrap">
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                          <span className="text-sm text-gray-600 mr-2">{appointment.appointment_location}</span>
                                          <button
                                            onClick={() => navigator.clipboard.writeText(appointment.appointment_location)}
                                            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors flex items-center gap-1"
                                            title="Copy address"
                                          >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                          </button>
                                          <button
                                            onClick={() => {
                                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.appointment_location)}`;
                                              window.open(url, '_blank');
                                            }}
                                            className="px-2 py-1 text-xs font-medium text-white bg-[#4285F4] hover:bg-[#357ae8] rounded-full shadow-sm transition-colors flex items-center gap-1"
                                            title="Open in Google Maps"
                                          >
                                            <img src="/icons/appointments/googlemaps.svg" alt="Google Maps" className="w-4 h-4 mr-1" />Maps
                                          </button>
                                          <button
                                            onClick={() => {
                                              const url = `https://waze.com/ul?q=${encodeURIComponent(appointment.appointment_location)}`;
                                              window.open(url, '_blank');
                                            }}
                                            className="px-2 py-1 text-xs font-medium text-white bg-[#33CCFF] hover:bg-[#1eb8e6] rounded-full shadow-sm transition-colors flex items-center gap-1"
                                            title="Open in Waze"
                                          >
                                            <img src="/icons/appointments/waze.svg" alt="Waze" className="w-4 h-4 mr-1" />Waze
                                          </button>
                                    </div>
                                  )}
                          </div>
                        </div>
                        
                        {/* Platform with Icon and Link - Now outside the flex-wrap container */}
                        {(appointment.platform_name || appointment.platform_link) && (
                          <div className="space-y-2 w-full mb-3">
                            {appointment.platform_name && (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                  <Image
                                    src={getPlatformIcon(humanizePlatformName(appointment.platform_name))}
                                    alt={humanizePlatformName(appointment.platform_name)}
                                    width={24}
                                    height={24}
                                    className="w-4 h-4 lg:w-4 lg:h-4"
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{humanizePlatformName(appointment.platform_name)}</span>
                              </div>
                            )}
                            {appointment.platform_link && (
                              <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden w-full">
                                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="text-xs text-gray-600 truncate flex-1 min-w-0">
                                  {appointment.platform_link}
                                </span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => {
                                      if (appointment.platform_link) {
                                        navigator.clipboard.writeText(appointment.platform_link);
                                      }
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="Copy link"
                                  >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                  </button>
                                  <a
                                    href={appointment.platform_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                  >
                                    {tServiceBoard('openLink')}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="space-y-2">
                          {/* Notes */}
                          {appointment.notes && (
                            <div className="flex items-start gap-2 mt-3">
                              <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-600">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                          {/* Right column: utility and action buttons */}
                          <div className="flex flex-col gap-0 w-full">
                            {/* Utility share buttons */}
                            <div className="flex flex-col gap-1 mb-2 w-full md:w-auto">
                              {/* Utility share buttons in a row */}
                              <div className="flex flex-row gap-2 mb-1 w-full md:w-auto">
                                <button
                                  onClick={() => {
                                    const text = getAppointmentShareText(appointment, params.locale);
                                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="flex-1 px-3 py-2 lg:px-4 lg:py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow flex items-center gap-1 transition-colors justify-center min-w-[0]"
                                  title="Share via WhatsApp"
                                >
                                  <span className="flex-none inline-flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 bg-green-500 text-white rounded-full mr-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                                  </span>
                                  <span className="whitespace-nowrap">WhatsApp</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const text = getAppointmentShareText(appointment, params.locale);
                                    const url = `mailto:?subject=Appointment&body=${encodeURIComponent(text)}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="flex-1 px-3 py-2 lg:px-4 lg:py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow flex items-center gap-1 transition-colors justify-center min-w-[0]"
                                  title="Share via Email"
                                >
                                  <span className="flex-none inline-flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 text-white rounded-full mr-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                  </span>
                                  <span className="whitespace-nowrap">Email</span>
                                </button>
                              </div>
                            </div>
                            {/* Appointment Actions: Reschedule & Cancel in a row */}
                            {['confirmed', 'scheduled'].includes(appointment.status) && (
                              <div className="w-full md:w-auto flex flex-col justify-end">
                                <div className="text-xs text-gray-500 mb-1 text-center md:text-right">
                                  {tServiceBoard('rescheduleOrCancelPrompt')}{' '}
                                  <button
                                    onClick={() => {
                                      setShowRescheduleCancelModal(appointment.id);
                                      setRescheduleCancelReason('');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                  >
                                    {tServiceBoard('rescheduleOrCancel')}
                                  </button>
                                </div>
                                {/* Modal for reschedule/cancel */}
                                {showRescheduleCancelModal === appointment.id && (
                                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg relative">
                                      <button
                                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowRescheduleCancelModal(null)}
                                      >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                      <h3 className="text-2xl font-bold mb-3 text-center">{tServiceBoard('rescheduleOrCancelTitle')}</h3>
                                      <div className="mb-3 text-xs text-gray-600 text-center">{tServiceBoard('optionalReasonPrompt')}</div>
                                      <div className="flex flex-col gap-2 mb-4">
                                        {rescheduleCancelReasons.map((reason) => (
                                          <label key={reason} className="flex items-center gap-2 text-xs text-gray-400 font-normal cursor-pointer">
                                            <input
                                              type="radio"
                                              name="reschedule-cancel-reason"
                                              value={reason}
                                              checked={selectedReason === reason}
                                              onChange={() => setSelectedReason(reason)}
                                            />
                                            <span>{tServiceBoard(`reason_${reason.replace(/\s+/g, '').toLowerCase()}`)}</span>
                                          </label>
                                        ))}
                                        {selectedReason === 'Other' && (
                                          <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded p-2 text-xs text-gray-500 mt-1"
                                            placeholder={tServiceBoard('enterYourReason')}
                                            value={customReason}
                                            onChange={e => setCustomReason(e.target.value)}
                                          />
                                        )}
                                      </div>
                                      <div className="flex flex-row gap-2 mt-2">
                                        <button
                                          disabled={rescheduleCancelLoading}
                                          onClick={async () => {
                                            setRescheduleCancelLoading(true);
                                            try {
                                              const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/reschedule`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  action_id: appointment.id,
                                                  reason: selectedReason === 'Other' ? customReason : selectedReason,
                                                  current_datetime: appointment.appointment_datetime,
                                                }),
                                              });
                                              if (!response.ok) {
                                                const errorData = await response.json().catch(() => ({}));
                                                throw new Error(errorData.message || tServiceBoard('failedToRequestReschedule'));
                                              }
                                              alert(tServiceBoard('rescheduleRequestSent'));
                                              setShowRescheduleCancelModal(null);
                                            } catch (error) {
                                              alert(error instanceof Error ? error.message : tServiceBoard('errorRequestingReschedule'));
                                            } finally {
                                              setRescheduleCancelLoading(false);
                                            }
                                          }}
                                          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-black hover:bg-gray-900 rounded-md shadow transition-colors disabled:opacity-50"
                                        >
                                          {tServiceBoard('requestReschedule')}
                                        </button>
                                        <button
                                          disabled={rescheduleCancelLoading}
                                          onClick={() => setShowCancelConfirm(true)}
                                          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow transition-colors disabled:opacity-50"
                                        >
                                          {tServiceBoard('cancelAppointment')}
                                        </button>
                                      </div>
                                      {/* Double confirmation step below buttons */}
                                      {showCancelConfirm && (
                                        <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50 flex flex-col gap-3 w-full max-w-full">
                                          <div className="text-xs text-red-700 text-center font-medium">
                                            {tServiceBoard('cancelWarning')}
                                          </div>
                                          <div className="flex flex-row gap-2 w-full">
                                            <button
                                              type="button"
                                              onClick={() => setShowCancelConfirm(false)}
                                              className="sm:flex-1 w-full px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md shadow transition-colors"
                                            >
                                              {t('back')}
                                            </button>
                                            <button
                                              disabled={rescheduleCancelLoading}
                                              onClick={async () => {
                                                setRescheduleCancelLoading(true);
                                                try {
                                                  const response = await fetch(`/api/businesses/${businessData.business_id}/appointments/cancel`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                      action_id: appointment.id,
                                                      reason: selectedReason === 'Other' ? customReason : selectedReason,
                                                    }),
                                                  });
                                                  if (!response.ok) {
                                                    const errorData = await response.json().catch(() => ({}));
                                                    throw new Error(errorData.message || tServiceBoard('failedToCancelAppointment'));
                                                  }
                                                  alert(tServiceBoard('appointmentCancelled'));
                                                  setShowRescheduleCancelModal(null);
                                                  setShowCancelConfirm(false);
                                                } catch (error) {
                                                  alert(error instanceof Error ? error.message : tServiceBoard('errorCancellingAppointment'));
                                                } finally {
                                                  setRescheduleCancelLoading(false);
                                                }
                                              }}
                                              className="sm:flex-1 w-full px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md shadow transition-colors disabled:opacity-50"
                                            >
                                              {tServiceBoard('confirmCancel')}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
          )}
        
        {/* Timeline Section */}
        <div className="w-full  text-gray-900 flex-1 lg:min-w-[50%] lg:max-w-[800px] lg:order-1 p-5 md:p-6">
          {/* Board Data at the beginning of timeline */}

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-[-8px] lg:left-5 top-0 bottom-0 w-0.5 bg-blue-500"></div>
            <div className="space-y-2 lg:space-y-4">
              {/* Other timeline actions */}
              {actions.map((action) => (
                <div 
                  key={action.action_id} 
                  className={`relative pl-1 lg:pl-10 transition-all duration-500 ease-out ${
                    newlyAddedActionId === action.action_id 
                      ? 'animate-slideInFromTop opacity-100 scale-100' 
                      : 'opacity-100 scale-100'
                  }`}
                >
                  <div className={`absolute left-[-7px] lg:left-[20px] -translate-x-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${getTimelineDotColor(action)} transition-all duration-500 ${
                    newlyAddedActionId === action.action_id ? 'animate-pulse scale-110' : ''
                  }`}></div>
                  <ServiceBoardActionCard 
                    action={action}
                    onActionUpdate={fetchServiceBoardActions}
                    onAppointmentConfirmed={() => {
                      // Refresh appointments list after successful confirmation
                      fetchAppointments();
                    }}
                  />
                </div>
              ))}

              {/* Service Request - First Step (at the bottom) */}
              {boardData?.servicerequest && (
                <div className="relative pl-1 lg:pl-10">
                  <div className="absolute left-[-7px] lg:left-[20px] -translate-x-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 bg-blue-500 border-blue-600"></div>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 lg:p-7 shadow-sm">
                   
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>Request created {getRelativeTime(boardData.servicerequest.date_created, tServiceBoard)}</span>
                        {boardData.servicerequest.date_updated && boardData.servicerequest.date_updated !== boardData.servicerequest.date_created && (
                                                      <span>Last updated {getRelativeTime(boardData.servicerequest.date_updated, tServiceBoard)}</span>
                        )}
                      </div>
                   
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-bold">{tServiceBoard('customerSentRequest', { customerName: boardData.servicerequest.customer_name || 'Customer' })}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                            <span className={`text-sm px-3 py-1 rounded-lg whitespace-nowrap ${getStatusColor(boardData.servicerequest.status)}`}>
                              {getStatusText(boardData.servicerequest.status, tServiceBoard)}
                            </span>
                            <div className={`text-xs lg:text-sm px-3 py-1 rounded-lg bg-gray-50 border-2 border-gray-400 whitespace-nowrap`}>
                            <span className="text-xs lg:text-sm text-gray-500 mr-1">{tServiceBoard('reference')}:</span>
                            <span className="text-xs lg:text-sm font-medium ">{boardData.servicerequest.request_reference}</span>
                            </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-4">

                      <div>
                        <div className="space-y-2">
                          {boardData.servicerequest.customer_name && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">{tServiceBoard('name')}:</span>
                              <span className="text-md md:text-lg font-medium">{boardData.servicerequest.customer_name}</span>
                            </div>
                          )}
                          {boardData.servicerequest.customer_email && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">{tServiceBoard('email')}:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-md font-medium">{boardData.servicerequest.customer_email}</span>
                                <button
                                  onClick={() => {
                                    if (boardData.servicerequest?.customer_email) {
                                      navigator.clipboard.writeText(boardData.servicerequest.customer_email);
                                      // You could add a toast notification here
                                    }
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy email"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                          {boardData.servicerequest.customer_phone && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400">{tServiceBoard('phone')}:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-md font-medium">{boardData.servicerequest.customer_phone}</span>
                                <button
                                  onClick={() => {
                                    if (boardData.servicerequest?.customer_phone) {
                                      navigator.clipboard.writeText(boardData.servicerequest.customer_phone);
                                      // You could add a toast notification here
                                    }
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy phone number"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <a
                                  href={`tel:${boardData.servicerequest.customer_phone}`}
                                  className="p-1 hover:bg-green-200 rounded transition-colors"
                                  title="Call phone number"
                                >
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </a>
                                <a
                                  href={`https://wa.me/${boardData.servicerequest.customer_phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-green-200 rounded transition-colors"
                                  title="Open WhatsApp chat"
                                >
                                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="space-y-2">
                          {boardData.servicerequest.request_date && (
                            <div className="flex gap-x-2">
                              <span className="text-sm text-gray-600">{tServiceBoard('preferredDate')}:</span>
                              <span className="text-sm font-medium">
                                {new Date(boardData.servicerequest.request_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {boardData.servicerequest.request_time_start && (
                            <div className="flex gap-x-2">
                              <span className="text-sm text-gray-600">{tServiceBoard('time')}:</span>
                              <span className="text-sm font-medium">
                                {new Date(boardData.servicerequest.request_time_start).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {boardData.servicerequest.customer_notes && (
                      <div className="mt-4">
                        <h4 className="text-xs font-medium text-gray-500 mb-2">{tServiceBoard('customerNotes')}</h4>
                        <p className="text-sm p-3 rounded-md bg-blue-100 border-2 border-blue-800">
                          {boardData.servicerequest.customer_notes}
                        </p>
                      </div>
                    )}

                    
                    {/* Selected Service Items */}
                    {boardData.servicerequest.selected_service_items_snapshot && boardData.servicerequest.selected_service_items_snapshot.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">{tServiceBoard('selectedServiceItems')}</h4>
                        <div className="space-y-2">
                          {boardData.servicerequest.selected_service_items_snapshot.map((item, index) => (
                            <div key={index} className="border-1 border-b border-gray-300">
                              <div className="flex flex-col lg:flex-row justify-between lg:items-center">
                                  <h5 className="text-xs lg:text-sm font-medium text-gray-900">{item.item_name}</h5>
                                  <div className="flex items-center gap-2 lg:gap-4 mt-1 lg:mt-2 text-xs text-gray-500">
                                    <span>x {item.quantity}</span>
                                    <span>( €{parseFloat(item.price_at_request.toString()).toFixed(2)} )</span>
                                  </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {boardData.servicerequest.price_subtotal && (
                            <div className="flex gap-2 mt-4">
                              <span className="text-xs text-gray-600">{tServiceBoard('estimatedPrice')}:</span>
                              <span className="text-sm font-medium">
                                €{parseFloat(boardData.servicerequest.price_subtotal.toString()).toFixed(2)}
                              </span>
                            </div>
                   )}

                    {/* Question Responses */}
                    {boardData.servicerequest.question_responses_snapshot && boardData.servicerequest.question_responses_snapshot.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">{tServiceBoard('questionResponses')}</h4>
                        <div className="space-y-3">
                          {boardData.servicerequest.question_responses_snapshot.map((response, index) => (
                            <div key={index} className="border-b-2">
                              <h5 className="text-xs font-medium text-gray-500">{response.question_text}</h5>
                              {response.response_text && (
                                <p className="text-sm text-gray-800 mb-1">{response.response_text}</p>
                              )}
                              {response.selected_options && response.selected_options.length > 0 && (
                                <div className="mt-1 space-y-1 mb-1">
                                  {response.selected_options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center">
                                      <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span className="text-sm text-gray-700">{option.option_text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirement Responses */}
                    {boardData.servicerequest.requirement_responses_snapshot && boardData.servicerequest.requirement_responses_snapshot.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">{tServiceBoard('requirementsConfirmation')}</h4>
                        <div className="space-y-3">
                          {boardData.servicerequest.requirement_responses_snapshot.map((response, index) => (
                            <div key={index} className="border-b-2">
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                                <div className="flex-1">
                                  {response.title && (
                                    <h5 className="text-xs font-medium text-gray-900">{response.title}</h5>
                                  )}
                                  <p className="text-xs text-gray-500 mb-1">{response.requirements_text}</p>
                                </div>
                                <div className="ml-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    response.customer_confirmed 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {response.customer_confirmed ? tServiceBoard('confirmed') : tServiceBoard('notConfirmed')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Info Section - Responsive */}
        <div className="w-full flex-1 lg:max-w-[50%] lg:order-3">
          <div className="sticky top-0 p-6">
            <div className="flex flex-col items-center">
              <div className="board-cover relative w-full h-[180px] lg:h-[200px] overflow-hidden rounded-t-2xl">
                <Image
                  src={businessCoverImageUrl}
                  alt={businessData.business_name || 'Business cover'}
                  width={800}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-20 h-20 lg:w-20 lg:h-20 -mt-8 z-10 rounded-full overflow-hidden bg-gray-100">
                {businessData.business_img_profile ? (
                  <Image
                    src={businessData.business_img_profile}
                    alt={businessData.business_name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <span className="text-2xl font-medium text-gray-500">
                      {businessData.business_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center mt-2">
                <h2 className="text-xl lg:text-xl font-semibold">{businessData.business_name}</h2>
                {businessData.business_description && (
                  <div className="mt-1">
                    <RichTextDisplay
                      content={businessData.business_description}
                      className="text-sm text-gray-600"
                      theme="light"
                    />
                  </div>
                )}
              </div>

              {/* Links and Contact Buttons */}
              <div className="w-full mt-1">
                {/* Website Link */}
                {businessSettings?.show_website && websiteLinkUrl && (
                  <div className="text-center mb-3">
                    <a 
                      href={websiteLinkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs underline hover:no-underline"
                      style={{ color: themeColorText || '#000000' }}
                    >
                      {websiteLinkUrl}
                    </a>
                  </div>
                )}

                

                {/* Contact and Payment Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                  {businessSettings?.show_btn_phone && businessData.business_phone && (
                    <button 
                      onClick={() => toggleContactModal('phone')} 
                      className={circularButtonBaseClass} 
                      style={primaryButtonStyle}
                    >
                      <div className="link-icon-wrapper w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full">
                        <Image
                          src="/icons/iconsax/phone.svg"
                          alt={t('call')}
                          width={22}
                          height={22}
                          style={getButtonIconStyle()}
                        />
                      </div>
                    </button>
                  )}

                  {businessSettings?.show_btn_email && businessData.business_email && (
                    <button 
                      onClick={() => toggleContactModal('email')} 
                      className={circularButtonBaseClass} 
                      style={primaryButtonStyle}
                    >
                      <div className="link-icon-wrapper w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full">
                        <Image
                          src="/icons/iconsax/email.svg"
                          alt={t('email')}
                          width={22}
                          height={22}
                          style={getButtonIconStyle()}
                        />
                      </div>
                    </button>
                  )}
                </div>

                {/* Payment Methods Button */}
                {businessSettings?.show_btn_payments && businessPaymentMethods && businessPaymentMethods.length > 0 && (
                  <div className="text-center mb-4">
                    <button 
                      onClick={togglePaymentsModal} 
                      className="hover:underline font-semibold text-sm flex items-center justify-center mx-auto" 
                      style={{ color: themeColorText || '#000000' }}
                    >
                      {t('paymentsMethod')}
                    </button>
                  </div>
                )}

                {/* Google Review Button */}
                {businessSettings?.show_btn_review && googleReviewLinkUrl && (
                  <div className="text-center mb-4">
                    <a 
                      href={googleReviewLinkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-2 py-1 rounded-lg w-fit font-semibold text-sm flex items-center justify-center mx-auto" 
                      style={{
                        backgroundColor: themeColorBackgroundCard || '#ffffff',
                        color: themeColorText || '#000000',
                        border: `2px solid ${themeColorText || '#000000'}`
                      }}
                    >
                      {t('leaveReview')}
                      <Image
                        src="/icons/google.png"
                        alt="Google"
                        width={24}
                        height={24}
                        className="inline-block ml-1"
                      />
                    </a>
                  </div>
                )}

                {/* Social Links */}
                {businessSettings?.show_socials && filteredSocialLinks.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-4">
                    {filteredSocialLinks.map((link, index) => (
                      <div key={index} className="text-center">
                        <a 
                          href={link.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={primaryButtonStyle}
                        >
                          <div className="link-icon-wrapper w-8 h-8 flex items-center justify-center rounded-full">
                            {link.icon && (
                              <Image
                                src={link.icon}
                                alt={link.label}
                                width={22}
                                height={22}
                              />
                            )}
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Contact Modal */}
      <ContactModal
        show={showContactModal}
        onClose={() => setShowContactModal(false)}
        businessData={businessData}
        businessSettings={businessSettings}
        initialTab={contactType}
        themeColorText={themeColorText || '#000000'}
        themeColorBackground={themeVariables?.['--lighter-theme-color-background'] || '#ffffff'}
        themeColorButton={themeColorButton || '#000000'}
        isDarkBackground={isDarkBackground}
      />

      {/* Payments Modal */}
      <PaymentsModal
        show={showPaymentsModal}
        onClose={() => setShowPaymentsModal(false)}
        businessPaymentMethods={businessPaymentMethods}
        themeColorText={themeColorText || '#000000'}
        themeColorBackground={themeVariables?.['--lighter-theme-color-background'] || '#ffffff'}
        themeColorButton={themeColorButton || '#000000'}
        isDarkBackground={isDarkBackground}
      />

      {/* Add Action Modal */}
      {showAddActionModal && (
        <AddActionModal
          show={showAddActionModal}
          onClose={() => setShowAddActionModal(false)}
          onShowSubmissionModal={(result) => {
            setSubmissionResult(result);
            setShowSubmissionModal(true);
          }}
          onActionCreated={(newAction) => {
            addNewActionToTimeline(newAction);
          }}
          businessId={businessData.business_id}
          boardRef={board_ref}
          locale={params.locale}
          themeColorText={themeColorText || '#000000'}
          themeColorBackground={themeVariables?.['--lighter-theme-color-background'] || '#ffffff'}
          themeColorButton={themeColorButton || '#000000'}
        />
      )}

      {/* Action Submission Modal */}
      <ActionSubmissionModal
        show={showSubmissionModal}
        onClose={handleSubmissionModalClose}
        isSuccess={submissionResult?.isSuccess || false}
        message={submissionResult?.message || ''}
        technicalDetails={submissionResult?.technicalDetails}
        boardUrl={submissionResult?.isSuccess ? getCurrentBoardUrl() : undefined}
        onCopyLink={copyToClipboardForSubmission}
        isCopied={submissionModalCopied}
        onShare={handleShareForSubmission}
      />

      {/* Share Modal */}
      <ShareModal
        show={showShareModal}
        onClose={() => setShowShareModal(false)}
        boardTitle={boardData?.board_title || ''}
        boardUrl={getCurrentBoardUrl()}
        onCopy={copyToClipboard}
        onShareWhatsApp={shareViaWhatsApp}
        onShareEmail={shareViaEmail}
        isCopied={isCopied}
      />

      {/* Support Request Modal */}
      <SupportRequestModal
        show={showSupportRequestModal}
        onClose={() => setShowSupportRequestModal(false)}
        actions={actions.map(action => ({
          action_id: action.action_id,
          action_title: action.action_title,
          action_type: action.action_type
        }))}
        businessId={businessData.business_id}
        boardRef={board_ref}
        customerId={boardData?.servicerequest?.request_id}
        themeColorText={themeColorText || '#000000'}
        themeColorBackground={themeColorBackground || '#ffffff'}
        themeColorButton={themeColorButton || '#000000'}
        themeColorBackgroundCard={themeColorBackgroundCard || '#ffffff'}
      />

      {/* Upcoming Appointment Modal */}
      {showUpcomingAppointmentModal && nextAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1"></div>
                <h2 className="text-sm lg:text-base font-medium text-gray-900 text-center flex-1 whitespace-nowrap">{tServiceBoard('upcomingAppointment')}</h2>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={() => setShowUpcomingAppointmentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
                {/* Appointment Details - Now centered without card wrapper */
                }
              <div className="mb-6">
                {/* Status - Now shown first */}
                <div className="flex justify-center mb-3">
                  <span className={`text-xs md:text-lg px-3 py-1 capitalize rounded-full ${getStatusColor(nextAppointment.status)}`}>
                    {getStatusText(nextAppointment.status, tServiceBoard)}
                  </span>
                </div>
                {/* Appointment Title */}
                {nextAppointment.appointment_title && (
                  <div className="mb-3 text-center">
                    <h3 className="text-xl font-semibold text-gray-900">{nextAppointment.appointment_title}</h3>
                  </div>
                )}
                {/* Date and Time */}
                <div className="flex flex-col items-center gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex flex-col text-center -space-y-1">
                        <span className="text-base lg:text-lg font-medium text-gray-900">
                          {formatAppointmentDate(nextAppointment.appointment_datetime, params.locale)}
                        </span>
                        {/* Removed the time here, as it is already shown in the next column */}
                      </div>
                    </div>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-base lg:text-lg font-medium text-gray-900">
                        {formatAppointmentTime(nextAppointment.appointment_datetime, params.locale)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Address and Map/Copy/Waze buttons */}
                {nextAppointment.appointment_location && nextAppointment.appointment_type !== 'online' && (
                  <>
                    <div className="flex flex-row items-center justify-center gap-2 mb-1">
                    <span className="text-sm text-gray-600">{nextAppointment.appointment_location}</span>
                  </div>
                    <div className="flex justify-center mb-3">
                      <MapButtons location={nextAppointment.appointment_location} className="flex-row gap-1" />
                        </div>
                  </>
                )}
                {/* Platform (for online) */}
                {nextAppointment.appointment_type === 'online' && nextAppointment.platform_name && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Image
                      src={getPlatformIcon(humanizePlatformName(nextAppointment.platform_name))}
                      alt={humanizePlatformName(nextAppointment.platform_name)}
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-gray-700">{humanizePlatformName(nextAppointment.platform_name)}</span>
                  </div>
                )}

                {/* Notes */}
                {nextAppointment.notes && (
                  <div className="flex items-start justify-center gap-2 mt-3">
                    <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-600 text-center">{nextAppointment.notes}</span>
                  </div>
                )}
                {/* Share buttons centered below notes */}
                <div className="flex justify-center mt-4 mb-2">
                  <ShareButtons appointment={nextAppointment} locale={params.locale} />
                </div>
                {/* Reschedule/Cancel button centered below share buttons */}
                {['confirmed', 'scheduled'].includes(nextAppointment.status) && (
                  <div className="flex flex-col items-center w-full md:w-auto mt-1">
                    <div className="text-xs text-gray-700 mb-1 text-center">{tServiceBoard('rescheduleOrCancelPrompt')}</div>
                    <div className="flex justify-center w-full">
                      <RescheduleCancelButton
                        appointment={nextAppointment}
                        businessId={businessData.business_id}
                        tServiceBoard={tServiceBoard}
                        t={t}
                        onReschedule={fetchAppointments}
                        onCancel={fetchAppointments}
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* QR Code - Now shown after appointment details */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-700 mb-3">{tServiceBoard('scanToAccessBoard')}</h3>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <QRCodeSVG
                      value={getCurrentBoardUrl()}
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {tServiceBoard('scanQrDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Add Action Button for xs to md devices */}
      <button
        onClick={() => setShowAddActionModal(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center justify-center"
        title={tServiceBoard('addAction')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
} 