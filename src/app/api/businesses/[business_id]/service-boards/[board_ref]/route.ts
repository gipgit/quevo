import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { business_id: string; board_ref: string } }
) {
  try {
    const { business_id, board_ref } = params;

    // Find the board with basic public information and linked service request
    const board = await prisma.serviceboard.findFirst({
      where: {
        board_ref,
        business: {
          business_id
        }
      },
      select: {
        board_id: true,
        board_title: true,
        board_description: true,
        status: true,
        created_at: true,
        updated_at: true,
        is_password_protected: true,
        customer_id: true,
        service_id: true,
        request_id: true,
        service: {
          select: {
            service_id: true,
            service_name: true,
            description: true,
            duration_minutes: true
          }
        },
        business: {
          select: {
            business_id: true,
            business_name: true,
            business_urlname: true
          }
        },
        servicerequest: {
          select: {
            request_id: true,
            request_reference: true,
            customer_name: true,
            customer_email: true,
            customer_phone: true,
            customer_notes: true,
            status: true,
            price_subtotal: true,
            request_datetimes: true,
            date_created: true,
            date_updated: true,
            selected_service_items_snapshot: true,
            question_responses_snapshot: true,
            requirement_responses_snapshot: true,
            event_id: true,
            serviceevent: {
              select: {
                event_id: true,
                event_name: true,
                event_description: true
              }
            }
          }
        }
      }
    });

    if (!board) {
      return NextResponse.json({ error: "Service board not found" }, { status: 404 });
    }

    // If board is password protected, don't return sensitive data
    if (board.is_password_protected) {
      return NextResponse.json({
        board_id: board.board_id,
        is_password_protected: true
      });
    }

    return NextResponse.json({ board });
  } catch (error) {
    console.error("Error fetching service board:", error);
    return NextResponse.json({ error: "Failed to fetch service board" }, { status: 500 });
  }
} 