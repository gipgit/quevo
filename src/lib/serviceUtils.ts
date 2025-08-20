import { getServiceImageUrl } from './imageUpload';

/**
 * Get the public URL for a service's cover image
 * @param businessPublicUuid - The business's public UUID
 * @param serviceId - The service ID
 * @returns The public URL for the service image, or null if no image exists
 */
export function getServiceCoverImageUrl(businessPublicUuid: string | null, serviceId: string | number): string | null {
  if (!businessPublicUuid) {
    return null;
  }
  
  return getServiceImageUrl(businessPublicUuid, serviceId);
}

/**
 * Check if a service has a cover image
 * Since we don't store the path in the database, we assume an image exists
 * if the business has a public UUID (which is required for image uploads)
 * @param businessPublicUuid - The business's public UUID
 * @returns True if the service likely has an image
 */
export function hasServiceCoverImage(businessPublicUuid: string | null): boolean {
  return !!businessPublicUuid;
}
