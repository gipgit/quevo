import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string; action_id: string } }
) {
  try {
    const { business_id, board_ref, action_id } = params;

    // Verify that the service board exists and belongs to the business
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }

    // Fetch the specific action
    const action = await prisma.serviceboardaction.findFirst({
      where: {
        action_id: action_id,
        board_id: serviceBoard.board_id,
      },
    });

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error fetching service board action:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service board action' },
      { status: 500 }
    );
  }
}
