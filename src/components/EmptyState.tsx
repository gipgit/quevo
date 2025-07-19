import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick
}) => {
  return (
    <div className="w-full min-h-[90vh] bg-gray-100 border-[2px] border-gray-300 rounded-lg flex flex-col items-center justify-center p-8">
      <div className="text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {description}
      </p>
      <button
        onClick={onButtonClick}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState; 