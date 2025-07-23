import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;
    const { password } = await request.json();

    // Find the service board
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id: business_id,
        board_ref: board_ref,
      },
      select: {
        board_id: true,
        is_password_protected: true,
        board_password: true,
      },
    });

    if (!serviceBoard) {
      return NextResponse.json({ error: 'Service board not found' }, { status: 404 });
    }

    if (!serviceBoard.is_password_protected) {
      return NextResponse.json({ error: 'This board is not password protected' }, { status: 400 });
    }

    // Verify password
    if (serviceBoard.board_password !== password) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Set a signed cookie for board access
    cookies().set(`board_access_${board_ref}`, serviceBoard.board_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying service board password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
} 