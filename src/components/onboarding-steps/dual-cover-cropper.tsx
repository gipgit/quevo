"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { PhotoIcon, XMarkIcon, DevicePhoneMobileIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline"
import dynamic from "next/dynamic"
import type { ImageCropperRef } from "@/components/dashboard/profile/ImageCropper"

const ImageCropper = dynamic(() => import("@/components/dashboard/profile/ImageCropper").then(mod => ({ default: mod.default })), { ssr: false })

interface DualCoverCropperProps {
  imageSrc: string
  onCropComplete: (mobileBlob: Blob, desktopBlob: Blob, mobilePreview: string, desktopPreview: string) => void
  onCancel: () => void
}

export default function DualCoverCropper({ imageSrc, onCropComplete, onCancel }: DualCoverCropperProps) {
  const t = useTranslations("BusinessOnboarding")
  const [currentCrop, setCurrentCrop] = useState<"mobile" | "desktop">("mobile")
  const [mobileBlob, setMobileBlob] = useState<Blob | null>(null)
  const [desktopBlob, setDesktopBlob] = useState<Blob | null>(null)
  const [mobilePreview, setMobilePreview] = useState<string | null>(null)
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null)
  const [triggerCrop, setTriggerCrop] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const cropperRef = useRef<ImageCropperRef>(null)

  // Initialize cropper when component mounts
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Reset cropper state when crop type changes
  useEffect(() => {
    if (isInitialized && currentCrop === "desktop") {
      // Small delay to ensure the cropper has re-rendered with new aspect ratio
      setTimeout(() => {
        setTriggerCrop(false)
        setIsTransitioning(false)
      }, 150)
    }
  }, [currentCrop, isInitialized])

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    // Prevent completion during transition
    if (isTransitioning) {
      return
    }

    if (currentCrop === "mobile") {
      setMobileBlob(croppedBlob)
      setMobilePreview(previewUrl)
      // Switch to desktop crop
      setIsTransitioning(true)
      setCurrentCrop("desktop")
    } else {
      setDesktopBlob(croppedBlob)
      setDesktopPreview(previewUrl)
      // Both crops are complete
      if (mobileBlob) {
        onCropComplete(mobileBlob, croppedBlob, mobilePreview!, previewUrl)
      }
    }
  }

  const handleCropClick = () => {
    if (!isTransitioning) {
      setTriggerCrop(true)
    }
  }



  // Reset trigger after a short delay
  useEffect(() => {
    if (triggerCrop) {
      const timer = setTimeout(() => setTriggerCrop(false), 100)
      return () => clearTimeout(timer)
    }
  }, [triggerCrop])

  return (
    <div className="fixed inset-0 top-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center">
          {/* Unified Header */}
          <div className="w-full mb-3">
            <h3 className="text-base font-medium text-center mb-1">
              {t("cropImage")}
            </h3>
          </div>

          {/* Simplified Crop Type Indicator */}
          <div className="flex gap-3 mb-2">
            <div className={`flex items-center gap-1.5 text-xs ${
              currentCrop === "mobile" ? "text-blue-600 font-medium" : "text-gray-500"
            }`}>
              <DevicePhoneMobileIcon className="w-4 h-4" />
              <span>{t("mobile")}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${
              currentCrop === "desktop" ? "text-blue-600 font-medium" : "text-gray-500"
            }`}>
              <ComputerDesktopIcon className="w-4 h-4" />
              <span>{t("desktop")}</span>
            </div>
          </div>

          {/* Description below the pills */}
          <div className="w-full mb-3">
            <p className="text-xs text-gray-600 text-center">
              {currentCrop === "mobile" 
                ? t("mobileCropDescription") 
                : t("desktopCropDescription")
              }
            </p>
          </div>

          {/* Cropper with responsive sizing */}
          <div className="w-full flex justify-center">
            {isInitialized && !isTransitioning && (
              <div className="w-full max-w-sm md:max-w-md">
                <ImageCropper
                  key={`${currentCrop}-${imageSrc}`}
                  ref={cropperRef}
                  image={imageSrc}
                  aspect={currentCrop === "mobile" ? 3 : 1}
                  cropShape="rect"
                  onCropComplete={handleCropComplete}
                  containerSize={{ 
                    width: Math.min(400, window.innerWidth - 64), 
                    height: currentCrop === "mobile" ? Math.min(133, (window.innerWidth - 64) / 3) : Math.min(400, window.innerWidth - 64)
                  }}
                  showCropButton={false}
                  showZoomSlider={true}
                  triggerCrop={triggerCrop}
                />
              </div>
            )}
            {isTransitioning && (
              <div className="flex items-center justify-center w-full max-w-sm md:max-w-md h-32 md:h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">{t("switchingToDesktop")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm" 
              onClick={onCancel}
            >
              {t("cancel")}
            </button>
            
            
            
            <button 
              className={`px-4 py-2 rounded text-sm ${
                isTransitioning 
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleCropClick}
              disabled={isTransitioning}
            >
              {currentCrop === "mobile" ? t("nextCrop") : t("finishCrop")}
            </button>
          </div>

          
        </div>
      </div>
    </div>
  )
} 