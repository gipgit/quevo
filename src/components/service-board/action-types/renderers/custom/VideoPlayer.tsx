import React from 'react';

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string;
  duration: number;
  lastPosition?: number;
  requiresFullWatch?: boolean;
  onProgress?: (position: number) => void;
  onComplete?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnailUrl,
  duration,
  lastPosition,
  requiresFullWatch,
  onProgress,
  onComplete,
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black">
      <div className="relative aspect-video">
        <video
          className="w-full h-full"
          poster={thumbnailUrl}
          controls
          preload="metadata"
          onTimeUpdate={(e) => onProgress?.(e.currentTarget.currentTime)}
          onEnded={() => onComplete?.()}
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {lastPosition && lastPosition > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-sm px-4 py-2">
            Resume from {formatTime(lastPosition)}
          </div>
        )}
        {requiresFullWatch && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
            Full watch required
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {formatTime(duration)}
        </div>
      </div>
    </div>
  );
}; 