import React from 'react';

const CustomToolbar = (toolbar) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const goToToday = () => {
    toolbar.onNavigate('TODAY');
  };

  const goToView = (view) => {
    toolbar.onView(view);
  };

  return (
    <div className="rbc-toolbar">
      {/* Navigation Group: PREV Arrow, Month/Year Label, NEXT Arrow */}
      <span className="rbc-btn-group w-full flex items-center justify-between gap-x-3">
        <button type="button" onClick={goToBack} className="rbc-btn">
          &#9664; {/* Unicode Left Arrow */}
        </button>

        {/* The Month/Year Label is now here, between the arrows */}
        <span className="rbc-toolbar-label text-xl md:text-2xl">{toolbar.label}</span>

        <button type="button" onClick={goToNext} className="rbc-btn">
          &#9654; {/* Unicode Right Arrow */}
        </button>
      </span>

     
    </div>
  );
};

export default CustomToolbar;