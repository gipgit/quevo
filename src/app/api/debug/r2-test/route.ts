import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    // Test R2 client configuration
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Test bucket listing
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_BUSINESS_PUBLIC,
      MaxKeys: 5,
    });

    const listResult = await r2Client.send(listCommand);

    return NextResponse.json({
      message: 'R2 configuration test successful',
      config: {
        endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        hasAccessKeyId: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        hasSecretAccessKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        bucket: process.env.CLOUDFLARE_R2_BUCKET_BUSINESS_PUBLIC,
      },
      bucketContents: listResult.Contents?.slice(0, 5) || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json({
      error: 'R2 configuration test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        hasAccessKeyId: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        hasSecretAccessKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        bucket: process.env.CLOUDFLARE_R2_BUCKET_BUSINESS_PUBLIC,
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
