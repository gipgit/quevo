"use client"

import React, { useState, useEffect, useCallback } from "react"
import { X, Check, XCircle, AlertTriangle, Info } from "lucide-react"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  technicalDetails?: string // Optional technical details for errors
  duration?: number // in milliseconds, default 7000ms
}

interface ToasterProps {
  toast: Toast | null
  onClose: (id: string) => void
}

const Toaster: React.FC<ToasterProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)

  const duration = toast?.duration || 7000
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
    const baseStyles = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[95vw] lg:max-w-[400px] w-full rounded-lg border p-4 transition-all duration-300"
    const visibilityStyles = isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
    
    const typeStyles = {
      success: "border-green-200 bg-gradient-to-t from-green-50 to-white shadow-[0_20px_50px_rgba(34,197,94,0.3)]",
      error: "border-red-200 bg-gradient-to-t from-red-50 to-white shadow-[0_20px_50px_rgba(239,68,68,0.3)]", 
      warning: "border-yellow-200 bg-yellow-50 shadow-[0_20px_50px_rgba(234,179,8,0.3)]",
      info: "border-blue-200 bg-blue-50 shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
    }

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type] || typeStyles.info}` // Fallback to info style if type is not recognized
  }

  const getIconColor = () => {
    const colors = {
      success: "text-green-600",
      error: "text-red-600",
      warning: "text-yellow-600", 
      info: "text-blue-600"
    }
    return colors[toast.type] || "text-gray-600" // Fallback to gray if type is not recognized
  }

  const getProgressColor = () => {
    const colors = {
      success: "stroke-green-500",
      error: "stroke-red-500",
      warning: "stroke-yellow-500",
      info: "stroke-blue-500"
    }
    return colors[toast.type] || "stroke-gray-500" // Fallback to gray if type is not recognized
  }

  const getToastIcon = () => {
    const iconStyles = {
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-yellow-500 text-white",
      info: "bg-blue-500 text-white"
    }
    
    const style = iconStyles[toast.type] || iconStyles.info
    
    switch (toast.type) {
      case "success":
        return <Check className={`w-4 h-4 rounded-full p-0.5 ${style}`} />
      case "error":
        return <XCircle className={`w-4 h-4 rounded-full p-0.5 ${style}`} />
      case "warning":
        return <AlertTriangle className={`w-4 h-4 rounded-full p-0.5 ${style}`} />
      case "info":
        return <Info className={`w-4 h-4 rounded-full p-0.5 ${style}`} />
      default:
        return <div className={`w-4 h-4 rounded-full ${style} flex items-center justify-center text-xs font-bold`}>?</div>
    }
  }

  return (
    <div className={getToastStyles()}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
             {toast.type === "success" ? (
               // Success: Only show message without title
               <div className="flex items-center gap-2">
                 {getToastIcon()}
                 <p className="text-sm text-gray-600">{toast.message}</p>
               </div>
             ) : (
               // Error/other types: Show title and message
               <>
                 <div className="flex items-center gap-2 mb-1">
                   {getToastIcon()}
                   <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
                 </div>
                <p className="text-sm text-gray-600">{toast.message}</p>
                {toast.technicalDetails && (
                  <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                    {toast.technicalDetails}
                  </p>
                )}
              </>
            )}
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