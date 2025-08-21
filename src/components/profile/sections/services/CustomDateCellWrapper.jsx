// src/components/profile/sections/booking/CustomDateCellWrapper.jsx
import React from 'react';
import { format, isBefore, startOfDay } from 'date-fns';

// This component now handles both click and content rendering.
// It will receive 'children' from react-big-calendar, but we will NOT render them,
// as we are taking full control of the cell's content.
const CustomDateCellWrapper = ({ children, value, onDateCellClick, availableDaysOverview, themeColorButton, ...rest }) => {
  const handleClick = (e) => {
    // Prevent any default behavior from elements *inside* this wrapper (like the default button if it renders).
    // This is crucial to stop the browser's default actions or event propagation.
    e.preventDefault();
    e.stopPropagation();

    // Call the actual selection function that was passed down.
    if (onDateCellClick) {
      onDateCellClick({ start: value, end: value });
    } else {
      console.warn("onDateCellClick was not provided to CustomDateCellWrapper.");
    }
  };

  const dayString = format(value, 'yyyy-MM-dd');
  const isAvailable = availableDaysOverview && availableDaysOverview.includes(dayString);
  const today = startOfDay(new Date());
  const isPastDate = isBefore(value, today);
  const dayNumber = format(value, 'd');
  
  // Debug logging for the first few days to see what's happening
  if (dayNumber <= '5') {
    console.log(`Date cell debug - Date: ${dayString}, isAvailable: ${isAvailable}, isPastDate: ${isPastDate}`);
  }

  return (
    <div
      onClick={handleClick}
      {...rest}
      // Ensure this div covers the entire cell and is clickable
      style={{
        height: '100%',
        width: '100%',
        cursor: 'pointer',
        display: 'flex', // Use flexbox for centering content
        alignItems: 'center',
        justifyContent: 'center',
        // Optional: Remove default padding of rbc-date-cell if it messes with circle
        // padding: '0 !important',
        ...rest.style, // Apply any styles passed by react-big-calendar
      }}
    >
      {/* This is the content that replaces the default date cell number/button */}
      {isAvailable && !isPastDate ? (
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm md:text-base"
          style={{
            backgroundColor: themeColorButton,
            color: 'white',
            // Adjust font size if numbers don't fit well or seem too small/large
            // fontSize: '1.1em'
          }}
        >
          {dayNumber}
        </div>
      ) : (
        // Render default number, optionally dimmed for past dates
        <span className={`text-sm md:text-base ${isPastDate ? 'opacity-50' : ''}`}>
          {dayNumber}
        </span>
      )}
    </div>
  );
};

export default CustomDateCellWrapper;