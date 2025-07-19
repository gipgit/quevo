"use client"

import React, { useState, useEffect, useCallback } from "react"
import { X } from "lucide-react"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  duration?: number // in milliseconds, default 5000ms
}

interface ToasterProps {
  toast: Toast | null
  onClose: (id: string) => void
}

const Toaster: React.FC<ToasterProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)

  const duration = toast?.duration || 5000
  const progressStep = 100 / (duration / 50) // Update every 50ms

  const handleClose = useCallback(() => {
    if (toast) {
      setIsVisible(false)
      setTimeout(() => onClose(toast.id), 300) // Wait for fade out animation
    }
  }, [toast, onClose])

  useEffect(() => {
    if (toast) {
      setIsVisible(true)
      setProgress(100)
      
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - progressStep
          return newProgress <= 0 ? 0 : newProgress
        })
      }, 50)

      return () => {
        clearTimeout(timer)
        clearInterval(progressTimer)
      }
    }
  }, [toast, duration, progressStep, handleClose])

  if (!toast) return null

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border p-4 transform transition-all duration-300"
    const visibilityStyles = isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    
    const typeStyles = {
      success: "border-green-200 bg-green-50",
      error: "border-red-200 bg-red-50", 
      warning: "border-yellow-200 bg-yellow-50",
      info: "border-blue-200 bg-blue-50"
    }

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type]}`
  }

  const getIconColor = () => {
    const colors = {
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-yellow-600", 
      info: "text-blue-600"
    }
    return colors[toast.type]
  }

  const getProgressColor = () => {
    const colors = {
      success: "stroke-green-500",
      error: "stroke-red-500",
      warning: "stroke-yellow-500",
      info: "stroke-blue-500"
    }
    return colors[toast.type]
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${getIconColor().replace('text-', 'bg-')}`} />
            <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
          </div>
          <p className="text-sm text-gray-600">{toast.message}</p>
        </div>
        
        <button
          onClick={handleClose}
          className="relative ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
        >
          {/* Progress circle */}
          <svg className="absolute inset-0 w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray="62.83"
              strokeDashoffset={62.83 - (62.83 * progress) / 100}
              className={`${getProgressColor()} transition-all duration-50`}
            />
          </svg>
          
          {/* X icon */}
          <X className="w-3 h-3 text-gray-500 group-hover:text-gray-700 transition-colors relative z-10" />
        </button>
      </div>
    </div>
  )
}

export default Toaster 