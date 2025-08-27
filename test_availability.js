const fetch = require('node-fetch');

async function testAvailability() {
    const businessId = 'e1f2a3b4-c5d6-7e8f-9a0b-1c2d3e4f5a6b';
    const eventId = '20';
    const startDate = '2025-01-01T00:00:00.000Z';
    const endDate = '2025-01-31T23:59:59.999Z';
    const duration = '60';

    console.log('Testing availability API...');
    console.log(`Business ID: ${businessId}`);
    console.log(`Event ID: ${eventId}`);
    console.log(`Date range: ${startDate} to ${endDate}`);

    try {
        const response = await fetch(
            `http://localhost:3000/api/businesses/${businessId}/availability/overview?startDate=${startDate}&endDate=${endDate}&duration=${duration}&eventId=${eventId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('\nAPI Response:');
        console.log(JSON.stringify(data, null, 2));

        // Check if any Saturdays are included
        const saturdays = data.availableDates.filter(date => {
            const dayOfWeek = new Date(date).getDay();
            return dayOfWeek === 6; // Saturday
        });

        if (saturdays.length > 0) {
            console.log('\n❌ PROBLEM: Saturdays found in available dates:');
            saturdays.forEach(date => console.log(`  - ${date} (Saturday)`));
        } else {
            console.log('\n✅ SUCCESS: No Saturdays found in available dates');
        }

        // Show all available dates
        console.log('\nAll available dates:');
        data.availableDates.forEach(date => {
            const dayOfWeek = new Date(date).getDay();
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            console.log(`  - ${date} (${dayNames[dayOfWeek]})`);
        });

    } catch (error) {
        console.error('Error testing availability:', error);
    }
}

testAvailability();
