"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// @ts-ignore
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, setHours, setMinutes } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Calendar localizer
const locales = {
  'it-IT': require('date-fns/locale/it'),
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

import { ACTION_TYPE_ICONS, ACTION_TYPE_COLORS } from '@/lib/action-templates';

interface AddActionModalProps {
  show: boolean;
  onClose: () => void;
  onShowSubmissionModal: (result: {
    isSuccess: boolean;
    message: string;
    technicalDetails?: string;
  }) => void;
  onActionCreated: (newAction: any) => void;
  businessId: string;
  boardRef: string;
  themeColorText?: string;
  themeColorBackground?: string;
  themeColorButton?: string;
}

export default function AddActionModal({
  show,
  onClose,
  onShowSubmissionModal,
  onActionCreated,
  businessId,
  boardRef,
  themeColorText = '#000000',
  themeColorBackground = '#ffffff',
  themeColorButton = '#000000'
}: AddActionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [suggestedDatetimes, setSuggestedDatetimes] = useState<string[]>([]);
  const [fixedAppointmentDate, setFixedAppointmentDate] = useState<Date | null>(null);
  const [appointmentMode, setAppointmentMode] = useState<string>('multiple_choice');
  
  // Mobile navigation state
  const [mobileStep, setMobileStep] = useState<'templates' | 'form' | 'calendar'>('templates');



  // Fetch action templates on component mount
  useEffect(() => {
    if (show && businessId) {
      fetchTemplates();
      fetchExistingAppointments();
    }
  }, [show, businessId]);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await fetch(`/api/business/${businessId}/action-templates?locale=it`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchExistingAppointments = async () => {
    try {
      const response = await fetch(`/api/businesses/${businessId}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setExistingAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleTemplateSelect = (template: any) => {
    if (template.is_available_for_current_plan) {
      setSelectedTemplate(template);
      // Reset form state when selecting a new template
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSuggestedDatetimes([]);
      // On mobile, move to form step
      setMobileStep('form');
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Clear time slot when date changes
    
    // If we have a selected template and it's a fixed date mode, set the fixed appointment date
    if (selectedTemplate?.action_type === 'appointment_scheduling') {
      if (appointmentMode === 'fixed_confirmed' || appointmentMode === 'fixed_pending_confirmation') {
        setFixedAppointmentDate(date);
      }
    }
  };

  const handleTimeSlotSelect = (time: Date) => {
    setSelectedTimeSlot(time);
    
    // For fixed date modes, automatically set the appointment date when time is selected
    if (selectedTemplate?.action_type === 'appointment_scheduling' && 
        (appointmentMode === 'fixed_confirmed' || appointmentMode === 'fixed_pending_confirmation') &&
        selectedDate) {
      // Combine the selected date with the selected time
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setFixedAppointmentDate(combinedDateTime);
      setSelectedTimeSlot(null); // Clear selection after setting
      setSelectedDate(null); // Clear selected date
    }
  };

  const handleAddDateTime = () => {
    if (selectedTimeSlot) {
      const newDateTime = selectedTimeSlot.toISOString();
      if (!suggestedDatetimes.includes(newDateTime)) {
        setSuggestedDatetimes(prev => [...prev, newDateTime]);
      }
      setSelectedTimeSlot(null); // Clear selection after adding
    }
  };

  const handleRemoveDateTime = (datetimeToRemove: string) => {
    setSuggestedDatetimes(prev => prev.filter(dt => dt !== datetimeToRemove));
  };

  const handleAppointmentModeChange = (mode: string) => {
    setAppointmentMode(mode);
    // Clear fixed appointment date when switching modes
    if (mode === 'multiple_choice') {
      setFixedAppointmentDate(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  };

  const handleClearFixedDate = () => {
    setFixedAppointmentDate(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };



  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = setMinutes(setHours(date, hour), minute);
        const endTime = addHours(slotTime, 1);
        
        // Check if this time slot conflicts with existing appointments
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointment_datetime);
          const appointmentEnd = addHours(appointmentStart, appointment.duration_minutes || 60);
          return slotTime < appointmentEnd && endTime > appointmentStart;
        });
        
        // Check if this time slot is already in suggested datetimes
        const isAlreadySuggested = suggestedDatetimes.some(dt => 
          new Date(dt).toISOString() === slotTime.toISOString()
        );
        
        slots.push({
          time: slotTime,
          isOccupied,
          isAlreadySuggested
        });
      }
    }
    
    return slots;
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Create proper action_details based on template
      let actionDetails: any = {};

      // Use template's default_action_details as base
      if (selectedTemplate?.default_action_details) {
        actionDetails = { ...selectedTemplate.default_action_details };
      }

      // Override with form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== '') {
          actionDetails[key] = formData[key];
        }
      });

      // Add suggested datetimes if this is an appointment scheduling action
      if (selectedTemplate?.action_type === 'appointment_scheduling' && suggestedDatetimes.length > 0) {
        actionDetails.datetimes_options = suggestedDatetimes;
      }

      // Set default appointment mode if not provided
      if (selectedTemplate?.action_type === 'appointment_scheduling' && !actionDetails.appointment_mode) {
        actionDetails.appointment_mode = 'multiple_choice'; // Default to multiple choice
      }

      // Ensure appointment_mode is always set for appointment scheduling
      if (selectedTemplate?.action_type === 'appointment_scheduling') {
        actionDetails.appointment_mode = actionDetails.appointment_mode || 'multiple_choice';
      }

      // Add fixed appointment date if this is a fixed date mode
      if (selectedTemplate?.action_type === 'appointment_scheduling' && 
          (actionDetails.appointment_mode === 'fixed_confirmed' || actionDetails.appointment_mode === 'fixed_pending_confirmation') &&
          fixedAppointmentDate) {
        actionDetails.datetime_confirmed = fixedAppointmentDate.toISOString();
      }

      // Ensure address is set for appointment scheduling (required field)
      if (selectedTemplate?.action_type === 'appointment_scheduling') {
        actionDetails.address = actionDetails.address || null;
      }

      // Create the action
      const response = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_type: selectedTemplate.action_type,
          action_details: actionDetails,
          action_title: formData.action_title || selectedTemplate.translated_title,
          action_description: formData.action_description || selectedTemplate.translated_description
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Immediately add the new action to the timeline
        onActionCreated(result);
        // Close the add action modal first
        onClose();
        // Delay to let user see the action being added to timeline with animation
        await new Promise(resolve => setTimeout(resolve, 1000));
        onShowSubmissionModal({
          isSuccess: true,
          message: 'Action created successfully! The action has been added to the board.'
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        // Close the add action modal first
        onClose();
        // Delay to let user see any error state before showing submission modal
        await new Promise(resolve => setTimeout(resolve, 1000));
        onShowSubmissionModal({
          isSuccess: false,
          message: errorData.error || 'Failed to create action. Please try again.',
          technicalDetails: `Status: ${response.status}\nStatus Text: ${response.statusText}\nError: ${errorData.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error creating action:', error);
      // Close the add action modal first
      onClose();
      // Delay to let user see any error state before showing submission modal
      await new Promise(resolve => setTimeout(resolve, 1000));
      onShowSubmissionModal({
        isSuccess: false,
        message: 'An unexpected error occurred while creating the action.',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={handleModalClick}>
      <div className={`w-full h-full max-h-[95vh] lg:max-h-[85vh] bg-white text-gray-900 rounded-lg shadow-2xl flex flex-col ${
        selectedTemplate?.action_type === 'appointment_scheduling' 
          ? 'max-w-7xl' 
          : 'max-w-4xl'
      }`}>
        {/* Mobile Header with Navigation */}
        <div className="lg:hidden border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileStep('templates')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mobileStep === 'templates'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tipo
              </button>
              {selectedTemplate && (
                <button
                  onClick={() => setMobileStep('form')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mobileStep === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dettagli
                </button>
              )}
              {selectedTemplate?.action_type === 'appointment_scheduling' && (
                <button
                  onClick={() => setMobileStep('calendar')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mobileStep === 'calendar'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Calendario
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar - Action Type Selection */}
          <div className={`w-full lg:w-72 xl:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto lg:rounded-l-lg ${
            mobileStep === 'templates' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="p-4">
              {loadingTemplates ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <LoadingSpinner size="lg" color="gray" className="mb-4" />
                    <p className="text-gray-600">Caricamento...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {templates.map((template) => (
                    <button
                      key={template.template_id}
                      onClick={() => handleTemplateSelect(template)}
                      disabled={!template.is_available_for_current_plan}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
                        selectedTemplate?.template_id === template.template_id
                          ? 'border-gray-500 bg-gray-200 shadow-md'
                          : template.is_available_for_current_plan
                          ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm ${
                          ACTION_TYPE_COLORS[template.action_type] || 'bg-blue-50'
                        }`}>
                          <Image
                            src={ACTION_TYPE_ICONS[template.action_type] || '/icons/sanity/info-outline.svg'}
                            alt={template.translated_title}
                            width={24}
                            height={24}
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm lg:text-base truncate">{template.translated_title}</h4>
                          <p className="text-xs text-gray-400 mt-0 line-clamp-2">{template.translated_description}</p>
                        </div>
                      </div>
                      {!template.is_available_for_current_plan && (
                        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Pro
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center - Form Fields */}
          <div className={`flex-1 overflow-y-auto ${
            mobileStep === 'form' ? 'block' : 'hidden lg:block'
          }`}>
            {selectedTemplate ? (
              <div className="p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-lg ${
                    ACTION_TYPE_COLORS[selectedTemplate.action_type] || 'bg-blue-50'
                  }`}>
                    <Image
                      src={ACTION_TYPE_ICONS[selectedTemplate.action_type] || '/icons/sanity/info-outline.svg'}
                      alt={selectedTemplate.translated_title}
                      width={24}
                      height={24}
                      className="w-5 h-5 lg:w-6 lg:h-6"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">{selectedTemplate.translated_title}</h3>
                  </div>
                </div>
                <ActionForm
                  template={selectedTemplate}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  themeColorButton={themeColorButton}
                  businessId={businessId}
                  suggestedDatetimes={suggestedDatetimes}
                  onRemoveDateTime={handleRemoveDateTime}
                  onAppointmentModeChange={handleAppointmentModeChange}
                  fixedAppointmentDate={fixedAppointmentDate}
                  onClearFixedDate={handleClearFixedDate}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Seleziona un tipo di azione</h3>
                  <p className="text-gray-600 text-sm">Scegli un tipo di azione dalla lista per iniziare a creare la tua azione.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Calendar (only for appointment scheduling) */}
          {selectedTemplate?.action_type === 'appointment_scheduling' && (
            <div className={`w-full lg:w-80 xl:w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto lg:rounded-r-lg ${
              mobileStep === 'calendar' ? 'block' : 'hidden lg:block'
            }`}>
              <div className="p-4">
                
                {/* Calendar Instructions */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">
                    {appointmentMode === 'fixed_confirmed' || appointmentMode === 'fixed_pending_confirmation' 
                      ? 'Seleziona data e orario per l\'appuntamento fisso'
                      : ''
                    }
                  </h4>
                  <p className="text-xs lg:text-sm text-gray-600">
                    {appointmentMode === 'fixed_confirmed' || appointmentMode === 'fixed_pending_confirmation'
                      ? 'Clicca su una data, poi seleziona un orario. L\'appuntamento verrà impostato automaticamente.'
                      : 'Clicca su una data per vedere gli orari disponibili e aggiungerli ai suggerimenti'
                    }
                  </p>
                </div>
                
                {/* Calendar and Time Slots Layout */}
                <div className="space-y-4">
                  {/* Calendar */}
                  <div>
                    <Calendar
                      localizer={localizer}
                      events={existingAppointments.map(appointment => ({
                        title: appointment.appointment_title || 'Appuntamento',
                        start: new Date(appointment.appointment_datetime),
                        end: addHours(new Date(appointment.appointment_datetime), appointment.duration_minutes || 60)
                      }))}
                      startAccessor="start"
                      endAccessor="end"
                      style={{ height: 250, fontSize: '12px' }}
                      onSelectSlot={({ start }: { start: Date }) => handleDateSelect(start)}
                      selectable
                      views={['month']}
                      defaultView="month"
                      className="text-xs lg:text-sm"
                    />
                  </div>
                  
                  {/* Selected Date and Time Slots */}
                  {selectedDate && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">
                        Data selezionata: {format(selectedDate, 'dd/MM/yyyy')}
                      </h4>
                      <h5 className="text-xs lg:text-sm font-medium text-gray-700 mb-2">Orari disponibili:</h5>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {generateTimeSlots(selectedDate).map((slot, index) => {
                          const isSelected = selectedTimeSlot && 
                            selectedTimeSlot.toISOString() === slot.time.toISOString();
                          return (
                            <button
                              key={index}
                              disabled={slot.isOccupied || slot.isAlreadySuggested}
                              onClick={() => !slot.isOccupied && !slot.isAlreadySuggested && handleTimeSlotSelect(slot.time)}
                              className={`text-xs p-2 rounded border transition-colors ${
                                slot.isOccupied
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  : slot.isAlreadySuggested
                                  ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              {format(slot.time, 'HH:mm')}
                              {slot.isOccupied && ' (O)'}
                              {slot.isAlreadySuggested && ' ✓'}
                              {isSelected && ' ✓'}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Add selected time slot button - Only for multiple choice mode */}
                      {selectedTimeSlot && appointmentMode === 'multiple_choice' && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleAddDateTime}
                            className="w-full py-2 px-3 bg-green-600 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aggiungi {format(selectedTimeSlot, 'dd/MM/yyyy HH:mm')} ai suggerimenti
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

interface ActionFormProps {
  template: any;
  onSubmit: (formData: any) => void;
  isSubmitting: boolean;
  themeColorButton: string;
  businessId: string;
  suggestedDatetimes: string[];
  onRemoveDateTime: (datetime: string) => void;
  onAppointmentModeChange?: (mode: string) => void;
  fixedAppointmentDate?: Date | null;
  onClearFixedDate?: () => void;
}

function ActionForm({ template, onSubmit, isSubmitting, themeColorButton, businessId, suggestedDatetimes, onRemoveDateTime, onAppointmentModeChange, fixedAppointmentDate, onClearFixedDate }: ActionFormProps) {
  const [formData, setFormData] = useState<any>({
    // Set default appointment mode for appointment scheduling
    ...(template?.action_type === 'appointment_scheduling' && { appointment_mode: 'multiple_choice' })
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev: any) => ({ ...prev, action_title: title }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data being submitted:', formData);
    onSubmit(formData);
  };

  const getButtonTextColor = (bgColor: string) => {
    // Simple logic to determine text color based on background
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const renderFormFields = () => {
    // Special handling for appointment scheduling
    if (template.action_type === 'appointment_scheduling') {
      return (
        <div className="space-y-4">
          {/* Suggested Datetimes - Only for multiple choice mode */}
          {formData.appointment_mode === 'multiple_choice' && (
            <div>
              <label htmlFor="datetimes_options" className="block text-sm font-medium text-gray-700 mb-2">
                Orari Suggeriti
              </label>
              <div className="space-y-2">
                {suggestedDatetimes.length > 0 ? (
                  suggestedDatetimes.map((datetime: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {/* Calendar Icon */}
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(datetime).toLocaleDateString('it-IT', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Clock Icon */}
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {new Date(datetime).toLocaleTimeString('it-IT', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveDateTime(datetime)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm">Nessun orario suggerito ancora.</p>
                    <p className="text-xs text-gray-400 mt-1">Seleziona date e orari dal calendario per aggiungerli.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Generic form fields based on template
    if (template.fields && Array.isArray(template.fields)) {
      return template.fields.map((field: any) => {
        switch (field.type) {
          case 'text':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required ? '*' : ''}
                </label>
                <input
                  type="text"
                  id={field.name}
                  value={formData[field.name] || field.default_value || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  required={field.required}
                  placeholder={field.placeholder}
                />
              </div>
            );
          case 'textarea':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required ? '*' : ''}
                </label>
                <textarea
                  id={field.name}
                  value={formData[field.name] || field.default_value || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  rows={field.rows || 3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  required={field.required}
                  placeholder={field.placeholder}
                />
              </div>
            );
          case 'select':
            return (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required ? '*' : ''}
                </label>
                <select
                  id={field.name}
                  value={formData[field.name] || field.default_value || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
                  required={field.required}
                >
                  <option value="">Seleziona...</option>
                  {field.options?.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          default:
            return null;
        }
      });
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {/* Action Title */}
      <div>
        <label htmlFor="action_title" className="block text-sm font-medium text-gray-700 mb-2">
          Titolo dell'azione *
        </label>
        <input
          type="text"
          id="action_title"
          value={formData.action_title || template.translated_title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
          required
        />
      </div>

      {/* Action Description */}
      <div>
        <label htmlFor="action_description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione
        </label>
        <textarea
          id="action_description"
          value={formData.action_description || template.translated_description}
          onChange={(e) => handleInputChange('action_description', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
        />
      </div>

      {/* Appointment Title - Only for appointment scheduling */}
      {template.action_type === 'appointment_scheduling' && (
        <div>
          <label htmlFor="appointment_title" className="block text-sm font-medium text-gray-700 mb-2">
            Titolo Appuntamento *
          </label>
          <input
            type="text"
            id="appointment_title"
            value={formData.appointment_title || ''}
            onChange={(e) => handleInputChange('appointment_title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            required
            placeholder="Es. Consulenza Nutrizionale, Controllo Peso..."
          />
        </div>
      )}

      {/* Appointment Mode Selection - Only for appointment scheduling */}
      {template.action_type === 'appointment_scheduling' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Modalità Appuntamento *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: 'fixed_confirmed',
                title: 'Fixed date already confirmed',
                description: 'The appointment date and time are already set and confirmed',
                icon: '✓'
              },
              {
                key: 'fixed_pending_confirmation',
                title: 'Fixed date with request of confirmation',
                description: 'The appointment date and time are set but need customer confirmation',
                icon: '⏳'
              },
              {
                key: 'multiple_choice',
                title: 'List of dates to choice and confirm',
                description: 'Customer can choose from multiple suggested dates and times',
                icon: '📅'
              }
            ].map((mode) => (
              <div
                key={mode.key}
                className={`p-3 lg:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  formData.appointment_mode === mode.key
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  handleInputChange('appointment_mode', mode.key);
                  onAppointmentModeChange?.(mode.key);
                }}
              >
                <div className="flex flex-col lg:flex-col items-center">
                  <div className="flex items-center justify-between w-full lg:flex-col lg:items-center">
                    <div className="flex-1 lg:flex-none lg:text-center lg:order-2 lg:w-full">
                      <h4 className="font-medium text-gray-900 text-xs lg:text-sm mb-1 lg:mb-1">{mode.title}</h4>
                      <p className="text-xs text-gray-600 leading-tight lg:text-center">{mode.description}</p>
                    </div>
                    <div className={`w-8 h-8 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-sm lg:text-base font-medium ml-3 lg:ml-0 lg:mb-2 lg:order-1 ${
                      formData.appointment_mode === mode.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {mode.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Appointment Date Display - Only for fixed date modes */}
      {template.action_type === 'appointment_scheduling' && 
       (formData.appointment_mode === 'fixed_confirmed' || formData.appointment_mode === 'fixed_pending_confirmation') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appuntamento Impostato
          </label>
          {fixedAppointmentDate ? (
            <div className="p-4 rounded-lg border border-gray-300 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {/* Calendar Icon */}
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-lg font-medium text-gray-900">
                      {fixedAppointmentDate.toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Clock Icon */}
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      {fixedAppointmentDate.toLocaleTimeString('it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearFixedDate?.();
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Cambia
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-sm">Nessun appuntamento impostato ancora.</p>
              <p className="text-xs text-gray-400 mt-1">Seleziona data e orario dal calendario per impostare l'appuntamento.</p>
            </div>
          )}
        </div>
      )}

      {/* Template-specific fields */}
      {renderFormFields()}



      {/* Submit Button */}
      <div className="flex justify-end pt-4 lg:pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 lg:px-8 py-2 lg:py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 shadow-sm hover:shadow-md text-sm lg:text-base"
          style={{
            backgroundColor: themeColorButton,
            color: getButtonTextColor(themeColorButton)
          }}
        >
          {isSubmitting ? 'Creazione...' : 'Crea Azione'}
        </button>
      </div>
    </form>
  );
}  