import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = params;

    // Verify the user is requesting their own data
    if (session.user.id !== user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const manager = await prisma.usermanager.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        email: true,
        name_first: true,
        name_last: true,
        tel: true,
        active: true
      }
    });

    if (!manager) {
      return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
    }

    return NextResponse.json(manager);

  } catch (error) {
    console.error('Error fetching manager data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 