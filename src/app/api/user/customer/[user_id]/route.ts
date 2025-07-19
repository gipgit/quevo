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

    // Verify the user is requesting their own data or is a manager
    if (session.user.id !== user_id && session.user.role !== 'manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customer = await prisma.usercustomer.findUnique({
      where: { user_id },
      select: {
        user_id: true,
        email: true,
        name_first: true,
        name_last: true,
        phone: true,
        active: true
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);

  } catch (error) {
    console.error('Error fetching customer data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 