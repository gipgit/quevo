import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useBaseForm, ActionTitleField, ActionDescriptionField, SubmitButton } from './base-form-generator';
import { registerActionConfig, createActionConfig, createFieldConfig } from './shared/config';

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

// Custom Toolbar Component that uses onNavigate - EXACTLY like the reference
function CustomToolbar(toolbar: any) {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToToday = () => {
    toolbar.onNavigate('TODAY');
  };

  return (
    <div className="rbc-toolbar">
      {/* Navigation Group: PREV Arrow, Month/Year Label, NEXT Arrow */}
      <span className="rbc-btn-group w-full flex items-center justify-between gap-x-3">
        <button 
          type="button" 
          onClick={goToBack} 
          className="rbc-btn p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          &#9664; {/* Unicode Left Arrow */}
        </button>

        {/* The Month/Year Label is now here, between the arrows */}
        <span className="rbc-toolbar-label text-lg font-semibold text-gray-900">{toolbar.label}</span>

        <button 
          type="button" 
          onClick={goToNext} 
          className="rbc-btn p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          &#9654; {/* Unicode Right Arrow */}
        </button>
      </span>
    </div>
  );
}

// Custom Date Cell Wrapper - like the reference but simplified for appointment scheduling
function CustomDateCellWrapper({ children, value, onDateCellClick, selectedDate, ...rest }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDateCellClick) {
      onDateCellClick({ start: value, end: value });
    }
  };

  const dayNumber = format(value, 'd');
  const today = new Date();
  const isPastDate = value < today;
  const isSelected = selectedDate && format(value, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

  return (
    <div
      onClick={handleClick}
      {...rest}
      style={{
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...rest.style,
      }}
    >
      {/* Render date number with styling for past dates and selected state */}
      <span className={`${isPastDate ? 'opacity-50' : ''} ${isSelected ? 'font-bold' : ''}`}>
        {dayNumber}
      </span>
      {/* Selected date indicator - positioned relative to the cell */}
      {isSelected && (
        <div 
          className="absolute inset-1 border-2 border-blue-500 rounded-md pointer-events-none"
          style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}

// Define the field configuration for appointment_scheduling
const appointmentSchedulingFields = [
  createFieldConfig('action_title', 'text', true, {
    label: 'Titolo dell\'azione',
    placeholder: 'Gentile Cliente, Le chiediamo di prenotare un appuntamento...'
  }),
  createFieldConfig('action_description', 'textarea', false, {
    label: 'Descrizione',
    placeholder: 'Spiega al cliente i dettagli dell\'appuntamento'
  }),
  // New: Appointment details after description
  createFieldConfig('appointment_title', 'text', true, {
    label: 'Titolo appuntamento',
    placeholder: 'Es. Prima consulenza'
  }),
  createFieldConfig('appointment_type', 'select_cards', true, {
    label: 'Tipo appuntamento',
    placeholder: 'Seleziona il tipo',
    ui: { gridClass: 'grid grid-cols-2 gap-2' },
    cardOptions: [
      {
        key: 'in_person',
        label: 'In presenza',
        color: 'bg-emerald-50 hover:bg-emerald-100'
      },
      {
        key: 'online',
        label: 'Online',
        color: 'bg-sky-50 hover:bg-sky-100'
      }
    ]
  }),
  createFieldConfig('address', 'text', false, {
    label: 'Indirizzo (se in presenza)',
    placeholder: 'Via e numero civico, città',
    conditional: {
      dependsOn: 'appointment_type',
      showWhen: (value) => value === 'in_person'
    }
  }),
  createFieldConfig('platforms', 'multi_select_pills', false, {
    label: 'Piattaforma (se online)',
    placeholder: 'Seleziona la piattaforma',
    conditional: {
      dependsOn: 'appointment_type',
      showWhen: (value) => value === 'online'
    },
    cardOptions: [
      { key: 'google_meet', label: 'Google Meet' },
      { key: 'microsoft_teams', label: 'Microsoft Teams' },
      { key: 'zoom', label: 'Zoom' },
      { key: 'skype', label: 'Skype' }
    ]
  }),
  createFieldConfig('appointment_status', 'select_cards', true, {
    label: 'Stato appuntamento',
    placeholder: 'Seleziona lo stato',
    ui: { gridClass: 'grid grid-cols-2 gap-2' },
    cardOptions: [
      { 
        key: 'to_schedule', 
        label: 'Da programmare',
        description: 'Il cliente deve ancora scegliere una data',
        color: 'bg-yellow-50 hover:bg-yellow-100'
      },
      { 
        key: 'confirmed', 
        label: 'Confermato',
        description: 'Appuntamento confermato per una data specifica',
        color: 'bg-green-50 hover:bg-green-100'
      }
    ]
  }),
  createFieldConfig('appointment_mode', 'select_cards', true, {
    label: 'Modalità appuntamento',
    placeholder: 'Seleziona la modalità',
    ui: { gridClass: 'grid grid-cols-2 gap-2' },
    conditional: {
      dependsOn: 'appointment_status',
      showWhen: (value) => value === 'to_schedule'
    },
    cardOptions: [
      { 
        key: 'multiple_choice', 
        label: 'Scelta multipla',
        description: 'Il cliente può proporre più date',
        color: 'bg-purple-50 hover:bg-purple-100'
      },
      { 
        key: 'fixed_date', 
        label: 'Data fissa',
        description: 'Data già stabilita, non modificabile',
        color: 'bg-teal-50 hover:bg-teal-100'
      }
    ]
  }),

];

// Register the action configuration
registerActionConfig(createActionConfig(
  'appointment_scheduling',
  'Prenotazione Appuntamento',
  'Permetti al cliente di prenotare un appuntamento',
  '/icons/sanity/calendar.svg',
  'bg-indigo-100',
  [1, 2, 3],
  appointmentSchedulingFields
));

export interface AppointmentFormProps {
  actionType: string;
  businessId: string;
  currentPlan?: number;
  locale?: string;
  onSubmit: (formData: any) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  // Appointment scheduling props
  suggestedDatetimes?: string[];
  onRemoveDateTime?: (datetime: string) => void;
  onAppointmentModeChange?: (mode: string) => void;
  fixedAppointmentDate?: Date | null;
  onClearFixedDate?: () => void;
  // Calendar props
  existingAppointments?: any[];
  selectedDate?: Date | null;
  selectedTimeSlot?: Date | null;
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (time: Date) => void;
  onAddDateTime?: () => void;
  generateTimeSlots?: (date: Date) => any[];
  appointmentMode?: string;
  // Calendar visibility props
  showCalendar?: boolean;
  onShowCalendar?: () => void;
  onHideCalendar?: () => void;
}

export function AppointmentSchedulingForm({
  actionType,
  businessId,
  currentPlan = 1,
  locale = 'it',
  onSubmit,
  isSubmitting = false,
  disabled = false,
  className = '',
  suggestedDatetimes = [],
  onRemoveDateTime,
  onAppointmentModeChange,
  fixedAppointmentDate,
  onClearFixedDate,
  existingAppointments = [],
  selectedDate,
  selectedTimeSlot,
  onDateSelect,
  onTimeSlotSelect,
  onAddDateTime,
  generateTimeSlots,
  appointmentMode,
  showCalendar = false,
  onShowCalendar,
  onHideCalendar
}: AppointmentFormProps) {
  const {
    formData,
    errors,
    handleFieldChange,
    validateForm,
    shouldShowField,
    renderField,
    actionConfig,
    formPlaceholders
  } = useBaseForm(actionType, locale, {
    appointment_status: 'to_schedule',
    appointment_mode: 'multiple_choice'
  });

  // Calendar state management - EXACTLY like the reference
  const [calendarDate, setCalendarDate] = React.useState(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // EXACTLY like the reference - handleCalendarNavigate callback
  const handleCalendarNavigate = React.useCallback((newDate: Date) => {
    setCalendarDate(newDate);
  }, []);

  // Reset suggested dates when switching from multiple_choice to fixed_date
  React.useEffect(() => {
    if (formData.appointment_mode === 'fixed_date' && suggestedDatetimes.length > 0) {
      // Clear all suggested dates when switching to fixed_date mode
      suggestedDatetimes.forEach((datetime) => {
        onRemoveDateTime?.(datetime);
      });
    }
  }, [formData.appointment_mode, suggestedDatetimes, onRemoveDateTime]);



  if (!actionConfig) {
    return <div>Action type not found: {actionType}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="lg:flex lg:gap-8">
        {/* Left column - Form fields */}
        <div className="flex-1 space-y-4">
          {/* Action Title - Always present */}
          <ActionTitleField
            value={formData.action_title || ''}
            onChange={(value) => handleFieldChange('action_title', value)}
            error={errors.action_title}
            placeholder={formPlaceholders.action_title}
            disabled={disabled}
          />

          {/* Action Description - Always present */}
          <ActionDescriptionField
            value={formData.action_description || ''}
            onChange={(value) => handleFieldChange('action_description', value)}
            error={errors.action_description}
            placeholder={formPlaceholders.action_description}
            disabled={disabled}
          />

          {/* Render dynamic fields from action config (excluding appointment_type/address/platforms here) */}
          {actionConfig.fields
            .filter((field: { name: string }) => !['action_title', 'action_description', 'appointment_type', 'address', 'platforms'].includes(field.name))
            .filter(shouldShowField)
            .map((field: { name: string }) => renderField(field))}

          {/* Date Selection Area */}
          <div className="mt-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {!formData.appointment_status ? 'Seleziona uno stato appuntamento per iniziare' :
               (formData.appointment_status === 'confirmed' || formData.appointment_mode === 'fixed_date') ? 'Data Confermata' :
               'Date Suggerite'}
            </h3>
            
            {/* Placeholder when no status selected */}
            {!formData.appointment_status && (
              <div className="text-gray-600 text-sm italic py-4">Seleziona una data dal calendario</div>
            )}
            
            {/* For confirmed appointments or fixed_date mode - show only one confirmed date card */}
            {(formData.appointment_status === 'confirmed' || formData.appointment_mode === 'fixed_date') && fixedAppointmentDate && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">
                      {fixedAppointmentDate.toLocaleDateString('it-IT', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-gray-700">
                      {fixedAppointmentDate.toLocaleTimeString('it-IT', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClearFixedDate}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Rimuovi
                </button>
              </div>
            )}

            {/* When status is confirmed but no fixed date selected yet, show guidance */}
            {formData.appointment_status === 'confirmed' && !fixedAppointmentDate && (
              <div className="text-sm text-gray-600 italic py-2">Seleziona una data dal calendario</div>
            )}

            {/* When status is to_schedule with fixed_date but no date selected yet, show guidance */}
            {formData.appointment_status === 'to_schedule' && formData.appointment_mode === 'fixed_date' && !fixedAppointmentDate && (
              <div className="text-sm text-gray-600 italic py-2">Seleziona una data dal calendario</div>
            )}

            {/* For multiple_choice mode - show suggested dates list */}

                         {/* For to_schedule appointments - show suggested dates */}
            {formData.appointment_status === 'to_schedule' && formData.appointment_mode === 'multiple_choice' && (
               <div>
                 {suggestedDatetimes.length > 0 ? (
                   <div className="space-y-2">
                     {suggestedDatetimes.map((datetime, index) => (
                       <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                         <div className="flex items-center gap-3">
                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                           </svg>
                           <div className="text-sm text-gray-700">
                             {(() => {
                               const d = new Date(datetime);
                               try {
                                 return d.toLocaleString('it-IT', {
                                   weekday: 'long',
                                   year: 'numeric',
                                   month: 'long',
                                   day: 'numeric',
                                   hour: '2-digit',
                                   minute: '2-digit'
                                 });
                               } catch {
                                 return d.toString();
                               }
                             })()}
                           </div>
                         </div>
                         <button
                           type="button"
                           onClick={() => onRemoveDateTime?.(datetime)}
                           className="text-red-600 hover:text-red-800 text-sm"
                         >
                           Rimuovi
                         </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-sm text-gray-600 italic">
                     Seleziona una data dal calendario
                   </div>
                 )}
               </div>
             )}

            
          </div>

          {/* Appointment type and related fields AFTER date sections */}
          {(() => {
            const appointmentTypeField: any = actionConfig.fields.find((f: any) => f.name === 'appointment_type');
            const addressField: any = actionConfig.fields.find((f: any) => f.name === 'address');
            const platformsField: any = actionConfig.fields.find((f: any) => f.name === 'platforms');

            const showAppointmentType = appointmentTypeField && shouldShowField(appointmentTypeField);
            const showAddress = addressField && shouldShowField(addressField);
            // Show multi-select platforms only when pending + online
            const showPlatformsMulti = platformsField 
              && shouldShowField(platformsField) 
              && formData.appointment_status === 'to_schedule' 
              && formData.appointment_type === 'online';
            // Show single-select platform only when confirmed + online
            const showPlatformConfirmed = formData.appointment_status === 'confirmed' && formData.appointment_type === 'online';

            return (
              <div className="space-y-4">
                {showAppointmentType && renderField(appointmentTypeField)}
                {showAddress && renderField(addressField)}
                {showPlatformsMulti && renderField(platformsField)}

                {showPlatformConfirmed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Piattaforma confermata</label>
                    <div className="flex flex-wrap gap-2">
                      {(platformsField?.cardOptions || [
                        { key: 'google_meet', label: 'Google Meet' },
                        { key: 'microsoft_teams', label: 'Microsoft Teams' },
                        { key: 'zoom', label: 'Zoom' },
                        { key: 'skype', label: 'Skype' }
                      ]).map((opt: any) => {
                        const selected = formData.platform_confirmed === opt.key;
                        return (
                          <button
                            type="button"
                            key={opt.key}
                            onClick={() => handleFieldChange('platform_confirmed', opt.key)}
                            className={`px-3 py-1.5 text-sm rounded-full border ${selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Submit button for appointment scheduling */}
          <SubmitButton isSubmitting={isSubmitting} disabled={disabled} />
        </div>

        {/* Calendar Integration for Appointment Scheduling (right column) */}
        <div className="w-80 p-4 rounded-lg bg-gray-200">
         {!formData.appointment_status && (
           <div className="mb-4">
             <div className="text-sm text-gray-600">
               Seleziona uno stato per abilitare
             </div>
           </div>
         )}

         <div className="space-y-6">
           {/* Calendar - EXACTLY like the reference */}
           <div className="w-full">
             <div className={`border rounded-lg w-full ${!formData.appointment_status ? 'opacity-50' : ''}`}>
               <div className="w-full">
                 {/* Calendar - EXACTLY like the reference with date, onNavigate, and components */}
                 <div className="border-x border-b rounded-b-lg bg-white">
                  <Calendar
                     localizer={localizer}
                     events={existingAppointments}
                     startAccessor="start"
                     endAccessor="end"
                     style={{ height: 300, width: '100%' }}
                      defaultDate={calendarDate}
                     onNavigate={handleCalendarNavigate}
                     onSelectSlot={formData.appointment_status ? ({ start }) => onDateSelect?.(start) : undefined}
                     onSelectEvent={formData.appointment_status ? (event) => onDateSelect?.(event.start) : undefined}
                     selectable={!!formData.appointment_status}
                     views={['month']}
                     defaultView="month"
                     step={60}
                     timeslots={1}
                     className={`w-full ${!formData.appointment_status ? 'opacity-50' : ''}`}
                     components={{
                       toolbar: CustomToolbar,
                                               dateCellWrapper: (props: any) => (
                          <CustomDateCellWrapper
                            {...props}
                            selectedDate={selectedDate}
                            onDateCellClick={formData.appointment_status ? ({ start }: { start: Date }) => onDateSelect?.(start) : undefined}
                          />
                        )
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>

           {/* Time Slots */}
           {selectedDate && formData.appointment_status && (
             <div>
               <h4 className="text-sm font-medium text-gray-900 mb-3">
                 Orari disponibili per {selectedDate.toLocaleDateString('it-IT')}
               </h4>
               {(() => {
                 const timeSlots = generateTimeSlots?.(selectedDate);
                  return (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots?.map((slot: any, index: number) => (
                       <button
                         key={slot?.time?.toString() || Math.random()}
                         type="button"
                         onClick={() => slot?.time && onTimeSlotSelect?.(slot.time)}
                         className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                           selectedTimeSlot?.getTime() === slot?.time?.getTime()
                             ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : (slot?.isOccupied || slot?.isAlreadySuggested)
                                ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                               : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                         }`}
                          disabled={slot?.isOccupied || slot?.isAlreadySuggested}
                       >
                         {slot?.time?.toLocaleTimeString('it-IT', { 
                           hour: '2-digit', 
                           minute: '2-digit' 
                         }) || 'N/A'}
                       </button>
                     ))}
                   </div>
                 );
               })()}
             </div>
           )}

                                               {/* Add to Suggested Dates Button - Only for to_schedule with multiple_choice or fixed_date */}
            {formData.appointment_status === 'to_schedule' && 
             formData.appointment_mode === 'multiple_choice' && 
              selectedDate && selectedTimeSlot && (
               <div>
                 <button
                   type="button"
                   onClick={onAddDateTime}
                   className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                 >
                   Aggiungi come data suggerita
                 </button>
               </div>
             )}
         </div>
       </div>
     </div>
   </form>
   );
}
