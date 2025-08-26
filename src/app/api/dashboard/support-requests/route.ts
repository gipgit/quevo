import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      business_id,
      message
    } = body;

    // Validation
    if (!business_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id and message are required' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Verify that the business exists and the user is the manager
    const business = await prisma.business.findFirst({
      where: { 
        business_id,
        usermanager: {
          email: session.user.email
        }
      },
      select: { 
        business_id: true,
        usermanager: {
          select: {
            user_id: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the app support request
    const supportRequest = await prisma.appsupportrequest.create({
      data: {
        business_id,
        manager_id: business.usermanager.user_id,
        message: message.trim(),
        priority: 'medium', // Default priority
        category: 'general', // Default category
        status: 'open'
      }
    });

    return NextResponse.json({
      success: true,
      support_request: supportRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating app support request:', error);
    return NextResponse.json(
      { error: 'Failed to create support request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const status = searchParams.get('status');

    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required' },
        { status: 400 }
      );
    }

    // Build where clause - only get app support requests
    const where: any = { 
      business_id
    };
    
    if (status) {
      where.status = status;
    }

    const supportRequests = await prisma.appsupportrequest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json({
      support_requests: supportRequests
    });

  } catch (error) {
    console.error('Error fetching app support requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support requests' },
      { status: 500 }
    );
  }
}
