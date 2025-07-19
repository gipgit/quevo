// src/app/api/user/[userId]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This route fetches a specific user's data by their user_id
export const dynamic = 'force-dynamic'; // Ensures this route is not cached

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  try {
    // Fetch the user manager data, and include their associated plan details
    const user = await prisma.usermanager.findUnique({
      where: { user_id: userId },
      include: {
        plan: true, // Include the related Plan object
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user details.' }, { status: 500 });
  }
}
