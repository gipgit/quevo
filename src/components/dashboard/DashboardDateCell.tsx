import React from 'react';
import { format, isSameDay } from 'date-fns';

interface DashboardDateCellProps {
  value: Date;
  selectedDate?: Date | string | null;
  appointments?: { start: Date | string; title?: string }[];
  available?: boolean;
  onDateCellClick?: (info: { start: Date; end: Date }) => void;
}

const DashboardDateCell: React.FC<DashboardDateCellProps & any> = ({
  value,
  selectedDate,
  appointments = [],
  available = false,
  onDateCellClick,
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
      className={`w-full h-full flex flex-col items-center justify-start cursor-pointer rounded
        ${isSelected ? 'bg-blue-100 font-bold text-blue-700' : ''}
        ${available ? 'ring-2 ring-green-400' : ''}
      `}
      style={{
        minHeight: 60,
        minWidth: 40,
        paddingTop: 4,
        paddingBottom: 4,
        boxSizing: 'border-box',
      }}
      {...rest}
    >
      <span className="text-base" style={{ color: 'red', fontSize: 24 }}>{dayNumber}</span>
      {/* Appointments as dots */}
      <div className="flex flex-row gap-1 mt-1 w-full justify-center">
        {appointments.slice(0, 3).map((appt: { title?: string }, idx: number) => (
          <span key={idx} className="w-2 h-2 rounded-full bg-blue-400" title={appt.title || ''}></span>
        ))}
        {appointments.length > 3 && (
          <span className="text-xs text-gray-400">+{appointments.length - 3}</span>
        )}
      </div>
    </div>
  );
};

export default DashboardDateCell; 