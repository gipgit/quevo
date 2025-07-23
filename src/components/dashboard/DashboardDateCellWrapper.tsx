import React from 'react';
import { format, isSameDay } from 'date-fns';

interface DashboardDateCellWrapperProps {
  value: Date;
  selectedDate?: Date | string | null;
  appointments?: { start: Date | string; title?: string }[];
  available?: boolean;
  onDateCellClick?: (info: { start: Date; end: Date }) => void;
  renderAppointments?: React.ReactNode;
}

const DashboardDateCellWrapper: React.FC<DashboardDateCellWrapperProps & any> = ({
  value,
  selectedDate,
  appointments = [],
  available = false,
  onDateCellClick,
  renderAppointments,
  ...rest
}) => {
  const dayNumber = format(value, 'd');
  const isSelected =
    selectedDate &&
    isSameDay(
      typeof selectedDate === 'string' ? new Date(selectedDate) : selectedDate,
      value
    );

  return (
    <div
      onClick={() => onDateCellClick && onDateCellClick({ start: value, end: value })}
      style={{
        height: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        width: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '4px 6px',
        background: isSelected ? '#dbeafe' : undefined,
        borderRadius: isSelected ? 8 : undefined,
        position: 'relative',
      }}
      {...rest}
    >
      {/* Date number positioned at top-center */}
      <span style={{ 
        color: 'var(--theme-color-text, #333)', 
        fontSize: 14, 
        fontWeight: 500,
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2
      }}>
        {dayNumber}
      </span>
      
      {/* Appointments container with top margin to avoid overlap */}
      <div style={{ 
        width: '100%', 
        marginTop: 20, // Space for date number
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        paddingRight: 4
      }}>
        {renderAppointments ? (
          renderAppointments
        ) : (
          appointments.slice(0, 3).map((appt: any, idx: number) => {
            const apptTime = typeof appt.start === 'string' ? new Date(appt.start) : appt.start;
            const timeStr = format(apptTime, 'HH:mm');
            
            return (
              <div 
                key={idx} 
                style={{ 
                  fontSize: 9, 
                  background: '#e0e7ff', 
                  borderRadius: 3, 
                  padding: '1px 3px', 
                  marginBottom: 1, 
                  width: '100%', 
                  textOverflow: 'ellipsis', 
                  overflow: 'hidden', 
                  whiteSpace: 'nowrap',
                  border: '1px solid #c7d2fe',
                  lineHeight: '1.2'
                }}
                title={`${timeStr} - ${appt.title}`}
              >
                <span style={{ fontWeight: 500, color: '#4338ca' }}>{timeStr}</span>
                <span style={{ color: '#374151', marginLeft: 2 }}>-</span>
                <span style={{ color: '#374151' }}>{appt.title}</span>
              </div>
            );
          })
        )}
        {appointments.length > 3 && (
          <div style={{ 
            fontSize: 8, 
            color: '#6b7280', 
            textAlign: 'center',
            padding: '1px 2px'
          }}>
            +{appointments.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardDateCellWrapper; 