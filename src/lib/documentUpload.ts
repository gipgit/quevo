import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export type DocumentUploadType = 'signature_request' | 'document_download' | 'contract';

export interface ProcessAndSaveDocumentOptions {
  buffer: Buffer;
  filename: string;
  businessId: string;
  actionType: DocumentUploadType;
  actionId?: string; // Optional action ID for better organization
  boardRef?: string; // Optional board reference for service board context
}

export interface DocumentUploadResult {
  path: string;
  publicPath?: string; // Only for public uploads
  signedUrl?: string; // For private uploads
  size: number;
}

function getBucketName(uploadType: DocumentUploadType): string {
  switch (uploadType) {
    case 'signature_request':
    case 'document_download':
    case 'contract':
      return process.env.CLOUDFLARE_R2_BUCKET_SERVICE_BOARD_PRIVATE!;
    default:
      throw new Error(`Invalid upload type: ${uploadType}`);
  }
}

function generateDocumentPath(businessId: string, filename: string, actionType: DocumentUploadType, actionId?: string, boardRef?: string): string {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const extension = filename.split('.').pop() || 'pdf';
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // If both actionId and boardRef are provided, create the most organized structure
  if (actionId && boardRef) {
    return `documents/${businessId}/${boardRef}/${actionType}/${actionId}/${timestamp}_${randomId}_${sanitizedFilename}`;
  }
  
  // If only actionId is provided (for backward compatibility)
  if (actionId) {
    return `documents/${businessId}/${actionType}/${actionId}/${timestamp}_${randomId}_${sanitizedFilename}`;
  }
  
  // If only boardRef is provided (for service board context without actionId)
  if (boardRef) {
    return `documents/${businessId}/${boardRef}/${actionType}/${timestamp}_${randomId}_${sanitizedFilename}`;
  }
  
  // Fallback to old structure for backward compatibility
  return `documents/${businessId}/${actionType}/${timestamp}_${randomId}_${sanitizedFilename}`;
}

export async function processAndSaveDocument(options: ProcessAndSaveDocumentOptions): Promise<DocumentUploadResult> {
  const { buffer, filename, businessId, actionType, actionId, boardRef } = options;
  
  const bucketName = getBucketName(actionType);
  const documentPath = generateDocumentPath(businessId, filename, actionType, actionId, boardRef);
  
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: documentPath,
    Body: buffer,
    ContentType: getContentType(filename),
    Metadata: {
      'business-id': businessId,
      'board-ref': boardRef || '',
      'action-type': actionType,
      'action-id': actionId || '',
      'original-filename': filename,
      'uploaded-at': new Date().toISOString(),
    },
  });

  await s3Client.send(command);

  // Generate signed URL for private access
  const signedUrlCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: documentPath,
  });

  const signedUrl = await getSignedUrl(s3Client, signedUrlCommand, { expiresIn: 3600 }); // 1 hour

  return {
    path: documentPath,
    signedUrl,
    size: buffer.length,
  };
}

function getContentType(filename: string): string {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'doc':
      return 'application/msword';
    case 'xls':
      return 'application/vnd.ms-excel';
    default:
      return 'application/octet-stream';
  }
}

export async function getDocumentSignedUrl(documentPath: string, actionType: DocumentUploadType): Promise<string> {
  const bucketName = getBucketName(actionType);
  
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: documentPath,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
}
