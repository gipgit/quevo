"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTheme } from "@/contexts/ThemeContext"
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline"

interface AIImageGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onImageGenerated: (imageDataUrl: string) => void
  serviceTitle: string
  businessId: string
}

export default function AIImageGenerationModal({
  isOpen,
  onClose,
  onImageGenerated,
  serviceTitle,
  businessId
}: AIImageGenerationModalProps) {
  const t = useTranslations("services")
  const { theme } = useTheme()
  
  const [imageDescription, setImageDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!serviceTitle.trim()) {
      setError(t("serviceNameRequired"))
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/services/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceTitle: serviceTitle.trim(),
          imageDescription: imageDescription.trim(),
          businessId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t("aiImageError"))
      }

      if (data.success && data.imageDataUrl) {
        onImageGenerated(data.imageDataUrl)
        onClose()
      } else {
        throw new Error('Invalid response from image generation service')
      }

    } catch (err) {
      console.error('Error generating image:', err)
      setError(err instanceof Error ? err.message : t("aiImageError"))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClose = () => {
    if (!isGenerating) {
      setError(null)
      setImageDescription("")
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`relative max-w-md w-full mx-4 p-6 rounded-lg ${
        theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <SparklesIcon className={`h-6 w-6 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {t("aiImageGeneration")}
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-zinc-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Service Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t("serviceName")}
            </label>
            <input
              type="text"
              value={serviceTitle}
              disabled
              className={`w-full px-3 py-2 border rounded-lg ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-zinc-700 text-gray-300' 
                  : 'border-gray-300 bg-gray-100 text-gray-600'
              }`}
            />
          </div>

          {/* Image Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t("aiImageDescription")}
            </label>
            <textarea
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder={t("aiImageDescriptionPlaceholder")}
              rows={3}
              disabled={isGenerating}
              className={`w-full px-3 py-2 border rounded-lg resize-none ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-zinc-700 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <p className={`text-xs mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {t("aiImageDescriptionHelp")}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg ${
              theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
          }`}>
            <p className="text-sm">
              {t("aiImageInfo")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-zinc-600 hover:bg-zinc-700 text-gray-100'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !serviceTitle.trim()}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              isGenerating || !serviceTitle.trim()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("generatingImage")}
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4" />
                {t("generateAIImage")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
