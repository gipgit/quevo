"use client"

import { useTranslations } from "next-intl"
import { useState } from 'react'

interface DocumentDownloadDetails {
  document_name: string
  download_url: string
  file_type: string
}

interface Props {
  details: DocumentDownloadDetails
  action_id: string
}

export default function DocumentDownload({ details, action_id }: Props) {
  const t = useTranslations("ServiceBoard")
  const [password, setPassword] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeLower = (details.file_type || 'file').toLowerCase()
  const typeLabel = (details.file_type || 'file').toUpperCase()
  const typeClasses = 'bg-transparent border border-gray-300 text-gray-700'

  const handleSecureDownload = async () => {
    setIsDownloading(true)
    setError(null)
    try {
      const resp = await fetch(`/api/service-board/actions/${action_id}/document-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || undefined }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'Download failed')
      }
      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = details.document_name || 'document'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="bg-gradient-to-b from-white to-blue-100/50 border border-gray-200 rounded-2xl p-4 flex-1">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0">
            <span className={`inline-flex items-center px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-lg text-xs font-medium flex-shrink-0 ${typeClasses}`}>
              {typeLabel}
            </span>
            <h4 className="text-sm lg:text-xl font-bold text-gray-900 truncate">
              {details.document_name || t('document')}
            </h4>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {Boolean((details as any).download_password_hash) && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('enterPassword')}
              className="px-2 py-1 text-sm border border-gray-300 rounded sm:flex-shrink-0"
            />
          )}
          <button
            onClick={handleSecureDownload}
            disabled={isDownloading}
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-b from-blue-100 to-blue-200 text-blue-800 rounded-lg hover:from-blue-200 hover:to-blue-300 transition-all disabled:opacity-50 w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {isDownloading ? t('downloading') : t("download")}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
} 