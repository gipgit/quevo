import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Fetch user's business plan
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's business with plan information
    const business = await prisma.business.findFirst({
      where: {
        usermanager: {
          email: session.user.email
        }
      },
      include: {
        plan: {
          select: {
            plan_name: true,
            plan_id: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No business found for user' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      planName: business.plan.plan_name,
      planId: business.plan.plan_id
    });

  } catch (error) {
    console.error('Error fetching business plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business plan' },
      { status: 500 }
    );
  }
}

