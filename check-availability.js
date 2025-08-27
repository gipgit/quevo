const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAvailability() {
  try {
    console.log('Checking availability for event_id=20...\n');
    
    // Check the event details
    const event = await prisma.serviceevent.findUnique({
      where: { event_id: 20 },
      select: {
        event_id: true,
        event_name: true,
        service_id: true,
        duration_minutes: true,
        buffer_minutes: true,
        is_active: true,
        service: {
          select: {
            business_id: true
          }
        }
      }
    });
    
    console.log('Event details:', event);
    
    if (!event) {
      console.log('Event not found!');
      return;
    }
    
    const businessId = event.service.business_id;
    console.log('Business ID:', businessId);
    
    // Check availability records for this event
    const availabilities = await prisma.serviceeventavailability.findMany({
      where: { event_id: 20 },
      select: {
        availability_id: true,
        day_of_week: true,
        time_start: true,
        time_end: true,
        is_recurring: true,
        date_effective_from: true,
        date_effective_to: true
      },
      orderBy: { day_of_week: 'asc' }
    });
    
    console.log('\nAvailability records for event_id=20:');
    availabilities.forEach(avail => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log(`- Day ${avail.day_of_week} (${dayNames[avail.day_of_week]}): ${avail.time_start.toTimeString().slice(0,5)} - ${avail.time_end.toTimeString().slice(0,5)}`);
      console.log(`  Recurring: ${avail.is_recurring}, Effective from: ${avail.date_effective_from}, To: ${avail.date_effective_to}`);
    });
    
    // Check if there are any availability records for Saturday (day_of_week = 6)
    const saturdayAvailabilities = availabilities.filter(avail => avail.day_of_week === 6);
    console.log(`\nSaturday availabilities found: ${saturdayAvailabilities.length}`);
    
    // Check all availability records for the business (not just the event)
    const businessAvailabilities = await prisma.serviceeventavailability.findMany({
      where: { business_id: businessId },
      select: {
        availability_id: true,
        event_id: true,
        day_of_week: true,
        time_start: true,
        time_end: true,
        is_recurring: true
      },
      orderBy: [{ day_of_week: 'asc' }, { event_id: 'asc' }]
    });
    
    console.log('\nAll availability records for the business:');
    businessAvailabilities.forEach(avail => {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      console.log(`- Event ${avail.event_id}, Day ${avail.day_of_week} (${dayNames[avail.day_of_week]}): ${avail.time_start.toTimeString().slice(0,5)} - ${avail.time_end.toTimeString().slice(0,5)}`);
    });
    
    // Check if there are any Saturday availabilities for the business
    const businessSaturdayAvailabilities = businessAvailabilities.filter(avail => avail.day_of_week === 6);
    console.log(`\nBusiness Saturday availabilities found: ${businessSaturdayAvailabilities.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAvailability();
