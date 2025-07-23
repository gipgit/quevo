import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import { getPlanLimits } from '@/lib/plan-limit';
import { canCreateMore } from '@/lib/usage-utils';

export const dynamic = 'force-dynamic';

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

      // Check if the access token matches the board_id
      if (accessToken !== serviceBoard.board_id) {
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
    // Fetch business to get manager_id
    const business = await prisma.business.findUnique({
      where: { business_id },
      select: { manager_id: true },
    });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    // Fetch UserManager to get plan_id
    const userManager = await prisma.usermanager.findUnique({
      where: { user_id: business.manager_id },
      select: { plan_id: true },
    });
    if (!userManager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }
    // Get plan limits for actions per board
    const planLimits = await getPlanLimits(userManager.plan_id);
    const planLimitActions = planLimits.find(l => l.feature === 'actions' && l.limit_type === 'count' && l.scope === 'per_board');
    if (!planLimitActions) {
      return NextResponse.json({ error: 'Action per board plan limit not found' }, { status: 403 });
    }
    // Count current actions for this board (not archived)
    const currentActionCount = await prisma.serviceboardaction.count({
      where: {
        board_id: serviceBoard.board_id,
        is_archived: false,
      },
    });
    if (!canCreateMore(currentActionCount, planLimitActions)) {
      return NextResponse.json({ error: 'Action limit reached for this board.' }, { status: 403 });
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