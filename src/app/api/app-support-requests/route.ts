import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Map UI category types to database enum types
type AppSupportCategory = 'general' | 'technical' | 'billing' | 'bug_report';

function mapCategoryToDbEnum(category: string): AppSupportCategory {
  const categoryMap: Record<string, AppSupportCategory> = {
    'bug': 'bug_report',
    'question': 'general',
    'account': 'technical',
    'billing': 'billing',
    'other': 'general'
  };
  return categoryMap[category] || 'general';
}

// POST - Create a new app support request
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse FormData or JSON
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        business_id: formData.get('business_id'),
        message: formData.get('message'),
        section: formData.get('section'),
        category: formData.get('category'),
      };
    } else {
      body = await request.json();
    }

    const {
      business_id,
      message,
      section,
      category
    } = body;

    // Validation
    if (!message || !section) {
      return NextResponse.json(
        { error: 'Missing required fields: message and section are required' },
        { status: 400 }
      );
    }

    if (message.length < 10 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 5000 characters' },
        { status: 400 }
      );
    }

    // Get the user's business
    let businessToUse = business_id;
    let managerId: string;
    let managerName: string | null = null;

    if (business_id) {
      // Verify that the business exists and the user is the manager
      const business = await prisma.business.findFirst({
        where: { 
          business_id,
          usermanager: {
            email: session.user.email
          }
        },
        include: { 
          usermanager: {
            select: {
              user_id: true,
              name_first: true,
              name_last: true
            }
          }
        }
      });

      if (!business) {
        return NextResponse.json(
          { error: 'Business not found or unauthorized' },
          { status: 404 }
        );
      }
      
      managerId = business.usermanager.user_id;
      managerName = `${business.usermanager.name_first} ${business.usermanager.name_last}`;
    } else {
      // If no business_id provided, get the first business for this user
      const business = await prisma.business.findFirst({
        where: {
          usermanager: {
            email: session.user.email
          }
        },
        include: {
          usermanager: {
            select: {
              user_id: true,
              name_first: true,
              name_last: true
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

      businessToUse = business.business_id;
      managerId = business.usermanager.user_id;
      managerName = `${business.usermanager.name_first} ${business.usermanager.name_last}`;
    }

    // Map category to database enum
    const dbCategory = mapCategoryToDbEnum(category || 'general');

    // Create the app support request
    const supportRequest = await (prisma.appsupportrequest.create as any)({
      data: {
        business_id: businessToUse,
        manager_id: managerId,
        message: message.trim(),
        section: section,
        category: dbCategory,
        status: 'open',
        user_name: managerName,
        user_email: session.user.email
      }
    });

    return NextResponse.json({
      success: true,
      support_request: supportRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating app support request:', error);
    return NextResponse.json(
      { error: 'Failed to create support request' },
      { status: 500 }
    );
  }
}

// GET - Fetch app support requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');

    // Build where clause
    const where: any = {};
    
    // If business_id is provided, filter by it (for user dashboard view)
    if (business_id) {
      where.business_id = business_id;
    }
    
    // Additional filters (for admin view)
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (category) {
      where.category = category;
    }

    // If business_id is provided, use simpler response (for dashboard)
    if (business_id) {
      const supportRequests = await prisma.appsupportrequest.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ]
      });

      return NextResponse.json({
        support_requests: supportRequests
      });
    }

    // Otherwise, return full details (for admin view)
    const requests = await prisma.appsupportrequest.findMany({
      where,
      include: {
        business: {
          select: {
            business_id: true,
            business_name: true,
            business_urlname: true
          }
        },
        usermanager_appsupportrequest_manager_idTousermanager: {
          select: {
            user_id: true,
            name_first: true,
            name_last: true,
            email: true
          }
        },
        appsupportresponse: {
          include: {
            usermanager: {
              select: {
                user_id: true,
                name_first: true,
                name_last: true,
                email: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Error fetching app support requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support requests' },
      { status: 500 }
    );
  }
}
