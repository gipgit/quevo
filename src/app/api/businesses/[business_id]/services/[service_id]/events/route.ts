import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request, 
  { params }: { params: { business_id: string; service_id: string } }
) {
  try {
    const { business_id, service_id } = params

    // Verify the service exists and belongs to the business
    const service = await prisma.service.findFirst({
      where: {
        service_id: parseInt(service_id),
        business_id: business_id,
        is_active: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Fetch events for this service that have availability
    const events = await prisma.serviceevent.findMany({
      where: {
        service_id: parseInt(service_id),
        is_active: true,
        // Only include events that have at least one availability slot
        serviceeventavailability: {
          some: {}
        }
      },
      include: {
        serviceeventavailability: {
          select: {
            availability_id: true,
            day_of_week: true,
            time_start: true,
            time_end: true,
            is_recurring: true,
            date_effective_from: true,
            date_effective_to: true,
          },
          orderBy: {
            day_of_week: 'asc'
          }
        }
      },
      orderBy: {
        display_order: 'asc'
      }
    })

    // Filter out events that have no availability after the query
    const eventsWithAvailability = events.filter(event => event.serviceeventavailability.length > 0)

    return NextResponse.json({ 
      events: eventsWithAvailability.map(event => ({
        event_id: event.event_id,
        event_title: event.event_name,
        event_description: event.event_description,
        event_type: event.event_type,
        duration_minutes: event.duration_minutes,
        buffer_minutes: event.buffer_minutes,
        availability_count: event.serviceeventavailability.length
      }))
    })

  } catch (error) {
    console.error("Error fetching service events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
