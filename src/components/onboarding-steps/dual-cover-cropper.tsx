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
  const cropperRef = useRef<ImageCropperRef>(null)

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    if (currentCrop === "mobile") {
      setMobileBlob(croppedBlob)
      setMobilePreview(previewUrl)
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
    setTriggerCrop(true)
  }

  const handleSkipDesktop = () => {
    if (mobileBlob) {
      // Use mobile crop for both if desktop is skipped
      onCropComplete(mobileBlob, mobileBlob, mobilePreview!, mobilePreview!)
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
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center">
          {/* Header */}
          <div className="w-full mb-4">
            <h3 className="text-lg font-semibold text-center mb-2">
              {currentCrop === "mobile" ? t("cropForMobile") : t("cropForDesktop")}
            </h3>
            <p className="text-sm text-gray-600 text-center">
              {currentCrop === "mobile" 
                ? t("mobileCropDescription") 
                : t("desktopCropDescription")
              }
            </p>
          </div>

          {/* Crop Type Indicator */}
          <div className="flex gap-4 mb-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              currentCrop === "mobile" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}>
              <DevicePhoneMobileIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{t("mobile")}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              currentCrop === "desktop" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}>
              <ComputerDesktopIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{t("desktop")}</span>
            </div>
          </div>

          {/* Cropper */}
          <div className="w-full flex justify-center">
            <ImageCropper
              ref={cropperRef}
              image={imageSrc}
              aspect={currentCrop === "mobile" ? 3 : 1}
              cropShape="rect"
              onCropComplete={handleCropComplete}
              containerSize={{ 
                width: 400, 
                height: currentCrop === "mobile" ? 133 : 400 
              }}
              showCropButton={false}
              showZoomSlider={true}
              triggerCrop={triggerCrop}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-3">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" 
              onClick={onCancel}
            >
              {t("cancel")}
            </button>
            
            {currentCrop === "desktop" && (
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" 
                onClick={handleSkipDesktop}
              >
                {t("useMobileCrop")}
              </button>
            )}
            
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
              onClick={handleCropClick}
            >
              {currentCrop === "mobile" ? t("nextCrop") : t("finishCrop")}
            </button>
          </div>

          {/* Preview Section */}
          {(mobilePreview || desktopPreview) && (
            <div className="mt-6 w-full">
              <h4 className="text-sm font-medium mb-3">{t("preview")}</h4>
              <div className="flex gap-4 justify-center">
                {mobilePreview && (
                  <div className="text-center">
                    <div className="w-32 h-11 bg-gray-100 rounded overflow-hidden mb-2">
                      <img 
                        src={mobilePreview} 
                        alt="Mobile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600">{t("mobile")}</p>
                  </div>
                )}
                {desktopPreview && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden mb-2">
                      <img 
                        src={desktopPreview} 
                        alt="Desktop preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs text-gray-600">{t("desktop")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 