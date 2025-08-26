import React, { useEffect } from 'react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({ children, className = '' }: AlertDialogContentProps) {
  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children, className = '' }: AlertDialogHeaderProps) {
  return (
    <div className={`p-6 pb-0 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children, className = '' }: AlertDialogTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h2>
  );
}

export function AlertDialogDescription({ children, className = '' }: AlertDialogDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function AlertDialogFooter({ children, className = '' }: AlertDialogFooterProps) {
  return (
    <div className={`flex justify-end space-x-2 p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDialogAction({ children, onClick, className = '' }: AlertDialogActionProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ children, onClick, className = '' }: AlertDialogCancelProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children);
  }
  return <>{children}</>;
}
