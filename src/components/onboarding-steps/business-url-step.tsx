"use client"

import { useState, useEffect, useRef } from "react"
import { CheckIcon, XMarkIcon, ArrowPathIcon, GlobeAltIcon } from "@heroicons/react/24/outline"
import type { BusinessFormData } from "../business-onboarding-form"

interface BusinessUrlStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

interface UrlValidation {
  status: "idle" | "checking" | "available" | "unavailable" | "error"
  message: string
}

export function BusinessUrlStep({ formData, updateFormData, onValidationChange }: BusinessUrlStepProps) {
  const [urlValidation, setUrlValidation] = useState<UrlValidation>({
    status: "idle",
    message: "",
  })
  const timeoutRef = useRef<NodeJS.Timeout>()

  const checkUrlAvailability = async (urlname: string) => {
    // Only proceed if urlname is not empty and meets minimum length
    if (!urlname || urlname.length < 3) {
      setUrlValidation({ status: "idle", message: "" })
      return false // Indicate that validation did not occur or failed length check
    }

    setUrlValidation({ status: "checking", message: "Verifica disponibilità..." })

    try {
      const response = await fetch("/api/business/check-urlname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlname }),
      })

      const data = await response.json()

      setUrlValidation({
        status: data.available ? "available" : "unavailable",
        message: data.message,
      })
      return data.available // Return actual availability
    } catch (error) {
      setUrlValidation({
        status: "error",
        message: "Errore durante la verifica",
      })
      return false // Indicate an error occurred
    }
  }

  // Effect to trigger validation on first load if urlname is prefilled
  useEffect(() => {
    if (formData.business_urlname) {
      // Clear any existing timeout to avoid double checks if handleChange also triggered
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      // Trigger check immediately for prefilled value
      checkUrlAvailability(formData.business_urlname);
    }
  // This effect should only run once on component mount for initial check
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means it runs once on mount

  // Effect to report validation status to parent
  useEffect(() => {
    const isValid = urlValidation.status === "available"
    onValidationChange(isValid)
  }, [urlValidation.status, onValidationChange])

  const handleChange = (value: string) => {
    // Clean the URL name: lowercase, only alphanumeric and hyphens, no consecutive hyphens, no leading/trailing hyphens
    const cleanValue = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "")
      .replace(/^-|-$/g, "")

    updateFormData({ business_urlname: cleanValue })

    // Reset validation status immediately on user input
    setUrlValidation({ status: "idle", message: "" });

    // Clear previous timeout for debouncing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced validation
    timeoutRef.current = setTimeout(() => {
      checkUrlAvailability(cleanValue)
    }, 500)
  }

  const getIcon = () => {
    switch (urlValidation.status) {
      case "checking":
        return <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
      case "available":
        return <CheckIcon className="w-5 h-5 text-green-500" />
      case "unavailable":
        return <XMarkIcon className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
       
         <p className="mb-2 text-center lg:text-left text-xs text-gray-500">
          Deve contenere solo lettere minuscole, numeri e trattini.
        </p>
        {/* Custom style for the flex container */}
        <div className="flex items-center rounded-full shadow-sm overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300">
            <GlobeAltIcon className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">
              quevo.app/
            </span>
          </div>
          <div className="relative flex-1">
            <input
              id="business_urlname"
              type="text"
              value={formData.business_urlname}
              onBlur={(e) => handleChange(e.target.value)} // Keep onBlur to ensure a check happens if user tabs out quickly
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent ${
                urlValidation.status === "available"
                  ? "text-green-800 placeholder-green-400" // More distinct success styling
                  : urlValidation.status === "unavailable"
                    ? "text-red-800 placeholder-red-400" // More distinct error styling
                    : "text-gray-900 placeholder-gray-400" // Default styling
              }`}
              placeholder="il-mio-business"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getIcon()}
            </div>
          </div>
        </div>
        {urlValidation.message && (
          <p
            className={`mt-2 text-center lg:text-left text-xs lg:text-sm ${
              urlValidation.status === "available"
                ? "text-green-600"
                : urlValidation.status === "unavailable"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {urlValidation.message}
          </p>
        )}
       
      </div>
    </div>
  )
}