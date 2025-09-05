import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId } = params
    const { status } = await request.json()

    // Get the support request and verify access
    const supportRequest = await prisma.servicesupportrequest.findFirst({
      where: {
        support_request_id: requestId
      },
      include: {
        business: {
          include: {
            usermanager: true
          }
        }
      }
    })

    if (!supportRequest) {
      return NextResponse.json({ error: 'Support request not found' }, { status: 404 })
    }

    // Verify user has access to this business
    if (supportRequest.business.usermanager.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the support request status
    const updatedRequest = await prisma.servicesupportrequest.update({
      where: {
        support_request_id: requestId
      },
      data: {
        status: status || 'resolved',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ 
      request: updatedRequest,
      message: 'Support request status updated successfully'
    })

  } catch (error) {
    console.error('Error updating support request status:', error)
    return NextResponse.json({ 
      error: 'Failed to update support request status' 
    }, { status: 500 })
  }
}
