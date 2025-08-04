import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export type UploadType = 'business' | 'service-board' | 'customer';

export interface ProcessAndSaveImageOptions {
  buffer: Buffer;
  filename: string;
  width: number;
  height: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  maxSizeBytes?: number;
  businessId: string;
  uploadType: UploadType;
  serviceBoardId?: string; // For service board uploads
  customerId?: string; // For customer uploads
}

export interface UploadResult {
  path: string;
  publicPath?: string; // Only for public uploads
  signedUrl?: string; // For private uploads
  size: number;
  quality: number;
}

function getBucketName(uploadType: UploadType): string {
  switch (uploadType) {
    case 'business':
      return process.env.CLOUDFLARE_R2_BUCKET_BUSINESS_PUBLIC!;
    case 'service-board':
      return process.env.CLOUDFLARE_R2_BUCKET_SERVICE_BOARD_PRIVATE!;
    case 'customer':
      return process.env.CLOUDFLARE_R2_BUCKET_CUSTOMER_UPLOADS_PRIVATE!;
    default:
      throw new Error(`Invalid upload type: ${uploadType}`);
  }
}

function generateKey(uploadType: UploadType, businessId: string, filename: string, serviceBoardId?: string, customerId?: string): string {
  switch (uploadType) {
    case 'business':
      return `business/${businessId}/${filename}`;
    case 'service-board':
      if (!serviceBoardId) throw new Error('serviceBoardId required for service board uploads');
      return `service-board/${businessId}/${serviceBoardId}/${filename}`;
    case 'customer':
      if (!customerId) throw new Error('customerId required for customer uploads');
      return `customer-uploads/${businessId}/${customerId}/${filename}`;
    default:
      throw new Error(`Invalid upload type: ${uploadType}`);
  }
}

export async function processAndSaveImage({
  buffer,
  filename,
  width,
  height,
  quality = 80,
  fit = 'cover',
  maxSizeBytes = 1024 * 1024, // 1MB
  businessId,
  uploadType,
  serviceBoardId,
  customerId,
}: ProcessAndSaveImageOptions): Promise<UploadResult> {
  // Process image with Sharp
  let outputBuffer = await sharp(buffer)
    .resize(width, height, { fit })
    .webp({ quality })
    .toBuffer();

  // If >1MB, reduce quality and re-encode
  let currentQuality = quality;
  while (outputBuffer.length > maxSizeBytes && currentQuality > 40) {
    currentQuality -= 10;
    outputBuffer = await sharp(buffer)
      .resize(width, height, { fit })
      .webp({ quality: currentQuality })
      .toBuffer();
  }

  const bucketName = getBucketName(uploadType);
  const key = generateKey(uploadType, businessId, filename, serviceBoardId, customerId);
  
  // Upload to Cloudflare R2
  const uploadCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: outputBuffer,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });

  try {
    await r2Client.send(uploadCommand);
    
    let publicPath: string | undefined;
    let signedUrl: string | undefined;

    // Handle different access patterns
    if (uploadType === 'business') {
      // Public access - use custom domain if available
      const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;
      if (publicDomain) {
        publicPath = `${publicDomain}/${key}`;
      } else {
        // Fallback to R2 endpoint (less ideal)
        publicPath = `${process.env.CLOUDFLARE_R2_ENDPOINT}/${bucketName}/${key}`;
      }
    } else {
      // Private access - generate signed URL
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      signedUrl = await getSignedUrl(r2Client, getCommand, { expiresIn: 3600 }); // 1 hour
    }
    
    return {
      path: key,
      publicPath,
      signedUrl,
      size: outputBuffer.length,
      quality: currentQuality,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload image to cloud storage');
  }
}

export async function deleteImageFromR2(key: string, uploadType: UploadType) {
  if (!key) return;
  
  const bucketName = getBucketName(uploadType);
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await r2Client.send(deleteCommand);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    // Don't throw error for deletion failures
  }
}

export async function getSignedUrlForPrivateFile(key: string, uploadType: UploadType, expiresIn: number = 3600): Promise<string> {
  const bucketName = getBucketName(uploadType);
  const getCommand = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, getCommand, { expiresIn });
}

// Helper functions for different upload types
export async function uploadBusinessImage(
  buffer: Buffer,
  businessId: string,
  filename: string,
  options: Partial<ProcessAndSaveImageOptions> = {}
): Promise<UploadResult> {
  return processAndSaveImage({
    buffer,
    filename,
    width: 400,
    height: 400,
    quality: 80,
    fit: 'cover',
    maxSizeBytes: 1024 * 1024,
    businessId,
    uploadType: 'business',
    ...options,
  });
}

export async function uploadServiceBoardMedia(
  buffer: Buffer,
  businessId: string,
  serviceBoardId: string,
  filename: string,
  options: Partial<ProcessAndSaveImageOptions> = {}
): Promise<UploadResult> {
  return processAndSaveImage({
    buffer,
    filename,
    width: 800,
    height: 600,
    quality: 80,
    fit: 'inside',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB for service board media
    businessId,
    uploadType: 'service-board',
    serviceBoardId,
    ...options,
  });
}

export async function uploadCustomerMedia(
  buffer: Buffer,
  businessId: string,
  customerId: string,
  filename: string,
  options: Partial<ProcessAndSaveImageOptions> = {}
): Promise<UploadResult> {
  return processAndSaveImage({
    buffer,
    filename,
    width: 800,
    height: 600,
    quality: 80,
    fit: 'inside',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB for customer uploads
    businessId,
    uploadType: 'customer',
    customerId,
    ...options,
  });
}
