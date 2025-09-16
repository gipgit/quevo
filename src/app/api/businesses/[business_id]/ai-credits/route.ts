import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AICreditsManager } from '@/lib/ai-credits-manager'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { business_id } = params

    // Verify user has access to this business
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
    }

      // Get AI credits status
      const creditsStatus = await AICreditsManager.getCreditsStatus(business_id)
      const featureCosts = AICreditsManager.getAllFeatureCosts()

    return NextResponse.json({
      success: true,
      data: {
        creditsStatus,
        featureCosts
      }
    })
  } catch (error) {
    console.error('Error getting AI credits status:', error)
    return NextResponse.json(
      { error: 'Failed to get AI credits status' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { business_id } = params
    const body = await request.json()
    const { amount, description } = body

    // Verify user has access to this business
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
    }

    // Add credits (admin function)
    const success = await AICreditsManager.addCredits(
      business_id,
      amount,
      'purchase',
      description || 'Credit addition'
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 }
      )
    }

    // Get updated status
      const creditsStatus = await AICreditsManager.getCreditsStatus(business_id)

    return NextResponse.json({
      success: true,
      data: {
        creditsStatus,
        message: `Successfully added ${amount} credits`
      }
    })
  } catch (error) {
    console.error('Error adding AI credits:', error)
    return NextResponse.json(
      { error: 'Failed to add AI credits' },
      { status: 500 }
    )
  }
}