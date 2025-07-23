import React from 'react';
import { format, isBefore, startOfDay } from 'date-fns';

interface CustomDateCellWrapperProps {
  value: Date;
  children?: React.ReactNode;
  onDateCellClick?: (info: { start: Date; end: Date }) => void;
  selectedDate?: Date | null;
}

const DashboardDateCellWrapper: React.FC<CustomDateCellWrapperProps & any> = ({ value, onDateCellClick, selectedDate, ...rest }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDateCellClick) {
      onDateCellClick({ start: value, end: value });
    }
  };

  const today = startOfDay(new Date());
  const isPastDate = isBefore(value, today);
  const dayNumber = format(value, 'd');
  const selectedDateObj = selectedDate instanceof Date ? selectedDate : selectedDate ? new Date(selectedDate) : null;
  const isSelected = selectedDateObj &&
    value.getFullYear() === selectedDateObj.getFullYear() &&
    value.getMonth() === selectedDateObj.getMonth() &&
    value.getDate() === selectedDateObj.getDate();

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
        background: isSelected ? '#dbeafe' : undefined,
        ...rest.style,
      }}
    >
      <span className={`${isPastDate ? 'opacity-50' : ''} ${isSelected ? 'font-bold text-blue-600' : ''}`}>
        {dayNumber}
      </span>
    </div>
  );
};

export default DashboardDateCellWrapper; 