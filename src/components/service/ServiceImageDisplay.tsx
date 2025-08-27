"use client"

import React from 'react'

interface ServiceImageDisplayProps {
  serviceId: string
  serviceName: string
  demo: boolean | null
  hasImage: boolean | null
  businessPublicUuid: string
  className?: string
  showDemoBadge?: boolean
}

export default function ServiceImageDisplay({
  serviceId,
  serviceName,
  demo,
  hasImage,
  businessPublicUuid,
  className = "",
  showDemoBadge = true
}: ServiceImageDisplayProps) {
  
  // If has_image is false, show fallback instead of trying to fetch image
  if (hasImage === false) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center rounded-lg ${className}`}>
        <div className="text-gray-500 text-sm text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          No Image
        </div>
      </div>
    )
  }
  
  const getImageUrl = (): string | null => {
    if (!serviceId || !businessPublicUuid) return null
    
    if (demo) {
      // Local path for demo services
      return `/uploads/business/${businessPublicUuid}/service/${serviceId}.webp`
    } else {
      // R2 path for production services
      const publicDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN
      if (publicDomain) {
        return `${publicDomain}/business/${businessPublicUuid}/service/${serviceId}.webp`
      } else {
        // Fallback to R2 endpoint
        const accountId = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ACCOUNT_ID
        return `https://${accountId}.r2.cloudflarestorage.com/business/${businessPublicUuid}/service/${serviceId}.webp`
      }
    }
  }

  const imageUrl = getImageUrl()
  
  if (!imageUrl) return null

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={serviceName}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Hide the image if it fails to load
          e.currentTarget.style.display = 'none'
        }}
      />
      {showDemoBadge && demo && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
          Demo
        </div>
      )}
    </div>
  )
}
