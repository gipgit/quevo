
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH - Update an app support request (status, priority, etc.)
export async function PATCH(
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
    const { status, priority, resolution_notes } = body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (status) {
      updateData.status = status;
    }
    if (priority) {
      updateData.priority = priority;
    }
    if (resolution_notes !== undefined) {
      updateData.resolution_notes = resolution_notes;
    }

    const updatedRequest = await (prisma.appsupportrequest.update as any)({
      where: { support_request_id: supportRequestId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Error updating app support request:', error);
    return NextResponse.json(
      { error: 'Failed to update support request' },
      { status: 500 }
    );
  }
}
