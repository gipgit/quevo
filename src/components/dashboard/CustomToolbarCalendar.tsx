import React from 'react';

interface ToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView?: (view: string) => void;
}

const DashboardCalendarToolbar: React.FC<ToolbarProps & any> = (toolbar) => {
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
    <div className="rbc-toolbar flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={goToBack} className="rbc-btn px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          &#9664;
        </button>
        <button type="button" onClick={goToToday} className="rbc-btn px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">
          Today
        </button>
        <button type="button" onClick={goToNext} className="rbc-btn px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
          &#9654;
        </button>
      </div>
      <span className="rbc-toolbar-label text-xl md:text-2xl font-bold">{toolbar.label}</span>
    </div>
  );
};

export default DashboardCalendarToolbar; 