import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { business_id: string; request_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, request_id } = params;
    
    // Verify business ownership or customer access
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        OR: [
          { manager_id: session.user.id },
          {
            servicerequest: {
              some: {
                customer_user_id: session.user.id
              }
            }
          }
        ]
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or access denied" }, { status: 404 });
    }

    // Get specific service request
    const serviceRequest = await prisma.servicerequest.findFirst({
      where: {
        request_id: request_id,
        business_id: business_id,
        ...(session.user.role === 'customer' ? { customer_user_id: session.user.id } : {})
      },
      include: {
        service: {
          select: {
            service_name: true,
            description: true,
            price_base: true
          }
        },
        servicerequestselectedserviceitem: {
          include: {
            serviceitem: {
              select: {
                item_name: true,
                item_description: true,
                price_base: true,
                price_type: true,
                price_unit: true
              }
            }
          }
        }
      }
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    return NextResponse.json({ serviceRequest });
  } catch (error) {
    console.error("Error fetching service request:", error);
    return NextResponse.json({ error: "Failed to fetch service request" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { business_id: string; request_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, request_id } = params;
    const body = await request.json();

    // Verify business ownership (only business managers can update)
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or access denied" }, { status: 404 });
    }

    // Verify service request exists and belongs to business
    const existingRequest = await prisma.servicerequest.findFirst({
      where: {
        request_id: request_id,
        business_id: business_id
      }
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    // Update service request
    const updatedRequest = await prisma.servicerequest.update({
      where: {
        request_id: request_id
      },
      data: {
        status: body.status || existingRequest.status,
        internal_notes: body.internalNotes || existingRequest.internal_notes,
        price_subtotal: body.totalPrice !== undefined ? parseFloat(body.totalPrice) : existingRequest.price_subtotal,
        date_updated: new Date()
      }
    });

    return NextResponse.json({
      message: 'Service request updated successfully!',
      serviceRequest: updatedRequest
    });

  } catch (error) {
    console.error("Error updating service request:", error);
    return NextResponse.json({ error: "Failed to update service request" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { business_id: string; request_id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { business_id, request_id } = params;

    // Verify business ownership (only business managers can delete)
    const business = await prisma.business.findFirst({
      where: {
        business_id: business_id,
        manager_id: session.user.id
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found or access denied" }, { status: 404 });
    }

    // Verify service request exists and belongs to business
    const existingRequest = await prisma.servicerequest.findFirst({
      where: {
        request_id: request_id,
        business_id: business_id
      }
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Service request not found" }, { status: 404 });
    }

    // Delete service request (cascade will handle related records)
    await prisma.servicerequest.delete({
      where: {
        request_id: request_id
      }
    });

    return NextResponse.json({
      message: 'Service request deleted successfully!'
    });

  } catch (error) {
    console.error("Error deleting service request:", error);
    return NextResponse.json({ error: "Failed to delete service request" }, { status: 500 });
  }
} 