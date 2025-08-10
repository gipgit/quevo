import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cloudflare R2 S3-compatible
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(req: NextRequest, { params }: { params: { actionId: string } }) {
  try {
    const { actionId } = params
    const form = await req.formData()
    const file = form.get('file') as File | null
    const boardRef = form.get('board_ref') as string | null
    const downloadPassword = (form.get('download_password') as string | null) || undefined

    if (!file || !boardRef) {
      return NextResponse.json({ error: 'file and board_ref are required' }, { status: 400 })
    }

    // Basic validation
    const allowed = new Set([
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
    ])
    const maxSize = 10 * 1024 * 1024
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Create object key: {board_ref}/{action_id}/{filename}
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const key = `${boardRef}/${actionId}/${Date.now()}_${safeName}`
    const bucket = process.env.CLOUDFLARE_R2_BUCKET_SERVICE_BOARD_PRIVATE as string

    const arrayBuffer = await file.arrayBuffer()
    const Body = Buffer.from(arrayBuffer)

    const putResult = await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body,
      ContentType: file.type,
    }))
    console.log('R2 PutObject result', { bucket, key, etag: (putResult as any)?.ETag })

    // Build a private URL reference (served later via signed URL or proxy route)
    const downloadUrl = `r2://${bucket}/${key}`

    // Merge into action_details: document_file -> download_url, file_type, document_name
    const current = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
      select: { action_details: true },
    })
    if (!current) return NextResponse.json({ error: 'Action not found' }, { status: 404 })

    const details: any = {
      ...(current.action_details || {}),
      document_name: (current.action_details?.document_title || current.action_details?.document_name || file.name),
      document_file: downloadUrl,
      file_type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : file.type.includes('sheet') || file.type.includes('excel') ? 'xlsx' : 'file',
      download_url: downloadUrl,
    }
    if (downloadPassword) {
      details.download_password_hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(downloadPassword)).then(buf => Buffer.from(buf).toString('hex'))
    }

    const updated = await prisma.serviceboardaction.update({
      where: { action_id: actionId },
      data: { action_details: details },
      select: { action_details: true },
    })

    return NextResponse.json({ action_details: updated.action_details })
  } catch (err) {
    console.error('Document upload error', err)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}


