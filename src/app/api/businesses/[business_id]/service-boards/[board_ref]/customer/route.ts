import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { board_ref: string } }
) {
  try {
    // Get the service board and its customer ID
    const serviceBoard = await prisma.serviceboard.findUnique({
      where: { board_ref: params.board_ref },
      select: { customer_id: true },
    });

    if (!serviceBoard) {
      return NextResponse.json(
        { error: "Service board not found" },
        { status: 404 }
      );
    }

    // Get customer details
    const customer = await prisma.usercustomer.findUnique({
      where: { user_id: serviceBoard.customer_id },
      select: {
        user_id: true,
        email: true,
        name_first: true,
        name_last: true,
        phone: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Error fetching customer details:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer details" },
      { status: 500 }
    );
  }
} 