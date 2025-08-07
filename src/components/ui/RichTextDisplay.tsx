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
  theme
}: RichTextDisplayProps) {
  if (!content) return null

  const getThemeClass = () => {
    if (!theme) return ''
    return theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  }

  return (
    <div 
      className={`rich-text-display ${className} ${getThemeClass()}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        lineHeight: '1.5'
      }}
    />
  )
} 