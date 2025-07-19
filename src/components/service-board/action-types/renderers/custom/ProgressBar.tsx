import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium text-gray-700">Progress</div>
        <div className="text-sm font-medium text-gray-500">{percentage}%</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}; 