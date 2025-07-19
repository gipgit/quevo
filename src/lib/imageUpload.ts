import { mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export interface ProcessAndSaveImageOptions {
  buffer: Buffer;
  uploadDir: string;
  filename: string;
  width: number;
  height: number;
  quality?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  maxSizeBytes?: number;
}

export async function processAndSaveImage({
  buffer,
  uploadDir,
  filename,
  width,
  height,
  quality = 80,
  fit = 'cover',
  maxSizeBytes = 1024 * 1024, // 1MB
}: ProcessAndSaveImageOptions) {
  await mkdir(uploadDir, { recursive: true });
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

  const filepath = join(uploadDir, filename);
  await sharp(outputBuffer).toFile(filepath);
  return {
    path: filepath,
    publicPath: filepath.replace(process.cwd() + '/public', ''),
    size: outputBuffer.length,
    quality: currentQuality,
  };
}
