"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { BusinessFormData } from "../business-onboarding-form"
import dynamic from "next/dynamic"
import type { ImageCropperRef } from "@/components/dashboard/profile/ImageCropper"

const ImageCropper = dynamic(() => import("@/components/dashboard/profile/ImageCropper").then(mod => ({ default: mod.default })), { ssr: false })

interface ImageUploadStepProps {
  formData: BusinessFormData
  updateFormData: (updates: Partial<BusinessFormData>) => void
  onValidationChange: (isValid: boolean) => void
}

export default function ImageUploadStep({ formData, updateFormData, onValidationChange }: ImageUploadStepProps) {
  const t = useTranslations("BusinessOnboarding")
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [cropperOpen, setCropperOpen] = useState<null | "profile" | "cover">(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [triggerCrop, setTriggerCrop] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // This step is always valid since images are optional
    onValidationChange(true)
  }, [onValidationChange])

  const handleImageChange = (type: "profile" | "cover", file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCropImageSrc(e.target?.result as string)
        setCropperOpen(type)
      }
      reader.readAsDataURL(file)
      // Save the file temporarily for cropping
    } else {
      if (type === "profile") {
        updateFormData({ profile_image: null })
        setProfilePreview(null)
      } else {
        updateFormData({ cover_image: null })
        setCoverPreview(null)
      }
    }
  }

  const handleCropComplete = (type: "profile" | "cover") => async (croppedBlob: Blob, previewUrl: string) => {
    const croppedFile = new File([croppedBlob], `${type}.webp`, { type: "image/webp" })
    if (type === "profile") {
      updateFormData({ profile_image: croppedFile })
      setProfilePreview(previewUrl)
    } else {
      updateFormData({ cover_image: croppedFile })
      setCoverPreview(previewUrl)
    }
    setCropperOpen(null)
    setCropImageSrc(null)
    setTriggerCrop(false)
  }

  const removeImage = (type: "profile" | "cover") => {
    handleImageChange(type, null)
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

  return (
    <div className="space-y-8">
      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{t("profilePhoto")}</label>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
              {profilePreview ? (
                <img src={profilePreview || "/placeholder.svg"} alt="Profile preview" className="w-full h-full object-cover rounded-full" />
              ) : (
                <PhotoIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            {profilePreview && (
              <button onClick={() => removeImage("profile")} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div>
            <input type="file" id="profile-image" accept="image/*" onChange={(e) => handleImageChange("profile", e.target.files?.[0] || null)} className="hidden" />
            <label htmlFor="profile-image" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              {t("uploadProfilePhoto")}
            </label>
            <p className="text-xs text-gray-500 mt-1">{t("imageFormatInfo")}</p>
          </div>
        </div>
      </div>
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">{t("coverImage")}</label>
        <div className="space-y-4">
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {coverPreview ? (
                <img src={coverPreview || "/placeholder.svg"} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{t("coverImagePlaceholder")}</p>
                </div>
              )}
            </div>
            {coverPreview && (
              <button onClick={() => removeImage("cover")} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div>
            <input type="file" id="cover-image" accept="image/*" onChange={(e) => handleImageChange("cover", e.target.files?.[0] || null)} className="hidden" />
            <label htmlFor="cover-image" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              {t("uploadCoverImage")}
            </label>
            <p className="text-xs text-gray-500 mt-1">{t("coverImageFormatInfo")}</p>
          </div>
        </div>
      </div>
      {/* Cropper Modal */}
      {cropperOpen && cropImageSrc && (
        <div className="fixed inset-0 top-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex flex-col items-center">
              <ImageCropper
                image={cropImageSrc}
                aspect={cropperOpen === "profile" ? 1 : 3}
                cropShape={cropperOpen === "profile" ? "round" : "rect"}
                onCropComplete={handleCropComplete(cropperOpen)}
                containerSize={{ width: 350, height: cropperOpen === "profile" ? 350 : 180 }}
                showCropButton={false}
                showZoomSlider={true}
                triggerCrop={triggerCrop}
              />
              <div className="mt-4 flex justify-center gap-3">
                <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setCropperOpen(null); setCropImageSrc(null); }}>{t("cancel")}</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleCropClick}>{t("Common.confirm")}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}