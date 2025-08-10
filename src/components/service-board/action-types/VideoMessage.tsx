import { useState } from "react"
import { useTranslations } from "next-intl"
import { VideoMessageDetails } from "@/types/service-board"

interface Props {
  details: VideoMessageDetails
  onUpdate: () => void
}

export default function VideoMessage({ details, onUpdate }: Props) {
  const t = useTranslations("ServiceBoard")
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasWatched, setHasWatched] = useState(!!details.is_watched)

  const handleVideoEnd = async () => {
    if (!hasWatched) {
      try {
        const response = await fetch(`/api/service-board/video-message/mark-watched`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: details.message_id,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to mark video as watched')
        }

        setHasWatched(true)
        onUpdate()
      } catch (error) {
        console.error('Error marking video as watched:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        {details.title && (
          <h3 className="text-lg font-medium text-gray-900">
            {details.title}
          </h3>
        )}
        {details.description && (
          <p className="mt-1 text-sm text-gray-600">
            {details.description}
          </p>
        )}
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
        <video
          src={details.video_url || ''}
          poster={details.thumbnail_url}
          controls
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnd}
        >
          {details.subtitles_url && (
            <track
              kind="captions"
              src={details.subtitles_url}
              srcLang={details.language || 'en'}
              label={details.language || 'English'}
              default
            />
          )}
          {t('yourBrowserDoesNotSupportVideo')}
        </video>

        {!isPlaying && !hasWatched && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const video = document.querySelector('video')
                if (video) video.play()
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {t('playVideo')}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-500">
          <svg className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          {hasWatched ? t('watched') : t('notWatchedYet')}
        </div>
        {typeof details.length_seconds === 'number' && (
          <div className="text-gray-500">
            {t('duration')}: {new Date(details.length_seconds * 1000).toISOString().substr(11, 8)}
          </div>
        )}
      </div>

      {details.transcription && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Transcript</h4>
          <div className="prose prose-sm max-w-none">
            {details.transcription}
          </div>
        </div>
      )}

      {details.related_files && details.related_files.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Related Files</h4>
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {details.related_files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 flex-1 w-0 truncate text-sm text-gray-500">
                    {file.name}
                  </span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 