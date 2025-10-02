import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch all status updates
export async function GET() {
  try {
    const statusUpdates = await prisma.appstatusupdates.findMany({
      where: {
        is_public: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ statusUpdates });
  } catch (error) {
    console.error('Error fetching status updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status updates' },
      { status: 500 }
    );
  }
}

// POST - Create new status update
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      title,
      status,
      category,
      description,
      tags,
      affected_components,
      release_version,
      is_public,
      priority
    } = body;

    // Handle arrays by taking the first selected value
    const statusValue = Array.isArray(status) ? status[0] : status;
    const categoryValue = Array.isArray(category) ? category[0] : category;
    const priorityValue = Array.isArray(priority) ? priority[0] : priority;

    // Validate required fields
    if (!title || !statusValue || !categoryValue) {
      return NextResponse.json(
        { error: 'Title, status, and category are required' },
        { status: 400 }
      );
    }

    // Create new status update
    const newStatusUpdate = await prisma.appstatusupdates.create({
      data: {
        title,
        status: statusValue,
        category: categoryValue,
        description: description || null,
        tags: tags || [],
        affected_components: affected_components || null,
        release_version: release_version || null,
        is_public: is_public !== undefined ? is_public : true,
        priority: priorityValue ? parseInt(priorityValue.toString()) : null,
        created_at: new Date(),
        last_updated: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      statusUpdate: newStatusUpdate 
    });
  } catch (error) {
    console.error('Error creating status update:', error);
    return NextResponse.json(
      { error: 'Failed to create status update' },
      { status: 500 }
    );
  }
}

