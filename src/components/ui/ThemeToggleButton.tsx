import React from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleButtonProps {
  className?: string
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex w-fit items-center gap-2 rounded text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
      <span className="text-xs lg:text-sm inline">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

export default ThemeToggleButton 