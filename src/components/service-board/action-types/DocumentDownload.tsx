"use client"

import { useTranslations } from "next-intl"

interface DocumentDownloadDetails {
  document_name: string
  download_url: string
  file_type: string
}

interface Props {
  details: DocumentDownloadDetails
}

export default function DocumentDownload({ details }: Props) {
  const t = useTranslations("ServiceBoard")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-medium">{details.document_name}</h4>
          <p className="text-sm text-gray-500">
            {t("fileType")}: {details.file_type}
          </p>
        </div>
        <a
          href={details.download_url}
          download
          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
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
          {t("download")}
        </a>
      </div>
    </div>
  )
} 