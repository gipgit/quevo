"use client"

import React from 'react'

interface RichTextDisplayProps {
  content: string
  className?: string
  theme?: 'light' | 'dark'
}

export default function RichTextDisplay({ 
  content, 
  className = "",
  theme = 'light'
}: RichTextDisplayProps) {
  if (!content) return null

  return (
    <div 
      className={`rich-text-display ${className} ${
        theme === 'dark' 
          ? 'text-gray-100' 
          : 'text-gray-900'
      }`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: '1.5'
      }}
    />
  )
} 