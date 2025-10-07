'use client'

import { useState, useEffect } from "react"
import { X as XMarkIcon, Globe2 as GlobeAltIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface ShareProfileModalProps {
  isOpen: boolean
  onClose: () => void
  businessUrlname: string
  businessName?: string
}

export default function ShareProfileModal({ 
  isOpen, 
  onClose, 
  businessUrlname, 
  businessName 
}: ShareProfileModalProps) {
  const [DOMAIN, setDOMAIN] = useState("https://quevo.vercel.app")
  const [copied, setCopied] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Set the correct domain after component mounts
  useEffect(() => {
    const isLocalhost = window.location.hostname.includes("localhost")
    setDOMAIN(isLocalhost ? "http://localhost:3000" : "https://quevo.vercel.app")
  }, [])
  
  // Public link format: DOMAIN/business_urlname
  const publicUrl = `${DOMAIN}/${businessUrlname || ""}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setIsAnimating(true)
      setTimeout(() => setCopied(false), 2000)
      setTimeout(() => setIsAnimating(false), 300)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleOpen = () => {
    window.open(`${publicUrl}`, "_blank")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="max-w-md w-full rounded-lg shadow-xl bg-[var(--dashboard-bg-card)] text-[var(--dashboard-text-primary)]">
        <div className="flex items-center justify-between py-4 px-6 border-b border-[var(--dashboard-border-primary)]">
          <h3 className="text-base font-normal">Share Business Link</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors text-[var(--dashboard-text-secondary)] hover:text-[var(--dashboard-text-primary)] hover:bg-[var(--dashboard-bg-tertiary)]"
          >
            <XMarkIcon className="h-5 w-5" strokeWidth={1} />
          </button>
        </div>
        <div className="p-4 md:p-6">
          {businessName && (
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold text-[var(--dashboard-text-primary)]">{businessName}</p>
            </div>
          )}
          
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-lg border border-[var(--dashboard-border-primary)]">
              <QRCodeSVG
                value={publicUrl}
                size={120}
                bgColor="white"
                fgColor="black"
                level="M"
              />
            </div>
          </div>
          
          <div className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-3 shadow-sm border mb-4 bg-gradient-to-r from-[var(--dashboard-bg-tertiary)] to-[var(--dashboard-bg-secondary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] transition-all duration-300 relative overflow-hidden ${
            isAnimating ? 'animate-pill-shine' : ''
          }`}>
            <GlobeAltIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" strokeWidth={1} />
            <span className="text-xs md:text-sm break-all">{publicUrl}</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all duration-300 flex items-center justify-center gap-2 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)] ${
                copied ? 'text-green-600 border-green-200 bg-green-50' : ''
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
            <button
              onClick={handleOpen}
              className="flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 bg-[var(--dashboard-bg-tertiary)] text-[var(--dashboard-text-secondary)] border-[var(--dashboard-border-primary)] hover:bg-[var(--dashboard-bg-secondary)] hover:text-[var(--dashboard-text-primary)]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Open</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
