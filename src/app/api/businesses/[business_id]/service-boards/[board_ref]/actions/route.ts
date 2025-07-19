import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { auth } from '@/lib/auth';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-fallback-secret';

export async function GET(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;

    // First, verify that the service board exists and belongs to the business
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        is_password_protected: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }

    // Check if board is password protected
    if (serviceBoard.is_password_protected) {
      const accessToken = cookies().get(`board_access_${board_ref}`)?.value;
      
      if (!accessToken) {
        return NextResponse.json({ error: 'Password required', requiresPassword: true }, { status: 401 });
      }

      try {
        // Verify the token
        const decoded = verify(accessToken, JWT_SECRET) as { board_id: string };
        if (decoded.board_id !== serviceBoard.board_id) {
          return NextResponse.json({ error: 'Invalid access token', requiresPassword: true }, { status: 401 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'Invalid access token', requiresPassword: true }, { status: 401 });
      }
    }

    // Fetch all non-archived actions for this board with their tags
    const actions = await prisma.serviceboardaction.findMany({
      where: {
        board_id: serviceBoard.board_id,
        is_archived: false,
      },
      include: {
        serviceboardactiontag: {
          include: {
            userdefinedtag: true,
          },
        },
      },
      orderBy: [
        { due_date: 'asc' },
        { created_at: 'desc' }
      ],
    });

    // Transform the data to include tags directly on each action
    const actionsWithTags = actions.map(action => ({
      ...action,
      tags: action.serviceboardactiontag.map(sat => sat.userdefinedtag),
    }));

    return NextResponse.json(actionsWithTags);
  } catch (error) {
    console.error('Error fetching service board actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service board actions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;
    const body = await request.json();
    const { action_type, action_details, action_title, action_description } = body;

    // Verify user session
    // const session = await auth();
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Verify that the service board exists and belongs to the business
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        customer_id: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }

    // Create the new action
    const newAction = await prisma.serviceboardaction.create({
      data: {
        board_id: serviceBoard.board_id,
        customer_id: serviceBoard.customer_id,
        action_type: action_type,
        action_title: action_title || 'Nuova azione',
        action_description: action_description || 'Descrizione azione',
        action_details: action_details,
        action_status: 'pending',
        is_customer_action_required: true,
        is_archived: false,
      },
    });

    return NextResponse.json(newAction, { status: 201 });
  } catch (error) {
    console.error('Error creating service board action:', error);
    return NextResponse.json(
      { error: 'Failed to create service board action' },
      { status: 500 }
    );
  }
} 