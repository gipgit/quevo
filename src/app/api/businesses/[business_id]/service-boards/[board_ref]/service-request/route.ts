import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { board_ref: string } }
) {
  try {
    // Get the service board and its request ID
    const serviceBoard = await prisma.serviceboard.findUnique({
      where: { board_ref: params.board_ref },
      select: { request_id: true },
    });

    if (!serviceBoard) {
      return NextResponse.json(
        { error: "Service board not found" },
        { status: 404 }
      );
    }

    if (!serviceBoard.request_id) {
      return NextResponse.json(
        { error: "No service request associated with this board" },
        { status: 404 }
      );
    }

    // Get service request details
    const serviceRequest = await prisma.servicerequest.findUnique({
      where: { request_id: serviceBoard.request_id },
      include: {
        servicerequestselectedserviceitem: {
          include: {
            serviceitem: true,
          },
        },
      },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ serviceRequest });
  } catch (error) {
    console.error("Error fetching service request details:", error);
    return NextResponse.json(
      { error: "Failed to fetch service request details" },
      { status: 500 }
    );
  }
} 