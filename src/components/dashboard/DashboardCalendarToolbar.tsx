import React from 'react';

interface ToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView?: (view: string) => void;
  view?: string;
}

const leftArrow = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const rightArrow = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

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

  const setView = (view: string) => {
    if (toolbar.onView) toolbar.onView(view);
  };

  return (
    <div className="rbc-toolbar flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-center w-full gap-2">
        <button type="button" onClick={goToBack} className="rbc-btn px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
          {leftArrow}
        </button>
        <span className="rbc-toolbar-label text-xl md:text-2xl font-bold flex-1 text-center">
          {toolbar.label}
        </span>
        <button type="button" onClick={goToNext} className="rbc-btn px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
          {rightArrow}
        </button>
      </div>
      <div className="flex items-center gap-2 justify-center">
        <button type="button" onClick={goToToday} className="rbc-btn px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">
          Today
        </button>
        <button
          type="button"
          onClick={() => setView('month')}
          className={`rbc-btn px-3 py-1 rounded transition-colors ${toolbar.view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => setView('week')}
          className={`rbc-btn px-3 py-1 rounded transition-colors ${toolbar.view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          Week
        </button>
      </div>
    </div>
  );
};

export default DashboardCalendarToolbar; 