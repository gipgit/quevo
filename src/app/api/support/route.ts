import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getCurrentBusinessIdFromCookie } from '@/lib/server-business-utils'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { message: 'You must be logged in to submit a support request' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    
    const category = formData.get('category') as string
    const section = formData.get('section') as string
    const priority = formData.get('priority') as string
    const subject = formData.get('subject') as string
    const description = formData.get('description') as string
    const screenshot = formData.get('screenshot') as File | null

    // Validate required fields
    if (!category || !section || !subject || !description) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user manager info
    const userManager = await prisma.usermanager.findFirst({
      where: { user_id: session.user.id },
      select: {
        user_id: true,
        name_first: true,
        name_last: true,
        email: true
      }
    })

    if (!userManager) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Get current business ID
    const currentBusinessId = getCurrentBusinessIdFromCookie()
    
    if (!currentBusinessId) {
      // If no business selected, get the first business of the user
      const firstBusiness = await prisma.business.findFirst({
        where: {
          usermanager: {
            user_id: session.user.id
          }
        },
        select: {
          business_id: true
        }
      })
      
      if (!firstBusiness) {
        return NextResponse.json(
          { message: 'No business found for user' },
          { status: 404 }
        )
      }
    }

    const businessId = currentBusinessId || (await prisma.business.findFirst({
      where: { usermanager: { user_id: session.user.id } },
      select: { business_id: true }
    }))?.business_id

    if (!businessId) {
      return NextResponse.json(
        { message: 'Business not found' },
        { status: 404 }
      )
    }

    // Map frontend category to database enum
    const categoryMap: Record<string, string> = {
      'bug': 'bug_report',
      'feature': 'feature_request',
      'question': 'general',
      'account': 'general',
      'billing': 'billing',
      'other': 'general'
    }

    const dbCategory = categoryMap[category] || 'general'

    // Handle screenshot upload if present
    let screenshotUrl: string | null = null
    if (screenshot && screenshot.size > 0) {
      // TODO: Implement screenshot upload to R2/S3
      // For now, store the filename
      screenshotUrl = screenshot.name
    }

    // Create support request in database with new schema
    const supportRequest = await prisma.appsupportrequest.create({
      data: {
        business_id: businessId,
        manager_id: userManager.user_id,
        subject: subject,
        message: description,
        section: section,
        category: dbCategory as any,
        priority: priority as any,
        status: 'open',
        user_name: `${userManager.name_first} ${userManager.name_last}`.trim(),
        user_email: userManager.email || '',
        screenshot_url: screenshotUrl,
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    // TODO: Send notification email to support team

    return NextResponse.json({
      message: 'Support request submitted successfully',
      requestId: supportRequest.support_request_id
    })
  } catch (error) {
    console.error('Error creating support request:', error)
    return NextResponse.json(
      { message: 'Failed to submit support request. Please try again.' },
      { status: 500 }
    )
  }
}
