// src/app/api/booking/submit/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// import nodemailer from 'nodemailer'; // You'll need to install this if using directly

// Placeholder for email sending function (replace with your actual email logic)
async function sendEmail(to, subject, htmlContent) {
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${htmlContent}`);

    // TODO: Implement actual email sending using a service like Nodemailer, SendGrid, etc.
    // Example with Nodemailer (requires setup):
    /*
    let transporter = nodemailer.createTransport({
        host: "smtp.your-email-provider.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // Your SMTP username
            pass: process.env.EMAIL_PASS, // Your SMTP password
        },
    });

    await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_FROM}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: htmlContent, // html body
    });
    */
    return { success: true, message: 'Email sending simulated.' };
}


export async function POST(request) {
    try {
        const { businessEmail, customerEmail, bookingDetails } = await request.json();

        if (!businessEmail || !customerEmail || !bookingDetails) {
            return NextResponse.json({ message: 'Missing required booking details' }, { status: 400 });
        }

        const { service, date, time, customerName, customerPhone, customerMessage } = bookingDetails;

        // 1. Save Booking to Database (Prisma)
        const booking = await prisma.booking.create({
            data: {
                business_id: bookingDetails.businessId, // Make sure businessId is passed from frontend
                service_id: bookingDetails.serviceId, // Make sure serviceId is passed from frontend
                booking_date: new Date(date),
                booking_time_start: time,
                // Calculate booking_time_end from duration_minutes
                booking_time_end: (() => {
                    const [hour, minute] = time.split(':').map(Number);
                    const startDate = new Date(date);
                    startDate.setHours(hour, minute, 0, 0);
                    const endDate = new Date(startDate.getTime() + bookingDetails.serviceDuration * 60 * 1000);
                    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:${String(endDate.getSeconds()).padStart(2, '0')}`;
                })(),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                customer_notes: customerMessage,
                status: 'CONFIRMED', // Or 'PENDING' depending on your flow
                // Add any other required fields for your Booking model
                date_created: new Date(),
                date_update: new Date(),
            },
        });

        // 2. Send Emails
        const formattedDate = new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const bookingSummaryHtml = `
            <h1>Nuova Prenotazione per ${bookingDetails.businessName}</h1>
            <p><strong>Servizio:</strong> ${service}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Ora:</strong> ${time}</p>
            <p><strong>Cliente:</strong> ${customerName}</p>
            <p><strong>Email Cliente:</strong> ${customerEmail}</p>
            <p><strong>Telefono Cliente:</strong> ${customerPhone || 'N/A'}</p>
            <p><strong>Note Cliente:</strong> ${customerMessage || 'N/A'}</p>
            <p>Booking ID: ${booking.booking_id}</p>
        `;

        // Email to Business
        await sendEmail(
            businessEmail,
            `Nuova Prenotazione da ${customerName} per ${service}`,
            bookingSummaryHtml
        );

        // Email to Customer
        const customerConfirmationHtml = `
            <h1>Conferma Prenotazione con ${bookingDetails.businessName}</h1>
            <p>Gentile ${customerName},</p>
            <p>La tua prenotazione è stata confermata:</p>
            <p><strong>Servizio:</strong> ${service}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Ora:</strong> ${time}</p>
            <p>Non vediamo l'ora di vederti!</p>
            <p>Grazie,<br/>Il team di ${bookingDetails.businessName}</p>
        `;
        await sendEmail(
            customerEmail,
            `Conferma Prenotazione con ${bookingDetails.businessName}`,
            customerConfirmationHtml
        );

        return NextResponse.json({ message: 'Booking successful and emails sent', bookingId: booking.booking_id }, { status: 200 });

    } catch (error) {
        console.error('Error submitting booking:', error);
        return NextResponse.json({ error: 'Failed to submit booking', details: error.message }, { status: 500 });
    }
}