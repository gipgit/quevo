"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // OPTIMIZED: Lazy theme detection to avoid blocking initial render
    const detectTheme = () => {
      try {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') as Theme
        if (savedTheme) {
          setTheme(savedTheme)
        } else {
          // Check system preference (non-blocking)
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          setTheme(mediaQuery.matches ? 'dark' : 'light')
        }
      } catch (error) {
        // Fallback to light theme if localStorage fails
        setTheme('light')
      } finally {
        setIsLoaded(true)
      }
    }

    // Use requestIdleCallback for non-critical theme detection
    if ('requestIdleCallback' in window) {
      requestIdleCallback(detectTheme)
    } else {
      // Fallback for older browsers
      setTimeout(detectTheme, 0)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // OPTIMIZED: Batch DOM updates
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Save theme preference (non-blocking)
    try {
      localStorage.setItem('theme', theme)
    } catch (error) {
      // Ignore localStorage errors
    }
  }, [theme, isLoaded])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 