import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/business/[businessId]/tags
export async function GET(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const businessId = params.businessId;

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { business_id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = {
      business_id: businessId,
    };

    if (type && type !== 'all') {
      whereClause.tag_type = type;
    }

    const tags = await prisma.userdefinedtag.findMany({
      where: whereClause,
      orderBy: [
        { tag_type: 'asc' },
        { tag_name: 'asc' }
      ],
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/business/[businessId]/tags
export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId;
    const { tag_name, tag_type } = await request.json();

    // Validate input
    if (!tag_name || !tag_type) {
      return NextResponse.json(
        { error: 'Tag name and type are required' },
        { status: 400 }
      );
    }

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { business_id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if tag already exists for this business and type
    const existingTag = await prisma.userdefinedtag.findFirst({
      where: {
        business_id: businessId,
        tag_type: tag_type,
        tag_name: tag_name,
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists for this business and type' },
        { status: 409 }
      );
    }

    // Create new tag
    const newTag = await prisma.userdefinedtag.create({
      data: {
        business_id: businessId,
        tag_name: tag_name.trim(),
        tag_type: tag_type,
      },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/business/[businessId]/tags
export async function DELETE(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');
    const businessId = params.businessId;

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    // Validate business exists
    const business = await prisma.business.findUnique({
      where: { business_id: businessId },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if tag belongs to this business
    const tag = await prisma.userdefinedtag.findFirst({
      where: {
        tag_id: tagId,
        business_id: businessId,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Delete tag (this will cascade to ServiceBoardActionTag)
    await prisma.userdefinedtag.delete({
      where: { tag_id: tagId },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 