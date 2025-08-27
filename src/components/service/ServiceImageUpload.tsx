"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { PhotoIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline"
import dynamic from "next/dynamic"
import type { ImageCropperRef } from "@/components/dashboard/profile/ImageCropper"
import AIImageGenerationModal from "./AIImageGenerationModal"

const ImageCropper = dynamic(() => import("@/components/dashboard/profile/ImageCropper").then(mod => ({ default: mod.default })), { ssr: false })

interface ServiceImageUploadProps {
  onImageChange: (file: File | null) => void
  currentImage?: File | null
  theme?: 'light' | 'dark'
  serviceTitle?: string
  businessId?: string
}

export default function ServiceImageUpload({ onImageChange, currentImage, theme = 'light', serviceTitle = '', businessId = '' }: ServiceImageUploadProps) {
  const t = useTranslations("services")
  const [preview, setPreview] = useState<string | null>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [triggerCrop, setTriggerCrop] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cropperRef = useRef<ImageCropperRef>(null)

  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [currentImage])

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCropImageSrc(e.target?.result as string)
        setCropperOpen(true)
      }
      reader.readAsDataURL(file)
    } else {
      onImageChange(null)
      setPreview(null)
    }
  }

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    const croppedFile = new File([croppedBlob], "service-cover.webp", { type: "image/webp" })
    onImageChange(croppedFile)
    setPreview(previewUrl)
    setCropperOpen(false)
    setCropImageSrc(null)
    setTriggerCrop(false)
  }

  const handleCropCancel = () => {
    setCropperOpen(false)
    setCropImageSrc(null)
  }

  const removeImage = () => {
    handleImageChange(null)
  }

  const handleCropClick = () => {
    setTriggerCrop(true)
  }

  // Reset trigger after a short delay
  useEffect(() => {
    if (triggerCrop) {
      const timer = setTimeout(() => setTriggerCrop(false), 100)
      return () => clearTimeout(timer)
    }
  }, [triggerCrop])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageChange(imageFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file && file.type.startsWith('image/')) {
      handleImageChange(file)
    }
  }

  const handleAIImageGenerated = (imageDataUrl: string) => {
    // Convert data URL to File object
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "ai-generated-service-cover.webp", { type: "image/webp" })
        handleImageChange(file)
      })
      .catch(error => {
        console.error('Error converting AI generated image to file:', error)
      })
  }

  return (
    <div className="space-y-4 h-full">
      
      <div
        className={`relative flex items-center justify-center h-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : theme === 'dark'
            ? 'border-gray-600 bg-zinc-800'
            : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Service preview"
              className="mx-auto max-h-48 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className={`absolute -top-2 -right-2 p-1 rounded-full ${
                theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
              } text-white transition-colors`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
                      <div className="space-y-4">
              <PhotoIcon className={`mx-auto h-12 w-12 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-300'
              }`} />
              <div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t("dragDropImage")}
                </p>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {t("orClickToSelect")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {t("selectImage")}
                </button>
                {serviceTitle && businessId && (
                  <button
                    type="button"
                    onClick={() => setAiModalOpen(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <SparklesIcon className="h-4 w-4" />
                    {t("generateAIImage")}
                  </button>
                )}
              </div>
            </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Image Cropper Modal */}
      {cropperOpen && cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`relative max-w-2xl w-full mx-4 p-6 rounded-lg ${
            theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {t("cropImage")}
              </h3>
              <button
                onClick={handleCropCancel}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <ImageCropper
              ref={cropperRef}
              image={cropImageSrc}
              aspect={16 / 9} // Rectangular ratio for service covers
              cropShape="rect"
              onCropComplete={handleCropComplete}
              initialZoom={1}
              containerSize={{ width: 500, height: 300 }}
              showCropButton={true}
              showZoomSlider={true}
              triggerCrop={triggerCrop}
            />
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleCropCancel}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-zinc-600 hover:bg-zinc-700 text-gray-100'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleCropClick}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t("crop")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Image Generation Modal */}
      <AIImageGenerationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onImageGenerated={handleAIImageGenerated}
        serviceTitle={serviceTitle}
        businessId={businessId}
      />
    </div>
  )
}
