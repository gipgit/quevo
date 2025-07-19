import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/service-board/actions/[actionId]/tags
export async function GET(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const actionId = params.actionId;

    // Get action with associated tags
    const action = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
      include: {
        serviceboardactiontag: {
          include: {
            userdefinedtag: true,
          },
        },
      },
    });

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Extract tags from the action
    const tags = action.serviceboardactiontag.map(sat => sat.userdefinedtag);

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching action tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/service-board/actions/[actionId]/tags
export async function POST(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const actionId = params.actionId;
    const { tagIds } = await request.json();

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'tagIds must be an array' },
        { status: 400 }
      );
    }

    // Validate action exists
    const action = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
    });

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Validate all tags exist
    const tags = await prisma.userdefinedtag.findMany({
      where: { tag_id: { in: tagIds } },
    });

    if (tags.length !== tagIds.length) {
      return NextResponse.json(
        { error: 'One or more tags not found' },
        { status: 404 }
      );
    }

    // Remove existing tags for this action
    await prisma.serviceboardactiontag.deleteMany({
      where: { action_id: actionId },
    });

    // Add new tags
    if (tagIds.length > 0) {
      await prisma.serviceboardactiontag.createMany({
        data: tagIds.map(tagId => ({
          action_id: actionId,
          tag_id: tagId,
        })),
      });
    }

    // Return updated action with tags
    const updatedAction = await prisma.serviceboardaction.findUnique({
      where: { action_id: actionId },
      include: {
        serviceboardactiontag: {
          include: {
            userdefinedtag: true,
          },
        },
      },
    });

    const updatedTags = updatedAction?.serviceboardactiontag.map(sat => sat.userdefinedtag) || [];

    return NextResponse.json(updatedTags);
  } catch (error) {
    console.error('Error updating action tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 