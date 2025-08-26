import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      business_id,
      board_ref,
      customer_id,
      message,
      related_action_id,
      email,
      priority,
      category
    } = body;

    // Validation
    if (!business_id || !board_ref || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, board_ref, and message are required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['general', 'technical', 'account'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Verify that the business exists
    const business = await prisma.business.findUnique({
      where: { business_id },
      select: { business_id: true }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Verify that the service board exists
    const serviceBoard = await prisma.serviceboard.findFirst({
      where: {
        business_id,
        board_ref
      },
      select: { board_id: true }
    });

    if (!serviceBoard) {
      return NextResponse.json(
        { error: 'Service board not found' },
        { status: 404 }
      );
    }

    // If related_action_id is provided, verify it exists
    if (related_action_id) {
      const action = await prisma.serviceboardaction.findUnique({
        where: { action_id: related_action_id },
        select: { action_id: true }
      });

      if (!action) {
        return NextResponse.json(
          { error: 'Related action not found' },
          { status: 404 }
        );
      }
    }

    // Create the support request
    const supportRequest = await prisma.servicesupportrequest.create({
      data: {
        business_id,
        board_ref,
        customer_id: customer_id || null,
        message: message.trim(),
        related_action_id: related_action_id || null,
        email: email ? email.trim() : null,
        priority: null, // Set to null as priority is handled by business
        category,
        status: 'open'
      }
    });

    return NextResponse.json({
      success: true,
      support_request: supportRequest
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating support request:', error);
    return NextResponse.json(
      { error: 'Failed to create support request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');
    const board_ref = searchParams.get('board_ref');
    const status = searchParams.get('status');

    if (!business_id) {
      return NextResponse.json(
        { error: 'business_id is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = { business_id };
    
    if (board_ref) {
      where.board_ref = board_ref;
    }
    
    if (status) {
      where.status = status;
    }

    const supportRequests = await prisma.servicesupportrequest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { created_at: 'desc' }
      ]
      // TODO: Uncomment after Prisma client is regenerated
      // include: {
      //   serviceboardaction: {
      //     select: {
      //       action_id: true,
      //       action_title: true,
      //       action_type: true
      //     }
      //   }
      // }
    });

    return NextResponse.json({
      support_requests: supportRequests
    });

  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support requests' },
      { status: 500 }
    );
  }
}
