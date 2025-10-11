"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { addHours, setHours, setMinutes } from 'date-fns';

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DynamicFormGenerator } from '@/lib/form-generators';
import { getActionTemplatesForModal } from '@/lib/unified-action-system';
import { transformActionDetailsForRendering } from '@/lib/action-data-transformer';
import { ACTION_TYPE_ICONS, ACTION_TYPE_COLORS, ACTION_TYPE_ICON_COMPONENTS } from '@/lib/unified-action-system';
import BoardIconAction from '@/components/board/BoardIconAction';
import { getActionColorScheme } from '@/lib/action-color-schemes';

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
  const [mobileStep, setMobileStep] = useState<'templates' | 'form'>('templates');
  
  // Calendar visibility state
  const [showCalendar, setShowCalendar] = useState(false);

  // Load action templates from config files on component mount
  useEffect(() => {
    if (show && businessId) {
      loadTemplates();
      fetchExistingAppointments();
    }
  }, [show, businessId]);

  // Check for pre-selected action type when modal opens
  useEffect(() => {
    if (show && templates.length > 0) {
      const preSelectedActionType = sessionStorage.getItem('preSelectedActionType');
      if (preSelectedActionType) {
        const template = templates.find(t => t.action_type === preSelectedActionType);
        if (template) {
          handleTemplateSelect(template);
        }
        // Clear the stored action type
        sessionStorage.removeItem('preSelectedActionType');
      }
    }
  }, [show, templates]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const businessPlan = 1; // TODO: Fetch from business settings
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
    setSelectedTemplate(template);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSuggestedDatetimes([]);
    setMobileStep('form');
  };

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    
    // If we're in confirmed status or fixed_date mode, update fixedAppointmentDate when time is also selected
  };

  const handleTimeSlotSelect = (time: Date) => {
    setSelectedTimeSlot(time);
    
    if (selectedTemplate?.action_type === 'appointment_scheduling' && selectedDate) {
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      setFixedAppointmentDate(combinedDateTime);
      // In confirmed status or fixed_date, we treat the picked datetime as the only accepted one
      setSuggestedDatetimes(prev => prev);
    }
  };

  const handleAddDateTime = () => {
    if (selectedTimeSlot) {
      const newDateTime = selectedTimeSlot.toISOString();
      if (!suggestedDatetimes.includes(newDateTime)) {
        setSuggestedDatetimes(prev => [...prev, newDateTime]);
      }
      setSelectedTimeSlot(null);
    }
  };

  const handleRemoveDateTime = (datetimeToRemove: string) => {
    setSuggestedDatetimes(prev => prev.filter(dt => dt !== datetimeToRemove));
  };

  const handleAppointmentModeChange = (mode: string) => {
    setAppointmentMode(mode);
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

  const handleShowCalendar = () => {
    setShowCalendar(true);
  };

  const handleHideCalendar = () => {
    setShowCalendar(false);
  };

  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = setMinutes(setHours(date, hour), minute);
        const endTime = addHours(slotTime, 1);
        
        const isOccupied = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointment_datetime);
          const appointmentEnd = addHours(appointmentStart, appointment.duration_minutes || 60);
          return slotTime < appointmentEnd && endTime > appointmentStart;
        });
        
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
      const actionDetails = transformActionDetailsForRendering(formData, selectedTemplate.action_type);

      if (selectedTemplate?.action_type === 'appointment_scheduling' && suggestedDatetimes.length > 0) {
        actionDetails.datetimes_options = suggestedDatetimes;
      }

      if (selectedTemplate?.action_type === 'appointment_scheduling' && !actionDetails.appointment_mode) {
        actionDetails.appointment_mode = 'multiple_choice';
      }

      if (selectedTemplate?.action_type === 'appointment_scheduling') {
        actionDetails.appointment_mode = actionDetails.appointment_mode || 'multiple_choice';
        // If appointment_status is confirmed or mode is fixed_date, prioritize confirmed datetime
        if (formData.appointment_status === 'confirmed' || actionDetails.appointment_mode === 'fixed_date') {
          if (fixedAppointmentDate) {
            actionDetails.datetime_confirmed = fixedAppointmentDate.toISOString();
            actionDetails.datetimes_options = [];
          }
        }
      }

      // Only set confirmed datetime when status is confirmed or mode is fixed_date
      if (
        selectedTemplate?.action_type === 'appointment_scheduling' &&
        fixedAppointmentDate &&
        (formData.appointment_status === 'confirmed' || actionDetails.appointment_mode === 'fixed_date')
      ) {
        actionDetails.datetime_confirmed = fixedAppointmentDate.toISOString();
      }

      if (selectedTemplate?.action_type === 'appointment_scheduling') {
        actionDetails.address = actionDetails.address || null;
      }

      if (selectedTemplate?.action_type === 'appointment_scheduling' && formData.appointment_status === 'confirmed') {
        if (!fixedAppointmentDate) {
          throw new Error('Per appuntamenti confermati è necessario selezionare una data e ora');
        }

        const actionResponse = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action_type: selectedTemplate.action_type,
            action_details: {
              ...actionDetails,
              confirmation_status: 'confirmed',
              datetime_confirmed: fixedAppointmentDate.toISOString(),
              platform_confirmed: formData.platform_confirmed || null,
              appointment_mode: 'fixed_confirmed'
            },
            action_title: formData.action_title || selectedTemplate.translated_title,
            action_description: formData.action_description || selectedTemplate.translated_description
          }),
        });

        if (!actionResponse.ok) {
          const errorData = await actionResponse.json().catch(() => ({ error: 'Unknown error occurred' }));
          throw new Error(errorData.error || 'Failed to create action');
        }

        const actionResult = await actionResponse.json();

        const appointmentResponse = await fetch(`/api/businesses/${businessId}/appointments/create-confirmed`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action_id: actionResult.action_id,
            appointment_datetime: fixedAppointmentDate.toISOString(),
            appointment_title: formData.appointment_title,
            appointment_type: formData.appointment_type,
            appointment_location: formData.appointment_type === 'online' ? 'Online' : (formData.address || 'TBD'),
            platform_name: formData.platform_confirmed ? formData.platform_confirmed : null,
            platform_link: formData.platform_link || null,
            business_id: businessId,
            service_board_id: boardRef
          }),
        });

        if (!appointmentResponse.ok) {
          const errorData = await appointmentResponse.json().catch(() => ({ error: 'Unknown error occurred' }));
          throw new Error(errorData.error || 'Failed to create appointment');
        }

        const appointmentResult = await appointmentResponse.json();

        const updateResponse = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions/${actionResult.action_id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action_details: {
              ...actionResult.action_details,
              appointment_id: appointmentResult.appointment.id
            }
          }),
        });

        if (!updateResponse.ok) {
          console.warn('Failed to update action with appointment ID');
        }

        onActionCreated(actionResult);
        onClose();
        await new Promise(resolve => setTimeout(resolve, 1000));
        onShowSubmissionModal({
          isSuccess: true,
          message: 'Appuntamento creato. Azione aggiunta.'
        });
        return;
      }

      // Special flow: document_upload requires an action_id to attach the file
      if (selectedTemplate?.action_type === 'document_download') {
        // Create placeholder action first
        const initialDetails = {
          document_name: formData.document_title || 'Documento',
        }
        const createResp = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_type: selectedTemplate.action_type,
            action_details: initialDetails,
            action_title: formData.action_title || selectedTemplate.translated_title,
            action_description: formData.action_description || selectedTemplate.translated_description
          }),
        })
        if (!createResp.ok) {
          const err = await createResp.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to create action for document upload')
        }
        const created = await createResp.json()

        // Upload the file to R2 and update action details
        const files: File[] = Array.isArray(formData.document_file) ? formData.document_file : []
        if (!files.length) throw new Error('Nessun file selezionato')
        const fd = new FormData()
        fd.append('file', files[0])
        fd.append('board_ref', boardRef)
        if (formData.download_password) fd.append('download_password', formData.download_password)

        const uploadResp = await fetch(`/api/service-board/actions/${created.action_id}/document-upload`, {
          method: 'POST',
          body: fd,
        })
        const uploadText = await uploadResp.text()
        let uploadData: any = {}
        try { uploadData = JSON.parse(uploadText) } catch {}
        if (!uploadResp.ok || !uploadData?.action_details?.download_url) {
          const technical = `Status: ${uploadResp.status}\nResponse: ${uploadText || 'N/A'}`
          onClose()
          await new Promise(r => setTimeout(r, 300))
          onShowSubmissionModal({ isSuccess: false, message: 'Upload del documento non riuscito', technicalDetails: technical })
          return
        }

        // Emit final action (merge updated details)
        const finalAction = { ...created, action_details: uploadData.action_details }
        onActionCreated(finalAction)
        onClose()
        await new Promise(resolve => setTimeout(resolve, 500))
        onShowSubmissionModal({ isSuccess: true, message: 'Documento caricato. Azione aggiunta.' })
        return
      }

      // Special flow: signature_request with file upload (action already created by form)
      if (selectedTemplate?.action_type === 'signature_request' && formData.action_id) {
        // The form has already created the action and uploaded the file
        // We need to fetch the complete action from the database to get all fields
        try {
          const actionResponse = await fetch(`/api/businesses/${businessId}/service-boards/${boardRef}/actions/${formData.action_id}`);
          if (actionResponse.ok) {
            const completeAction = await actionResponse.json();
            onActionCreated(completeAction);
          } else {
            // Fallback: create a minimal action object with required fields
            const finalAction = {
              action_id: formData.action_id,
              action_type: 'signature_request',
              action_title: formData.action_title || selectedTemplate.translated_title,
              action_description: formData.action_description || selectedTemplate.translated_description,
              action_details: formData.action_details,
              action_status: 'pending', // Default status for signature requests
              is_customer_action_required: true
            };
            onActionCreated(finalAction);
          }
        } catch (error) {
          console.error('Error fetching complete action:', error);
          // Fallback: create a minimal action object with required fields
          const finalAction = {
            action_id: formData.action_id,
            action_type: 'signature_request',
            action_title: formData.action_title || selectedTemplate.translated_title,
            action_description: formData.action_description || selectedTemplate.translated_description,
            action_details: formData.action_details,
            action_status: 'pending', // Default status for signature requests
            is_customer_action_required: true
          };
          onActionCreated(finalAction);
        }
        
        onClose();
        await new Promise(resolve => setTimeout(resolve, 500));
        onShowSubmissionModal({ isSuccess: true, message: 'Documento caricato. Azione aggiunta.' });
        return;
      }

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
        onActionCreated(result);
        onClose();
        await new Promise(resolve => setTimeout(resolve, 1000));
        onShowSubmissionModal({
          isSuccess: true,
          message: 'The action has been added to the board.'
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        onClose();
        await new Promise(resolve => setTimeout(resolve, 1000));
        onShowSubmissionModal({
          isSuccess: false,
          message: errorData.error || 'Failed to create action. Please try again.',
          technicalDetails: `Status: ${response.status}\nStatus Text: ${response.statusText}\nError: ${errorData.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error creating action:', error);
      onClose();
      await new Promise(resolve => setTimeout(resolve, 1000));
      onShowSubmissionModal({
        isSuccess: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred while creating the action.',
        technicalDetails: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end" onClick={handleModalClick}>
      {/* Gradient overlay with backdrop blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/70 to-black/70 backdrop-blur-md backdrop-saturate-150" />
      {/* Modal content */}
      <div className={`h-full flex flex-col lg:max-w-[1400px] w-full transition-all duration-300 relative z-10 p-2 lg:p-0 ${
        selectedTemplate?.action_type === 'appointment_scheduling' && showCalendar 
          ? 'lg:max-w-[1600px]' 
          : ''
      }`}>
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row-reverse overflow-hidden lg:p-6 lg:gap-8">
          {/* Left - Actions list (single column) */}
          <div className={`w-full lg:w-80 xl:w-96 overflow-y-auto h-full flex-col justify-center items-center ${
            mobileStep === 'templates' ? 'flex' : 'hidden lg:block'
          }`}>
            <div className="p-4 lg:p-4">
              {loadingTemplates ? (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <LoadingSpinner size="lg" color="white" className="mb-4" />
                    <p className="text-white">Caricamento...</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {templates.map((template, index) => (
                    <button
                      key={template.template_id}
                      onClick={() => handleTemplateSelect(template)}
                      disabled={!template.is_available_for_current_plan}
                      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                      className={`w-full py-1.5 px-2 rounded-md border border-transparent transition-all duration-200 text-left relative group animate-[slideDown_0.3s_ease-out_forwards] ${
                        template.is_available_for_current_plan ? '' : 'opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          {(() => {
                            const colors = getActionColorScheme(template.action_type);
                            return (
                              <BoardIconAction 
                                icon={ACTION_TYPE_ICON_COMPONENTS[template.action_type]}
                                color1={colors.color1}
                                color2={colors.color2}
                                color3={colors.color3}
                                size="xs"
                                isActive={selectedTemplate?.template_id === template.template_id}
                              />
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm lg:text-base truncate transition-colors ${
                            selectedTemplate?.template_id === template.template_id
                              ? 'text-white font-semibold'
                              : 'text-white/80 group-hover:text-white'
                          }`}>{template.translated_title}</h4>
                          {selectedTemplate?.template_id === template.template_id && (
                            <p className="text-[10px] leading-tight mt-0.5 text-white/60">
                              {template.translated_description}
                            </p>
                          )}
                        </div>
                      </div>
                      {template.is_premium && template.premium_label && (
                        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white">
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

          {/* Right - Form Fields */}
          <div className={`flex-1 overflow-y-auto rounded-3xl lg:rounded-3xl bg-white/95 backdrop-blur-sm lg:my-auto lg:max-h-[85vh] ${
            selectedTemplate ? 'block' : 'hidden lg:block'
          }`}>
            {selectedTemplate ? (
              <div className="p-5 lg:p-6 animate-[slideDown_0.3s_ease-out_0.1s_both]">
                <div className="flex items-center justify-between mb-6 animate-[slideDown_0.3s_ease-out_0.2s_both]">
                  <div className="flex items-center gap-2 lg:gap-3">
                    {/* Mobile - sm size */}
                    <div className="lg:hidden">
                      {(() => {
                        const colors = getActionColorScheme(selectedTemplate.action_type);
                        return (
                          <BoardIconAction 
                            icon={ACTION_TYPE_ICON_COMPONENTS[selectedTemplate.action_type]}
                            color1={colors.color1}
                            color2={colors.color2}
                            color3={colors.color3}
                            size="sm"
                            isActive={true}
                          />
                        );
                      })()}
                    </div>
                    {/* Desktop - sm size */}
                    <div className="hidden lg:block">
                      {(() => {
                        const colors = getActionColorScheme(selectedTemplate.action_type);
                        return (
                          <BoardIconAction 
                            icon={ACTION_TYPE_ICON_COMPONENTS[selectedTemplate.action_type]}
                            color1={colors.color1}
                            color2={colors.color2}
                            color3={colors.color3}
                            size="sm"
                            isActive={true}
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base lg:text-xl font-semibold text-gray-900 truncate">{selectedTemplate.translated_title}</h3>
                    </div>
                  </div>
                  
                  {/* Mobile navigation buttons */}
                  <div className="lg:hidden flex items-center gap-1 lg:gap-2">
                    <button
                      onClick={() => setMobileStep('templates')}
                      className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Desktop close button */}
                  <div className="hidden lg:flex items-center">
                    <button
                      onClick={onClose}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
                      aria-label="Close"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Dynamic Form Generator */}
                <div className="animate-[slideDown_0.3s_ease-out_0.3s_both]">
                  <DynamicFormGenerator
                    className="text-gray-900"
                    actionType={selectedTemplate.action_type}
                    businessId={businessId}
                    boardRef={boardRef}
                    currentPlan={1}
                    locale={locale}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    disabled={isSubmitting}
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
                    showCalendar={showCalendar}
                    onShowCalendar={handleShowCalendar}
                    onHideCalendar={handleHideCalendar}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 min-h-[300px]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm">Scegli un tipo di azione dalla lista per iniziare a creare la tua azione.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}