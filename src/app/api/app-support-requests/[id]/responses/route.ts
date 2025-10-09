import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Add a response to an app support request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supportRequestId = params.id;
    const body = await request.json();
    const { message } = body;

    // Validation
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the user's manager account
    const manager = await prisma.usermanager.findUnique({
      where: { email: session.user.email },
      select: { user_id: true }
    });

    if (!manager) {
      return NextResponse.json(
        { error: 'Manager account not found' },
        { status: 404 }
      );
    }

    // Verify the support request exists
    const supportRequest = await prisma.appsupportrequest.findUnique({
      where: { support_request_id: supportRequestId },
      select: { support_request_id: true }
    });

    if (!supportRequest) {
      return NextResponse.json(
        { error: 'Support request not found' },
        { status: 404 }
      );
    }

    // Create the response
    const response = await (prisma.appsupportresponse.create as any)({
      data: {
        support_request_id: supportRequestId,
        user_id: manager.user_id,
        message: message.trim()
      },
      include: {
        usermanager: {
          select: {
            user_id: true,
            name_first: true,
            name_last: true,
            email: true
          }
        }
      }
    });

    // Update the support request status to in_progress if it's open
    await prisma.appsupportrequest.update({
      where: { support_request_id: supportRequestId },
      data: {
        status: 'in_progress',
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      response
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding response:', error);
    return NextResponse.json(
      { error: 'Failed to add response' },
      { status: 500 }
    );
  }
}

// GET - Fetch all responses for an app support request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supportRequestId = params.id;

    const responses = await prisma.appsupportresponse.findMany({
      where: { support_request_id: supportRequestId },
      include: {
        usermanager: {
          select: {
            user_id: true,
            name_first: true,
            name_last: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      responses
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
