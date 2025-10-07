import React, { useRef, useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Pencil as PencilIcon } from 'lucide-react'
import ImageCropper from "./ImageCropper"
import dynamic from "next/dynamic"

const DualCoverCropper = dynamic(() => import("../../onboarding-steps/dual-cover-cropper").then(mod => ({ default: mod.default })), { ssr: false })

interface ProfileImageSectionProps {
  profileImg: string | undefined
  coverImgMobile: string | undefined
  coverImgDesktop: string | undefined
  onProfileImgChange?: (file: File, previewUrl: string) => void
  onCoverImgChange?: (mobileFile: File, desktopFile: File, mobilePreviewUrl: string, desktopPreviewUrl: string) => void
  onPreviewsReady?: (clearPreviews: () => void) => void
}

export default function ProfileImageSection({ profileImg, coverImgMobile, coverImgDesktop, onProfileImgChange, onCoverImgChange }: ProfileImageSectionProps) {
  const t = useTranslations("profile")
  const [profileCropSrc, setProfileCropSrc] = useState<string | null>(null)
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverDesktopPreview, setCoverDesktopPreview] = useState<string | null>(null)
  const [profileCropperOpen, setProfileCropperOpen] = useState(false)
  const [coverCropperOpen, setCoverCropperOpen] = useState(false)
  const [triggerCrop, setTriggerCrop] = useState(false)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Don't clear previews automatically - let them persist until explicitly cleared
  // This prevents the desktop preview from disappearing after cropping
  
  // Temporarily disabled to fix runtime error
  // useEffect(() => {
  //   if (onPreviewsReady && typeof onPreviewsReady === 'function') {
  //     onPreviewsReady(clearPreviews)
  //   }
  // }, [onPreviewsReady, clearPreviews])

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileCropSrc(e.target?.result as string)
        setProfileCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverCropSrc(e.target?.result as string)
        setCoverCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileCrop = (blob: Blob, previewUrl: string) => {
    setProfilePreview(previewUrl)
    if (onProfileImgChange) {
      const file = new File([blob], "profile.webp", { type: "image/webp" })
      onProfileImgChange(file, previewUrl)
    }
    setProfileCropperOpen(false)
    setProfileCropSrc(null)
  }

  const handleCoverCrop = (mobileBlob: Blob, desktopBlob: Blob, mobilePreview: string, desktopPreview: string) => {
    setCoverPreview(mobilePreview)
    setCoverDesktopPreview(desktopPreview)
    if (onCoverImgChange) {
      // For API compatibility, only pass the mobile file (system will generate desktop version)
      const mobileFile = new File([mobileBlob], "cover.webp", { type: "image/webp" })
      const desktopFile = new File([desktopBlob], "cover-desktop.webp", { type: "image/webp" })
      onCoverImgChange(mobileFile, desktopFile, mobilePreview, desktopPreview)
    }
    setCoverCropperOpen(false)
    setCoverCropSrc(null)
  }

  // Function to clear previews when images are successfully saved
  const clearPreviews = useCallback(() => {
    setProfilePreview(null)
    setCoverPreview(null)
    setCoverDesktopPreview(null)
  }, [])

  const handleProfileCropperCancel = () => {
    setProfileCropperOpen(false)
    setProfileCropSrc(null)
  }

  const handleCoverCropperCancel = () => {
    setCoverCropperOpen(false)
    setCoverCropSrc(null)
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
    <div className="p-6">
      {/* Cover Image Section */}
      <div className="flex flex-col items-center mb-8">
        <span className="text-xs text-gray-600 mb-4">{t("images.cover")}</span>
        
        {/* Cover Previews Container */}
        <div className="relative w-full">
          <div className="flex gap-4">
            {/* Cover Mobile Preview */}
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1 text-center">Mobile Cover</p>
              <div className="w-full h-24 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={coverPreview || coverImgMobile || "/placeholder-cover.svg"} 
                  alt="Mobile cover" 
                  className="w-full h-full object-cover rounded-lg" 
                />
              </div>
            </div>
            
            {/* Cover Desktop Preview */}
            <div className="flex-shrink-0">
              <p className="text-xs text-gray-600 mb-1 text-center">Desktop Cover</p>
              <div className="w-24 h-24 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={coverDesktopPreview || coverImgDesktop || "/placeholder-cover.svg"} 
                  alt="Desktop cover" 
                  className="w-full h-full object-cover rounded-lg" 
                />
              </div>
            </div>
          </div>
          
          {/* Edit Button */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={coverInputRef}
            onChange={handleCoverFile}
          />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow hover:bg-gray-50 border border-gray-200"
            onClick={() => coverInputRef.current?.click()}
          >
            <PencilIcon className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Profile Image Section - Centered */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-2 relative">
            <img
              src={profilePreview || profileImg || "/placeholder-profile.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={profileInputRef}
              onChange={handleProfileFile}
            />
            <button
              type="button"
              className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow hover:bg-gray-50 border border-gray-200"
              onClick={() => profileInputRef.current?.click()}
            >
              <PencilIcon className="w-3 h-3 text-gray-600" />
            </button>
          </div>
          <span className="text-xs text-gray-600">{t("images.profile")}</span>
        </div>
      </div>

      {/* Profile Cropper Modal */}
      {profileCropperOpen && profileCropSrc && (
        <div className="fixed inset-0 top-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-4">Crop Profile Image</h3>
              <ImageCropper
                image={profileCropSrc}
                aspect={1}
                cropShape="round"
                containerSize={{ width: 350, height: 350 }}
                onCropComplete={handleProfileCrop}
                showCropButton={false}
                showZoomSlider={true}
                triggerCrop={triggerCrop}
              />
              <div className="mt-4 flex justify-center gap-3">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" 
                  onClick={handleProfileCropperCancel}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
                  onClick={handleCropClick}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Cropper Modal */}
      {coverCropperOpen && coverCropSrc && (
        <DualCoverCropper
          imageSrc={coverCropSrc}
          onCropComplete={handleCoverCrop}
          onCancel={handleCoverCropperCancel}
        />
      )}
    </div>
  )
}
