import React from 'react';
import { PropertyRendererConfig } from '../types';
import { VideoMessageDetails } from '@/types/service-board';
import { VideoPlayer } from '../custom';

type VideoMessageConfigType = Partial<Record<keyof VideoMessageDetails, PropertyRendererConfig>>;

export const videoMessageConfig: VideoMessageConfigType = {
  title: {
    type: 'text',
    priority: 1,
    format: 'heading',
    layout: 'full',
    showLabel: true,
  },
  description: {
    type: 'text',
    priority: 2,
    format: 'default',
    layout: 'full',
    showLabel: true,
    condition: (details: VideoMessageDetails) => Boolean(details.description),
  },
  video_url: {
    type: 'custom',
    priority: 3,
    layout: 'full',
    render: (url: string, config: any, details: VideoMessageDetails): JSX.Element => {
      return (
        <VideoPlayer
          url={url}
          thumbnailUrl={details.thumbnail_url}
          duration={details.length_seconds}
          lastPosition={0}
          requiresFullWatch={false}
        />
      );
    },
  },
  thumbnail_url: {
    type: 'file',
    priority: 4,
    layout: 'full',
    allowPreview: true,
    condition: (details: VideoMessageDetails) => Boolean(details.thumbnail_url),
  },
  length_seconds: {
    type: 'custom',
    priority: 5,
    layout: 'inline',
    render: (duration: number): JSX.Element => {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return (
        <div className="text-sm text-gray-600">
          Duration: {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      );
    },
  },
  is_watched: {
    type: 'status',
    priority: 6,
    layout: 'inline',
    colorMap: {
      false: 'yellow',
      true: 'green',
    },
  },
  transcription: {
    type: 'text',
    priority: 7,
    layout: 'full',
    format: 'default',
    condition: (details: VideoMessageDetails) => Boolean(details.transcription),
  },
  subtitles_url: {
    type: 'file',
    priority: 8,
    layout: 'inline',
    showIcon: true,
    condition: (details: VideoMessageDetails) => Boolean(details.subtitles_url),
  },
  language: {
    type: 'text',
    priority: 9,
    layout: 'inline',
    format: 'default',
    condition: (details: VideoMessageDetails) => Boolean(details.language),
  },
}; 