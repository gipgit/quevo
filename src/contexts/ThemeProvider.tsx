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
    // Get theme from localStorage or system preference
    const detectTheme = () => {
      try {
        const savedTheme = localStorage.getItem('dashboard-theme') as Theme
        if (savedTheme) {
          setTheme(savedTheme)
        } else {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          setTheme(mediaQuery.matches ? 'dark' : 'light')
        }
      } catch (error) {
        setTheme('light')
      } finally {
        setIsLoaded(true)
      }
    }

    // Use requestIdleCallback for non-blocking theme detection
    if ('requestIdleCallback' in window) {
      requestIdleCallback(detectTheme)
    } else {
      setTimeout(detectTheme, 0)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    // Apply theme class to html element
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Save theme preference
    try {
      localStorage.setItem('dashboard-theme', theme)
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
