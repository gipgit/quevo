import React, { useState, useRef, useEffect } from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClick?: () => void;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function Select({ value, onValueChange, children, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<SelectTriggerProps>, {
              onClick: () => setIsOpen(!isOpen),
              isOpen
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child as React.ReactElement<SelectContentProps>, {
              onSelect: (selectedValue: string) => {
                onValueChange(selectedValue);
                setIsOpen(false);
              }
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ children, className = '', isOpen, onClick }: SelectTriggerProps & { isOpen?: boolean; onClick?: () => void }) {
  return (
    <div
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-100 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function SelectContent({ children, className = '', onSelect }: SelectContentProps & { onSelect?: (value: string) => void }) {
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-zinc-800 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
            onClick: () => onSelect?.(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value, children, className = '', onClick }: SelectItemProps & { onClick?: () => void }) {
  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, className = '' }: SelectValueProps) {
  return (
    <span className={`text-gray-900 dark:text-gray-100 ${className}`}>
      {placeholder || 'Select an option'}
    </span>
  );
}
