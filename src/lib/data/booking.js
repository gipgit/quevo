// src/lib/data/booking.js

import prisma from '@/lib/prisma';

/**
 * Fetches booking details by booking reference, including associated service requirements,
 * questions, and customer responses.
 * @param {string} bookingReference The unique booking reference.
 * @returns {Promise<Object | null>} The booking details or null if not found.
 */
export async function getBookingByReference(bookingReference) {
    console.log(`[getBookingByReference] Attempting to fetch booking with reference: ${bookingReference}`);
    try {
        const booking = await prisma.booking.findUnique({
            where: {
                booking_reference: bookingReference,
            },
            select: {
                booking_id: true,
                booking_date: true,
                booking_time_start: true,
                booking_time_end: true,
                price_subtotal: true,
                status: true,
                booking_reference: true,
                customer_name: true,
                customer_email: true,
                customer_phone: true,
                customer_notes: true,
                customer_user_id: true,
                service: {
                    select: {
                        service_name: true,
                        duration_minutes: true,
                        price_base: true,
                        date_selection: true, // <--- ADDED: Include date_selection
                    },
                },
                business: {
                    select: {
                        business_name: true,
                        business_urlname: true,
                        business_email: true,
                        business_public_uuid: true, // Needed for cover image path
                    },
                },
                // Include service-specific requirements and their responses
                bookingrequirementresponse: {
                    select: {
                        booking_requirement_response_id: true,
                        customer_confirmed: true,
                        servicerequirementblock: { // Include the linked requirement block details
                            select: {
                                requirement_block_id: true,
                                title: true,
                                requirements_text: true,
                            },
                        },
                    },
                    orderBy: {
                        servicerequirementblock: { // Order by the original block's ID or a display order if available
                            requirement_block_id: 'asc',
                        },
                    },
                },
                // Include service-specific question responses (open_text, media_upload)
                bookingquestionresponse: {
                    select: {
                        booking_question_response_id: true,
                        response_text: true,
                        media_url: true,
                        servicequestion: { // Include the linked question details
                            select: {
                                question_id: true,
                                question_text: true,
                                question_type: true,
                                display_order: true, // Important for sorting
                            },
                        },
                    },
                    orderBy: {
                        servicequestion: { // Order by the original question's display order
                            display_order: 'asc',
                        },
                    },
                },
                // Include service-specific checkbox option responses
                bookingquestioncheckboxoptionresponse: {
                    select: {
                        booking_checkbox_option_id: true,
                        servicequestion: { // Include the linked question details
                            select: {
                                question_id: true,
                                question_text: true,
                                question_type: true,
                                display_order: true, // Important for sorting
                            },
                        },
                        servicequestionoption: { // Include the linked option details
                            select: {
                                option_id: true,
                                option_text: true,
                                display_order: true, // Important for sorting
                            },
                        },
                    },
                    orderBy: {
                        servicequestion: { // Order by the original question's display order
                            display_order: 'asc',
                        },
                    },
                },
                // <--- ADDED: Include selected service items
                bookingselectedserviceitem: {
                    select: {
                        service_item_id: true,
                        quantity: true,
                        price_at_booking: true,
                        serviceitem: { // Include details of the selected service item
                            select: {
                                item_name: true,
                                price_type: true,
                                price_unit: true
                            }
                        }
                    }
                }
                // END ADDED
            },
        });

        if (!booking) {
            console.log(`[getBookingByReference] Booking with reference ${bookingReference} not found.`);
            return null;
        }

        // Serialize Decimal 'price_subtotal' and 'service.price' to numbers for client-side consumption
        const serializedBooking = {
            ...booking,
            price_subtotal: booking.price_subtotal ? booking.price_subtotal.toNumber() : null,
            service: {
                ...booking.service,
                price: booking.service.price ? booking.service.price.toNumber() : null,
            },
            // <--- ADDED: Serialize price_at_booking for each selected service item
            bookingselectedserviceitem: booking.bookingselectedserviceitem.map(item => ({
                ...item,
                price_at_booking: item.price_at_booking ? item.price_at_booking.toNumber() : null,
            })),
            // END ADDED
        };

        console.log(`[getBookingByReference] Successfully fetched booking:`, serializedBooking);
        return serializedBooking;

    } catch (error) {
        console.error(`[getBookingByReference] Error fetching booking by reference ${bookingReference}:`, error);
        return null;
    }
}


/**
 * Fetches all messages for a specific booking.
 * @param {string} bookingId The UUID of the booking.
 * @returns {Promise<Array<Object>>} An array of booking messages.
 */
export async function getBookingMessages(bookingId) {
    console.log(`[getBookingMessages] Fetching messages for booking ID: ${bookingId}`);
    try {
        const messages = await prisma.bookingmessage.findMany({ // Corrected model name
            where: { booking_id: bookingId },
            orderBy: { sent_at: 'asc' },
        });
        console.log(`[getBookingMessages] Found ${messages.length} messages for booking ID: ${bookingId}`);
        return messages;
    } catch (error) {
        console.error(`[getBookingMessages] Error fetching messages for booking ID ${bookingId}:`, error);
        return [];
    }
}

/**
 * Fetches the status history for a specific booking.
 * @param {string} bookingId The UUID of the booking.
 * @returns {Promise<Array<Object>>} An array of booking status history entries.
 */
export async function getBookingStatusHistory(bookingId) {
    console.log(`[getBookingStatusHistory] Fetching status history for booking ID: ${bookingId}`);
    try {
        const history = await prisma.bookingstatushistory.findMany({ // Corrected model name
            where: { booking_id: bookingId },
            orderBy: { changed_at: 'asc' },
        });
        console.log(`[getBookingStatusHistory] Found ${history.length} status history entries for booking ID: ${bookingId}`);
        return history;
    } catch (error) {
        console.error(`[getBookingStatusHistory] Error fetching status history for booking ID ${bookingId}:`, error);
        return [];
    }
}
