"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
// @ts-ignore
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, setHours, setMinutes } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DynamicFormGenerator } from '@/lib/dynamic-form-generator';
import { getActionTemplatesForModal } from '@/lib/unified-action-system';

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

import { ACTION_TYPE_ICONS, ACTION_TYPE_COLORS } from '@/lib/unified-action-system';

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
  locale: string;
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
  locale,
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

  // Load action templates from config files on component mount
  useEffect(() => {
    if (show && businessId) {
      loadTemplates();
      fetchExistingAppointments();
    }
  }, [show, businessId]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      
      // Get business plan (you'll need to implement this based on your business logic)
      // For now, we'll assume plan 1 (free plan)
      const businessPlan = 1; // TODO: Fetch from business settings
      
      // Get templates using the unified function with current locale
      const templates = getActionTemplatesForModal(businessPlan, locale);
      
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
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
    // Allow all templates to be selected for testing (including premium ones)
    setSelectedTemplate(template);
    // Reset form state when selecting a new template
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSuggestedDatetimes([]);
    // On mobile, move to form step
    setMobileStep('form');
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
      <div className={`w-full h-full max-h-[95vh] lg:max-h-[85vh] bg-white text-gray-900 rounded-2xl lg:rounded-3xl shadow-2xl flex flex-col ${
        selectedTemplate?.action_type === 'appointment_scheduling' 
          ? 'max-w-7xl' 
          : 'max-w-4xl'
      }`}>


        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar - Action Type Selection */}
          <div className={`w-full lg:w-72 xl:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto lg:rounded-l-2xl ${
            mobileStep === 'templates' ? 'block' : 'hidden lg:block'
          }`}>
            <div className="p-6 lg:p-4">
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
                          {/* Show description on lg+ - gray by default, blue when selected */}
                          <p className="hidden lg:block text-xs mt-0 line-clamp-2 ${
                            selectedTemplate?.template_id === template.template_id 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }">{template.translated_description}</p>
                        </div>
                      </div>
                      {template.is_premium && template.premium_label && (
                        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-white">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            {template.premium_label}
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
            selectedTemplate ? 'block' : 'hidden lg:block'
          }`}>
            {selectedTemplate ? (
              <div className="p-6 lg:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
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
                  
                  {/* Mobile navigation buttons */}
                  <div className="lg:hidden flex items-center gap-2">
                    <button
                      onClick={() => setMobileStep('templates')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Dynamic Form Generator */}
                <DynamicFormGenerator
                  actionType={selectedTemplate.action_type}
                  businessId={businessId}
                  currentPlan={1} // TODO: Get from business settings
                  locale={locale}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  disabled={isSubmitting}
                  className="space-y-4"
                  suggestedDatetimes={suggestedDatetimes}
                  onRemoveDateTime={handleRemoveDateTime}
                  onAppointmentModeChange={handleAppointmentModeChange}
                  fixedAppointmentDate={fixedAppointmentDate}
                  onClearFixedDate={handleClearFixedDate}
                  existingAppointments={existingAppointments}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onDateSelect={handleDateSelect}
                  onTimeSlotSelect={handleTimeSlotSelect}
                  onAddDateTime={handleAddDateTime}
                  generateTimeSlots={generateTimeSlots}
                  appointmentMode={appointmentMode}
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

          {/* Right Sidebar - Calendar (only for appointment scheduling on desktop) */}
          {selectedTemplate?.action_type === 'appointment_scheduling' && (
            <div className={`w-full lg:w-80 xl:w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto lg:rounded-r-2xl ${
              mobileStep === 'calendar' ? 'block' : 'hidden lg:block'
            }`}>
              <div className="p-6 lg:p-4">
                
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
                <div className="space-y-2">
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