import Image from 'next/image';
import { getServiceCoverImageUrl } from '@/lib/serviceUtils';

interface ServiceImageDisplayProps {
  businessPublicUuid: string | null;
  serviceId: string | number;
  serviceName: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ServiceImageDisplay({
  businessPublicUuid,
  serviceId,
  serviceName,
  className = '',
  width = 800,
  height = 450,
}: ServiceImageDisplayProps) {
  const imageUrl = getServiceCoverImageUrl(businessPublicUuid, serviceId);

  if (!imageUrl) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={`Cover image for ${serviceName}`}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      onError={(e) => {
        // Fallback if image doesn't exist
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.nextElementSibling?.classList.remove('hidden');
      }}
    />
  );
}
