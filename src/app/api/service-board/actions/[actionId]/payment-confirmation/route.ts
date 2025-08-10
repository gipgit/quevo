import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { actionId: string } }) {
  try {
    const { actionId } = params
    const body = await req.json()
    const { method_used, note, confirmed_at } = body as { method_used: string; note?: string; confirmed_at?: string }

    if (!method_used) {
      return NextResponse.json({ error: 'method_used is required' }, { status: 400 })
    }

    // Read current details to merge rather than overwrite JSON
    const current = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
      select: { action_details: true },
    })

    if (!current) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 })
    }

    const declaredAt = new Date().toISOString()
    const confirmation: any = {
      declared_at: declaredAt,
      method_used,
      ...(note ? { note } : {}),
    }
    if (confirmed_at) {
      // If client sent a date-only, store as paid_date; else as confirmed_at
      if (/^\d{4}-\d{2}-\d{2}$/.test(confirmed_at)) {
        confirmation.paid_date = confirmed_at
      } else {
        confirmation.confirmed_at = confirmed_at
      }
    }

    const mergedDetails = {
      ...(current.action_details || {}),
      payment_declared_confirmed: true,
      payment_confirmation: confirmation,
    }

    const updated = await prisma.serviceboardaction.update({
      where: { action_id: actionId },
      data: {
        action_details: mergedDetails,
      },
      select: { action_details: true },
    })

    return NextResponse.json({ action_details: updated.action_details })
  } catch (error: any) {
    console.error('Payment confirmation error', error)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}


