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
    <div className="w-full min-h-[90vh] bg-[var(--dashboard-bg-tertiary)] border-[2px] border-[var(--dashboard-border-primary)] rounded-lg flex flex-col items-center justify-center p-8">
      <div className="text-[var(--dashboard-text-tertiary)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-[var(--dashboard-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-[var(--dashboard-text-secondary)] text-center mb-6 max-w-md">
        {description}
      </p>
      <button
        onClick={onButtonClick}
        className="bg-[var(--dashboard-bg-secondary)] hover:bg-[var(--dashboard-bg-primary)] text-[var(--dashboard-text-primary)] px-4 py-2 rounded-lg transition-colors border border-[var(--dashboard-border-primary)]"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState; 