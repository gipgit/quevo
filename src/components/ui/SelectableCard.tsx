import React from 'react';

interface SelectableCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  theme: 'light' | 'dark';
  className?: string;
}

export default function SelectableCard({
  title,
  description,
  selected,
  onSelect,
  theme,
  className = '',
}: SelectableCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        selected
          ? 'border-[var(--dashboard-active-border)] bg-[var(--dashboard-active-bg)]'
          : 'border-[var(--dashboard-border-primary)] hover:border-[var(--dashboard-border-secondary)] bg-[var(--dashboard-bg-card)]'
      } ${className}`}
      onClick={() => onSelect(!selected)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-medium text-sm ${
            selected
              ? 'text-[var(--dashboard-active-text)]'
              : 'text-[var(--dashboard-text-primary)]'
          }`}>
            {title}
          </h3>
          <p className={`text-xs mt-1 ${
            selected
              ? 'text-[var(--dashboard-active-text-secondary)]'
              : 'text-[var(--dashboard-text-secondary)]'
          }`}>
            {description}
          </p>
        </div>
        <div className={`ml-3 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected
            ? 'border-[var(--dashboard-active-border)] bg-[var(--dashboard-active-border)]'
            : 'border-[var(--dashboard-border-secondary)]'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
