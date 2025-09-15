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
      success: "border-green-200 dark:border-green-800 bg-gradient-to-b from-[var(--dashboard-bg-card)] from-80% to-green-400 dark:from-[var(--dashboard-bg-primary)] dark:from-80% dark:to-green-500 shadow-[0_20px_50px_rgba(34,197,94,0.3)] dark:shadow-[0_20px_50px_rgba(34,197,94,0.1)]",
      error: "border-red-200 dark:border-red-800 bg-gradient-to-b from-[var(--dashboard-bg-card)] from-80% to-red-400 dark:from-[var(--dashboard-bg-primary)] dark:from-80% dark:to-red-500 shadow-[0_20px_50px_rgba(239,68,68,0.3)] dark:shadow-[0_20px_50px_rgba(239,68,68,0.1)]", 
      warning: "border-yellow-200 dark:border-yellow-800 bg-gradient-to-b from-[var(--dashboard-bg-card)] from-80% to-yellow-400 dark:from-[var(--dashboard-bg-primary)] dark:from-80% dark:to-yellow-500 shadow-[0_20px_50px_rgba(234,179,8,0.3)] dark:shadow-[0_20px_50px_rgba(234,179,8,0.1)]",
      info: "border-blue-200 dark:border-blue-800 bg-gradient-to-b from-[var(--dashboard-bg-card)] from-80% to-blue-400 dark:from-[var(--dashboard-bg-primary)] dark:from-80% dark:to-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)] dark:shadow-[0_20px_50px_rgba(59,130,246,0.1)]"
    }

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type] || typeStyles.info}` // Fallback to info style if type is not recognized
  }

  const getIconColor = () => {
    const colors = {
      success: "text-green-600 dark:text-green-400",
      error: "text-red-600 dark:text-red-400",
      warning: "text-yellow-600 dark:text-yellow-400", 
      info: "text-blue-600 dark:text-blue-400"
    }
    return colors[toast.type] || "text-[var(--dashboard-text-secondary)]" // Fallback to dashboard text color
  }

  const getProgressColor = () => {
    const colors = {
      success: "stroke-green-500 dark:stroke-green-400",
      error: "stroke-red-500 dark:stroke-red-400",
      warning: "stroke-yellow-500 dark:stroke-yellow-400",
      info: "stroke-blue-500 dark:stroke-blue-400"
    }
    return colors[toast.type] || "stroke-[var(--dashboard-text-secondary)]" // Fallback to dashboard text color
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
                 <p className="text-sm text-[var(--dashboard-text-secondary)]">{toast.message}</p>
               </div>
             ) : (
               // Error/other types: Show title and message
               <>
                 <div className="flex items-center gap-2 mb-1">
                   {getToastIcon()}
                   <h4 className="text-sm font-semibold text-[var(--dashboard-text-primary)]">{toast.title}</h4>
                 </div>
                <p className="text-sm text-[var(--dashboard-text-secondary)]">{toast.message}</p>
                {toast.technicalDetails && (
                  <p className="text-xs text-[var(--dashboard-text-tertiary)] mt-1 font-mono break-all">
                    {toast.technicalDetails}
                  </p>
                )}
              </>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="relative ml-4 flex-shrink-0 w-6 h-6 rounded-full bg-[var(--dashboard-bg-tertiary)] hover:bg-[var(--dashboard-bg-secondary)] transition-colors flex items-center justify-center group"
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
                className="text-[var(--dashboard-border-secondary)]"
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
            <X className="w-3 h-3 text-[var(--dashboard-text-tertiary)] group-hover:text-[var(--dashboard-text-secondary)] transition-colors relative z-10" />
          </button>
        </div>
    </div>
  )
}

export default Toaster 