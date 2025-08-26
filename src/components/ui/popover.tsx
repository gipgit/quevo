import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const isControlled = open !== undefined;
  const isOpenState = isControlled ? open : isOpen;
  const setIsOpenState = isControlled ? onOpenChange : setIsOpen;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpenState?.(false);
      }
    };

    if (isOpenState) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpenState, setIsOpenState]);

  return (
    <div className="relative" ref={triggerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === PopoverTrigger) {
            return React.cloneElement(child as React.ReactElement<PopoverTriggerProps>, {
              onClick: () => {
                // For controlled components, only toggle if not already open
                if (isControlled) {
                  setIsOpenState?.(!isOpenState);
                } else {
                  setIsOpenState?.(!isOpenState);
                }
              }
            });
          }
          if (child.type === PopoverContent && isOpenState) {
            return child;
          }
        }
        return child;
      })}
    </div>
  );
}

export function PopoverTrigger({ children, asChild, onClick }: PopoverTriggerProps & { onClick?: () => void }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { onClick });
  }
  return (
    <div onClick={onClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export function PopoverContent({ children, className = '' }: PopoverContentProps) {
  return (
    <div className={`absolute top-full left-0 z-50 mt-2 rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-zinc-800 ${className}`}>
      {children}
    </div>
  );
}
