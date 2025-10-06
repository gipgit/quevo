// src/components/ui/EmptyStateDashboard.tsx

"use client";

import React from 'react';

interface EmptyStateDashboardProps {
  primaryTitle: string;
  secondaryTitle?: string;
  backgroundColor?: string | null;
  borderColor?: string | null;
  textColor?: string | null;
  className?: string;
  buttonText?: string | null;
  onButtonClick?: (() => void) | null;
  icon?: React.ReactNode;
}

export default function EmptyStateDashboard({
    primaryTitle,
    secondaryTitle = "",
    backgroundColor = null,
    borderColor = null,
    textColor = null,
    className = "",
    buttonText = null,
    onButtonClick = null,
    icon
}: EmptyStateDashboardProps) {
    // Default theme-aware styles using CSS variables
    const defaultBackgroundColor = "bg-[var(--dashboard-bg-primary)]";
    const defaultBorderColor = "border-[var(--dashboard-border-primary)]";
    const defaultTextColor = "text-[var(--dashboard-text-secondary)]";
    
    return (
        <div className={`min-h-[40vh] lg:min-h-[80vh] w-full flex items-center justify-center p-6 rounded-lg border ${backgroundColor || defaultBackgroundColor} ${borderColor || defaultBorderColor} ${className}`}>
            <div className={`w-full h-full flex items-center justify-center text-center ${textColor || defaultTextColor} opacity-70`}>
                <div>
                    {icon && (
                        <div className="mb-4 flex justify-center">
                            {icon}
                        </div>
                    )}
                    {primaryTitle && (
                        <h3 className="text-sm lg:text-lg font-medium mb-2">{primaryTitle}</h3>
                    )}
                    {secondaryTitle && (
                        <p className="text-xs lg:text-sm opacity-70 mb-4">{secondaryTitle}</p>
                    )}
                    {buttonText && onButtonClick && (
                        <button
                            onClick={onButtonClick}
                            className="bg-[var(--dashboard-accent-primary)] hover:bg-[var(--dashboard-accent-secondary)] text-[var(--dashboard-text-primary)] px-4 py-2 rounded-lg transition-colors text-sm border border-[var(--dashboard-border-primary)]"
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
