"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import Toaster, { Toast } from "./Toaster"

interface ToasterContextType {
  showToast: (toast: Omit<Toast, "id">) => void
  closeToast: (id: string) => void
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined)

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toastData: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toastData, id }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ showToast, closeToast }}>
      {children}
      {toasts.map(toast => (
        <Toaster key={toast.id} toast={toast} onClose={closeToast} />
      ))}
    </ToasterContext.Provider>
  )
}

export const useToaster = () => {
  const context = useContext(ToasterContext)
  if (!context) {
    // Return a fallback implementation instead of throwing
    return {
      showToast: (toastData: Omit<Toast, "id">) => {
        console.warn("Toaster not available - toast not shown:", toastData)
      },
      closeToast: (id: string) => {
        console.warn("Toaster not available - cannot close toast:", id)
      }
    }
  }
  return context
} 