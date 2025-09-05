import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
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
        usermanager: {
          user_id: session.user.id
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found or access denied' }, { status: 404 })
    }

    // Fetch support requests for the business
    const supportRequests = await prisma.servicesupportrequest.findMany({
      where: {
        business_id: business_id
      },
      select: {
        support_request_id: true,
        board_ref: true,
        message: true,
        email: true,
        priority: true,
        category: true,
        status: true,
        assigned_to: true,
        resolution_notes: true,
        created_at: true,
        updated_at: true,
        customer_id: true,
        related_action_id: true,
        // Include customer data
        usercustomer: {
          select: {
            name_first: true,
            name_last: true,
            email: true,
            phone: true
          }
        },
        // Include assigned manager data
        usermanager: {
          select: {
            name_first: true,
            name_last: true,
            email: true
          }
        },
        // Include related service board action
        serviceboardaction: {
          select: {
            action_id: true,
            action_title: true,
            action_type: true,
            action_status: true,
            action_priority: true,
            created_at: true,
            due_date: true,
            is_customer_action_required: true
          }
        },
        // Include attachments
        attachments: {
          select: {
            id: true,
            file_name: true,
            file_path: true,
            created_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json({ supportRequests })

  } catch (error) {
    console.error('Error fetching support requests:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch support requests' 
    }, { status: 500 })
  }
}
