import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { business_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id } = params;

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        business_id,
        manager_id: session.user.id
      },
      include: {
        usermanager: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Fetch service boards with related data
    const serviceBoards = await prisma.serviceboard.findMany({
      where: {
        business_id
      },
      include: {
        servicerequest: {
          include: {
            service: {
              include: {
                servicecategory: true
              }
            }
          }
        },
        usercustomer: {
          select: {
            name_first: true,
            name_last: true,
            email: true
          }
        },
        serviceboardaction: {
          orderBy: {
            created_at: 'desc'
          },
          take: 10
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get plan limits for service boards
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: business.usermanager.plan_id,
        feature: 'boards',
        limit_type: 'count',
        scope: 'global',
      }
    });
    const boardLimit = planLimits[0]?.value ?? 10;

    return NextResponse.json({
      serviceBoards,
      planLimits: {
        maxBoards: boardLimit
      }
    });

  } catch (error) {
    console.error('Error fetching service boards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 