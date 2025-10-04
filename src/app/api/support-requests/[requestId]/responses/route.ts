import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supportRequestId = params.requestId

    // Get the support request to verify access
    const supportRequest = await prisma.servicesupportrequest.findUnique({
      where: {
        support_request_id: supportRequestId
      },
      include: {
        business: {
          select: {
            business_id: true,
            manager_id: true
          }
        }
      }
    })

    if (!supportRequest) {
      return NextResponse.json({ error: 'Support request not found' }, { status: 404 })
    }

    // Verify user has access to this business
    if (supportRequest.business.manager_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get responses for this support request
    const responses = await prisma.servicesupportresponse.findMany({
      where: {
        support_request_id: supportRequestId
      },
      orderBy: {
        sent_at: 'desc'
      }
    })

    return NextResponse.json({ responses })

  } catch (error) {
    console.error('Error fetching support request responses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
