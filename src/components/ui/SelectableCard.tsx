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
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : `border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 ${
              theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
            }`
      } ${className}`}
      onClick={() => onSelect(!selected)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-medium text-sm ${
            selected
              ? 'text-blue-700 dark:text-blue-300'
              : theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <p className={`text-xs mt-1 ${
            selected
              ? 'text-blue-600 dark:text-blue-400'
              : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
        </div>
        <div className={`ml-3 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          selected
            ? 'border-blue-500 bg-blue-500'
            : 'border-gray-300 dark:border-gray-500'
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
