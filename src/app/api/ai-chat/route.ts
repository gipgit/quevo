import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { message, businessUrlname, context, requestType } = await request.json();

    if (!message || !businessUrlname) {
      return NextResponse.json(
        { error: 'Message and business URL are required' },
        { status: 400 }
      );
    }

    // Only handle availability requests - static data should be cached on client
    if (requestType === 'availability') {
      // First, let's test if we can get basic business data
      const business = await prisma.business.findUnique({
        where: { business_urlname: businessUrlname },
        select: {
          business_id: true,
          business_name: true
        }
      });

      if (!business) {
        return NextResponse.json({
          content: 'Business non trovato.',
          data: null,
          type: 'text'
        });
      }

      // Now get services with availability data using a simpler approach
      const services = await prisma.service.findMany({
        where: {
          business_id: business.business_id,
          is_active: true,
          available_booking: true
        },
        select: {
          service_id: true,
          service_name: true,
          description: true,
          duration_minutes: true,
          available_booking: true
        }
      });

      if (services.length === 0) {
        return NextResponse.json({
          content: 'Al momento non abbiamo servizi con disponibilità prenotabile. Contattaci direttamente per verificare la disponibilità.',
          data: null,
          type: 'text'
        });
      }

      // Get ServiceEvents for each service
      const servicesWithEvents = await Promise.all(
        services.map(async (service) => {
          try {
            const events = await (prisma as any).serviceevent.findMany({
              where: {
                service_id: service.service_id,
                is_active: true
              },
              select: {
                event_id: true,
                event_name: true,
                event_description: true,
                event_type: true,
                duration_minutes: true,
                buffer_minutes: true,
                is_required: true,
                display_order: true,
                is_active: true
              },
              orderBy: { display_order: 'asc' }
            });

            // Get availability for each event
            const eventsWithAvailability = await Promise.all(
              events.map(async (event: any) => {
                try {
                  const availability = await (prisma as any).serviceeventavailability.findMany({
                    where: {
                      event_id: event.event_id,
                      is_recurring: true
                    },
                    select: {
                      availability_id: true,
                      day_of_week: true,
                      time_start: true,
                      time_end: true,
                      is_recurring: true,
                      date_effective_from: true,
                      date_effective_to: true
                    }
                  });

                  return {
                    ...event,
                    serviceeventavailability: availability
                  };
                } catch (error) {
                  console.error(`Error fetching availability for event ${event.event_id}:`, error);
                  return {
                    ...event,
                    serviceeventavailability: []
                  };
                }
              })
            );

            return {
              ...service,
              serviceevent: eventsWithAvailability
            };
          } catch (error) {
            console.error(`Error fetching events for service ${service.service_id}:`, error);
            return {
              ...service,
              serviceevent: []
            };
          }
        })
      );

      const availableServices = servicesWithEvents;
      
      if (availableServices.length === 0) {
        return NextResponse.json({
          content: 'Al momento non abbiamo servizi con disponibilità prenotabile. Contattaci direttamente per verificare la disponibilità.',
          data: null,
          type: 'text'
        });
      }

      return NextResponse.json({
        content: 'Perfetto! Ecco i servizi per cui puoi controllare la disponibilità. Scegli un servizio per vedere gli eventi disponibili.',
        data: { 
          type: 'availability_service_selection', 
          services: availableServices 
        },
        type: 'availability_service_selection'
      });
    }

    // For all other requests, return a simple response indicating to use cached data
    return NextResponse.json({
      content: 'Utilizzando i dati in cache per una risposta più veloce.',
      data: { type: 'use_cached_data' },
      type: 'use_cached_data'
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
