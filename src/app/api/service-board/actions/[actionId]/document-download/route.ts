import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
  },
})

// Simple in-memory rate limit per IP + action
const downloadCounters = new Map<string, { count: number; ts: number }>()
const LIMIT = 5
const WINDOW_MS = 60_000

export async function POST(req: NextRequest, { params }: { params: { actionId: string } }) {
  try {
    const { actionId } = params
    const { password } = await req.json().catch(() => ({}))

    // Basic rate limit
    const ip = req.headers.get('x-forwarded-for') || 'ip:local'
    const rlKey = `${ip}:${actionId}`
    const now = Date.now()
    const entry = downloadCounters.get(rlKey)
    if (!entry || now - entry.ts > WINDOW_MS) {
      downloadCounters.set(rlKey, { count: 1, ts: now })
    } else {
      if (entry.count >= LIMIT) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
      entry.count += 1
    }

    const action = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
      select: { action_details: true },
    })
    if (!action) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const rawDetails: any = action.action_details as any
    const details = (rawDetails && typeof rawDetails === 'object') ? rawDetails : {}
    const downloadUrl: string | undefined = (details as any).download_url || (details as any).document_file
    if (!downloadUrl) return NextResponse.json({ error: 'Document not available' }, { status: 404 })

    // Optional password protection
    if ((details as any).download_password_hash) {
      if (!password) return NextResponse.json({ error: 'Password required' }, { status: 401 })
      const hashHex = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)).then(buf => Buffer.from(buf).toString('hex'))
      if (hashHex !== (details as any).download_password_hash) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 403 })
      }
    }

    // Parse r2://bucket/key
    if (!downloadUrl.startsWith('r2://')) return NextResponse.json({ error: 'Invalid storage URL' }, { status: 500 })
    const withoutScheme = downloadUrl.replace(/^r2:\/\//, '')
    const firstSlashIdx = withoutScheme.indexOf('/')
    if (firstSlashIdx === -1) {
      console.error('Download URL missing key part', { downloadUrl })
      return NextResponse.json({ error: 'Invalid storage URL (no key)' }, { status: 500 })
    }
    const bucket = withoutScheme.slice(0, firstSlashIdx)
    const objKey = withoutScheme.slice(firstSlashIdx + 1)

    let obj
    try {
      obj = await r2.send(new GetObjectCommand({ Bucket: bucket, Key: objKey }))
    } catch (e) {
      console.error('R2 GetObject error', { bucket, objKey, error: (e as any)?.message || e })
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    const body = await obj.Body?.transformToByteArray()
    if (!body) return NextResponse.json({ error: 'File not found' }, { status: 404 })

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        'Content-Type': obj.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${objKey.split('/').pop() || 'document'}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Document download error', err)
    return NextResponse.json({ error: 'Failed to download' }, { status: 500 })
  }
}


