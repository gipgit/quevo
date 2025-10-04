// src/components/ui/EmptyState.jsx

"use client";

import React from 'react';

export default function EmptyState({
    primaryTitle,
    secondaryTitle = "",
    backgroundColor = "bg-white/50",
    borderColor = "border-gray-200",
    textColor = "text-gray-500",
    className = "",
    buttonText,
    onButtonClick
}) {
    return (
        <div className={`min-h-[40vh] lg:min-h-[80vh] w-full flex items-center justify-center p-6 rounded-lg border ${backgroundColor} ${borderColor} ${className}`}>
            <div className={`w-full h-full flex items-center justify-center text-center ${textColor} opacity-70`}>
                <div>
                    {primaryTitle && (
                        <h3 className="text-sm lg:text-lg font-medium mb-2">{primaryTitle}</h3>
                    )}
                    {secondaryTitle && (
                        <p className="text-xs lg:text-sm opacity-70 mb-4">{secondaryTitle}</p>
                    )}
                    {buttonText && onButtonClick && (
                        <button
                            onClick={onButtonClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                            {buttonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 