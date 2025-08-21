import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // Quotation templates are not currently supported
  return NextResponse.json({ error: 'Quotation templates not supported' }, { status: 501 })
}

export async function GET(request: NextRequest) {
  // Quotation templates are not currently supported
  return NextResponse.json({ templates: [] })
}
