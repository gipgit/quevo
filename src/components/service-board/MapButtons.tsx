import React from 'react';

interface MapButtonsProps {
  location: string;
  className?: string;
}

const MapButtons: React.FC<MapButtonsProps> = ({ location, className }) => {
  if (!location) return null;
  return (
    <div className={`flex flex-row gap-2 flex-wrap ${className || ''}`}>
      <button
        onClick={() => navigator.clipboard.writeText(location)}
        className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors flex items-center gap-1"
        title="Copy address"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        <span>Copy</span>
      </button>
      <button
        onClick={() => {
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
          window.open(url, '_blank');
        }}
        className="px-2 py-1 text-xs font-medium text-white bg-[#4285F4] hover:bg-[#357ae8] rounded-full shadow-sm transition-colors flex items-center gap-1"
        title="Open in Google Maps"
      >
        <img src="/icons/appointments/googlemaps.svg" alt="Google Maps" className="w-4 h-4 mr-1" />Maps
      </button>
      <button
        onClick={() => {
          const url = `https://waze.com/ul?q=${encodeURIComponent(location)}`;
          window.open(url, '_blank');
        }}
        className="px-2 py-1 text-xs font-medium text-white bg-[#33CCFF] hover:bg-[#1eb8e6] rounded-full shadow-sm transition-colors flex items-center gap-1"
        title="Open in Waze"
      >
        <img src="/icons/appointments/waze.svg" alt="Waze" className="w-4 h-4 mr-1" />Waze
      </button>
    </div>
  );
};

export default MapButtons; 