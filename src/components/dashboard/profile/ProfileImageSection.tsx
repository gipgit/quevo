import React, { useRef, useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import ImageCropper from "./ImageCropper"

interface ProfileImageSectionProps {
  profileImg: string | undefined
  coverImg: string | undefined
  onProfileImgChange?: (file: File, previewUrl: string) => void
  onCoverImgChange?: (file: File, previewUrl: string) => void
}

export default function ProfileImageSection({ profileImg, coverImg, onProfileImgChange, onCoverImgChange }: ProfileImageSectionProps) {
  const t = useTranslations("profile")
  const [profileCropSrc, setProfileCropSrc] = useState<string | null>(null)
  const [coverCropSrc, setCoverCropSrc] = useState<string | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Always show current images from props unless a new preview is set
  useEffect(() => {
    setProfilePreview(null)
    setCoverPreview(null)
  }, [profileImg, coverImg])

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileCropSrc(URL.createObjectURL(file))
    }
  }
  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverCropSrc(URL.createObjectURL(file))
    }
  }

  const handleProfileCrop = (blob: Blob, previewUrl: string) => {
    setProfilePreview(previewUrl)
    if (onProfileImgChange) {
      const file = new File([blob], "profile.webp", { type: "image/webp" })
      onProfileImgChange(file, previewUrl)
    }
  }
  const handleCoverCrop = (blob: Blob, previewUrl: string) => {
    setCoverPreview(previewUrl)
    if (onCoverImgChange) {
      const file = new File([blob], "cover.webp", { type: "image/webp" })
      onCoverImgChange(file, previewUrl)
    }
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("images.title")}</h3>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-2 relative">
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
              className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow"
              onClick={() => profileInputRef.current?.click()}
            >
              ✏️
            </button>
          </div>
          <span className="text-sm text-gray-700">{t("images.profile")}</span>
          {profileCropSrc && (
            <div className="mt-2">
              <ImageCropper
                image={profileCropSrc}
                aspect={1}
                cropShape="round"
                containerSize={{ width: 200, height: 200 }}
                onCropComplete={handleProfileCrop}
              />
              <button className="mt-2 text-xs text-red-500" onClick={() => setProfileCropSrc(null)}>
                {t("images.cancel")}
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="w-64 h-32 rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
            <img
              src={coverPreview || coverImg || "/placeholder-cover.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={coverInputRef}
              onChange={handleCoverFile}
            />
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow"
              onClick={() => coverInputRef.current?.click()}
            >
              ✏️
            </button>
          </div>
          <span className="text-sm text-gray-700">{t("images.cover")}</span>
          {coverCropSrc && (
            <div className="mt-2">
              <ImageCropper
                image={coverCropSrc}
                aspect={3 / 1}
                cropShape="rect"
                containerSize={{ width: 320, height: 120 }}
                onCropComplete={handleCoverCrop}
              />
              <button className="mt-2 text-xs text-red-500" onClick={() => setCoverCropSrc(null)}>
                {t("images.cancel")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
