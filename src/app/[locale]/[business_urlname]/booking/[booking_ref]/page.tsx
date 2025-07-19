import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBookingByReference, getBookingMessages, getBookingStatusHistory } from '@/lib/data/booking';
import { getBusinessProfileLeanData } from '@/lib/data/business-profile';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import * as locales from 'date-fns/locale';
import { adjustColor } from '@/lib/utils/colors';
import type { Booking } from '@/types/booking';

interface BookingConfirmationPageParams {
    locale: string;
    business_urlname: string;
    booking_ref: string;
}


export async function generateMetadata({ params }: { params: BookingConfirmationPageParams }) {
    const t = await getTranslations('Booking');
    return {
        title: `${t('bookingConfirmedTitle')} | Quevo`,
        description: t('bookingConfirmationDescription'),
    };
}

export default async function BookingConfirmationPage({ params }: { params: BookingConfirmationPageParams }) {
    const { locale, business_urlname, booking_ref } = params;
    const t = await getTranslations('Booking');

    // Fetch booking with all necessary relations
    const booking = await getBookingByReference(booking_ref) as Booking;

    if (!booking) {
        console.error(`[BookingConfirmationPage] Booking with reference ${booking_ref} not found.`);
        notFound();
    }

    const [businessProfileResult, bookingMessages, bookingStatusHistory] = await Promise.all([
        getBusinessProfileLeanData(business_urlname),
        getBookingMessages(booking.booking_id),
        getBookingStatusHistory(booking.booking_id),
    ]);

    const business = businessProfileResult.businessData;
    const themeColorBackground = businessProfileResult.themeColorBackground;
    const themeColorText = businessProfileResult.themeColorText;
    const themeColorButton = businessProfileResult.themeColorButton;

    if (!business) {
        console.error(`[BookingConfirmationPage] Business data (from businessProfileResult.businessData) not found for URL: ${business_urlname}`);
        notFound();
    }

    // --- Generate secondary background colors ---
    const themeColorBackgroundSecondary = adjustColor(themeColorBackground, 0.1, 0.05, 0.95);
    const themeColorBackgroundCard = adjustColor(themeColorBackground, 0.25, 0.1, 0.99); 

    // --- Date and Time Formatting Configuration ---
    const dateFnsLocaleKey = locale.replace('-', '');
    // Ensure that the locale key matches the imported locale object names (e.g., 'enUS' for 'en-US')
    const currentDateFormatLocale = locales[dateFnsLocaleKey as keyof typeof locales] || locales.enUS;

    const BUSINESS_TIMEZONE = 'Europe/Rome';

    // Helper to combine date and time, returning null if either is missing
    const combineDateAndTime = (dateObj: Date | null, timeObj: Date | null) => {
        if (!dateObj || !timeObj) return null;
        const newDate = new Date(dateObj);
        return toZonedTime(
            new Date(
                newDate.getFullYear(),
                newDate.getMonth(),
                newDate.getDate(),
                timeObj.getUTCHours(),
                timeObj.getUTCMinutes(),
                timeObj.getUTCSeconds()
            ),
            BUSINESS_TIMEZONE
        );
    };

    // Use combineDateAndTime, which will return null if booking_date or booking_time_start/end are null
    const zonedBookingStart = combineDateAndTime(booking.booking_date, booking.booking_time_start);
    const zonedBookingEnd = combineDateAndTime(booking.booking_date, booking.booking_time_end);

    // Format dates and times, defaulting to 'N/A' if null
    const formattedBookingDateFull = zonedBookingStart ? format(zonedBookingStart, 'PPPP', { locale: currentDateFormatLocale }) : 'N/A';
    const formattedBookingTimeStart = zonedBookingStart ? format(zonedBookingStart, 'HH:mm') : 'N/A';
    const formattedBookingTimeEnd = zonedBookingEnd ? format(zonedBookingEnd, 'HH:mm') : 'N/A';

    const getBookingStatusTranslation = (statusKey: string) => {
        return t(statusKey) || statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
    };

    const getChangedByTranslation = (changedByKey: string) => {
        return t(`changedBy.${changedByKey}`) || changedByKey.charAt(0).toUpperCase() + changedByKey.slice(1);
    };

    const formatTimestamp = (timestamp: Date) => {
        const date = toZonedTime(new Date(timestamp), BUSINESS_TIMEZONE);
        return format(date, 'dd/MM/yyyy HH:mm', { locale: currentDateFormatLocale });
    };

    const businessCoverImageUrl = business.business_public_uuid
        ? `/uploads/business/profile/${business.business_public_uuid}.webp`
        : 'https://placehold.co/1200x300/e0e0e0/ffffff?text=Business+Cover';

    return (
        <div className="relative min-h-screen" style={{ background: themeColorBackgroundSecondary, borderRadius: '2em 2em 0 0' }}>
            <div className="booking-cover relative w-full h-[250px] sm:h-[300px] lg:h-[400px] overflow-hidden">
                <img
                    src={businessCoverImageUrl}
                    alt={business.business_name || 'Business cover'}
                    className="w-full h-full object-cover"
                />
            </div>

            <main className="relative z-10 -mt-[100px] sm:-mt-[80px] lg:-mt-[250px] px-4 sm:px-6 lg:px-8 pb-10 w-full mx-auto max-w-7xl flex flex-col lg:flex-row items-start gap-4 lg:gap-8">

                {/* Left Column (Messages, Timeline, Requirements, Questions) - Order 2 on large screens */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6 lg:order-2">

                    <div className="messages-section p-6 sm:p-8 rounded-[1.75em] shadow-lg text-center flex flex-col items-center" style={{ backgroundColor: themeColorBackgroundCard }}>
                        <p className="font-bold text-lg md:text-2xl mb-2" style={{ color: themeColorText }}>
                            {t('yourBookingFor')} {booking.service.service_name}
                        </p>
                        <p>
                            <span className={`status-badge px-4 py-1 rounded-full font-bold text-lg capitalize
                                ${booking.status === 'pending' ? 'bg-yellow-500 text-black' : ''}
                                ${booking.status === 'confirmed' ? 'bg-green-600 text-white' : ''}
                                ${booking.status === 'cancelled' ? 'bg-red-600 text-white' : ''}
                                ${booking.status === 'completed' ? 'bg-blue-600 text-white' : ''}
                                ${booking.status === 'no-show' ? 'bg-gray-600 text-white' : ''}
                                ${booking.status === 'rescheduled' ? 'bg-orange-500 text-white' : ''}
                            `}>{getBookingStatusTranslation(booking.status)}</span>
                        </p>

                        <div className="mt-4 mb-3">
                            {(() => {
                                switch (booking.status) {
                                    case 'pending':
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusPendingMessage1')} {business.business_name}.</p>
                                                <p className="text-xs opacity-50">{t('statusPendingMessage2')}</p>
                                            </>
                                        );
                                    case 'confirmed':
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusConfirmedMessage1')}</p>
                                                <p className="text-xs opacity-50">{t('statusConfirmedMessage2')}</p>
                                            </>
                                        );
                                    case 'cancelled':
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusCancelledMessage1')}</p>
                                                <p className="text-xs opacity-50">{t('statusCancelledMessage2')}</p>
                                            </>
                                        );
                                    case 'completed':
                                        return <p>{t('statusCompletedMessage')}</p>;
                                    case 'rescheduled':
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusRescheduledMessage1')}</p>
                                                <p className="text-xs opacity-50">{t('statusRescheduledMessage2')}</p>
                                            </>
                                        );
                                    case 'no-show':
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusNoShowMessage1')}</p>
                                                <p className="text-xs opacity-50">{t('statusNoShowMessage2')}</p>
                                            </>
                                        );
                                    default:
                                        return (
                                            <>
                                                <p className="mb-1">{t('statusDefaultMessage1', { status: getBookingStatusTranslation(booking.status) })}</p>
                                                <p>{t('statusDefaultMessage2')}</p>
                                            </>
                                        );
                                }
                            })()}
                        </div>

                        {/* Booking Messages Section */}
                        <div className="w-full mt-6">
                            <p className="font-bold text-sm mt-4 mb-3">{t('messagesFrom')} {business.business_name}</p>
                            {bookingMessages.length === 0 ? (
                                <p className="text-xs opacity-50 p-2 rounded-lg" style={{ backgroundColor: themeColorBackgroundCard }}>{t('noCommunications')}</p>
                            ) : (
                                <div className="messages-container max-h-[500px] overflow-y-auto p-4 rounded-lg flex flex-col gap-3" style={{ backgroundColor: themeColorBackgroundCard }}>
                                    {bookingMessages.map((message) => (
                                        <div
                                            key={message.message_id}
                                            className={`message-bubble p-3 rounded-xl max-w-[90%] break-words
                                                ${message.sender_type === 'manager' || message.sender_type === 'staff' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'}`}
                                        >
                                            <p className="text-sm opacity-80 mb-1">{message.message_text}</p>
                                            <div className="message-meta text-xs opacity-80 mt-1">
                                                {message.sender_type === 'manager' || message.sender_type === 'staff' ? t('fromBusiness') : t('fromYou')} {t('onDate')} {formatTimestamp(message.sent_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Status Timeline Section */}
                    <div className="booking-status-timeline p-6 sm:p-8 rounded-[1.75em] shadow-lg text-left" style={{ backgroundColor: themeColorBackgroundCard }}>
                        <h3 className="font-bold text-lg mb-4" style={{ color: themeColorText }}>{t('bookingStatusHistory')}</h3>
                        <div className="timeline-container relative pl-8 border-l-2 border-gray-300">
                            {bookingStatusHistory.length === 0 ? (
                                <p className="text-xs opacity-50">{t('noStatusHistory')}</p>
                            ) : (
                                bookingStatusHistory.map((historyStep, index) => {
                                    const isCurrentStatus = (historyStep.new_status === booking.status && index === bookingStatusHistory.length - 1);
                                    return (
                                        <div
                                            key={historyStep.history_id}
                                            className={`timeline-step relative mb-5 pb-1
                                                ${historyStep.new_status === 'pending' ? 'pending' : ''}
                                                ${historyStep.new_status === 'confirmed' ? 'confirmed' : ''}
                                                ${historyStep.new_status === 'cancelled' ? 'cancelled' : ''}
                                                ${historyStep.new_status === 'completed' ? 'completed' : ''}
                                                ${historyStep.new_status === 'no-show' ? 'no-show' : ''}
                                                ${historyStep.new_status === 'rescheduled' ? 'rescheduled' : ''}
                                                ${isCurrentStatus ? 'current' : ''}
                                            `}
                                        >
                                            {/* Circle indicator */}
                                            <div className={`absolute left-[-39px] top-0 w-4 h-4 rounded-full border-3 border-white shadow
                                                ${historyStep.new_status === 'pending' ? 'bg-yellow-500' : ''}
                                                ${historyStep.new_status === 'confirmed' ? 'bg-green-600' : ''}
                                                ${historyStep.new_status === 'cancelled' ? 'bg-red-600' : ''}
                                                ${historyStep.new_status === 'completed' ? 'bg-blue-600' : ''}
                                                ${historyStep.new_status === 'no-show' ? 'bg-gray-600' : ''}
                                                ${historyStep.new_status === 'rescheduled' ? 'bg-orange-500' : ''}
                                            `}></div>

                                            <h5 className="font-bold text-base text-gray-800">
                                                {index === 0 ? t('requestCreated') : getBookingStatusTranslation(historyStep.new_status)}
                                            </h5>
                                            <div className="timestamp text-sm text-gray-600 mt-1">
                                                {formatTimestamp(historyStep.changed_at)}
                                            </div>
                                            {index !== 0 && (
                                                <div className="changed-by text-xs text-gray-500 mt-0.5">
                                                    {t('updatedBy')}: {getChangedByTranslation(historyStep.changed_by)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="details p-6 rounded-[1.75em] shadow-lg text-left text-sm" style={{ backgroundColor: themeColorBackgroundCard }}>
                    {/* Display selected service items */}
                    {booking.bookingselectedserviceitem && booking.bookingselectedserviceitem.length > 0 && (
                        <div className="">
                            <h5 className="text-lg font-bold mb-2">{t('selectedItems')}:</h5>
                            <ul className="list-disc list-inside">
                                {booking.bookingselectedserviceitem.map(item => (
                                    <li key={item.service_item_id} className="mb-1">
                                        {item.bookingserviceitem.item_name}
                                        <p className="opacity-60">
                                        {item.bookingserviceitem.price_type === 'per_unit' ? (
                                            <>
                                            {/* Price per unit: Manually prepend €, enforce two decimals */}
                                            €{parseFloat(item.price_at_booking).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} x {item.quantity}{' '}
                                            {/* This is where the price_unit is added */}
                                            {item.bookingserviceitem.price_unit} = {' '}
                                            {/* Total price: Manually prepend €, enforce two decimals */}
                                            €{(parseFloat(item.price_at_booking) * item.quantity).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </>
                                        ) : (
                                            <>
                                            {/* Default display: Manually prepend €, enforce two decimals */}
                                            €{parseFloat(item.price_at_booking).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (x{item.quantity})
                                            </>
                                        )}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Display total price_base only if it's different from the base service price_base */}
                                                {parseFloat(String(booking.service.price_base)) !== parseFloat(String(booking.price_subtotal)) && (
                        <p className="flex flex-row gap-2 leading-tight font-bold text-base mt-4">
                            <strong>{t('total')}:</strong>  {parseFloat(String(booking.price_subtotal)).toLocaleString(locale, { style: 'currency', currency: 'EUR' })}
                        </p>
                    )}
                    </div>

                    {/* Service Questions (New Section - Moved) */}
                    {(booking.bookingquestionresponse && booking.bookingquestionresponse.length > 0) ||
                        (booking.bookingquestioncheckboxoptionresponse && booking.bookingquestioncheckboxoptionresponse.length > 0) ? (
                        <div className="details p-6 rounded-[1.75em] shadow-lg text-left text-sm" style={{ backgroundColor: themeColorBackgroundCard }}>
                            <h4 className="font-bold text-lg mb-4" style={{ color: themeColorText }}>{t('questionsTitle')}</h4>
                            {(() => {
                                const allQuestionsMap = new Map();

                                booking.bookingquestionresponse?.forEach(res => {
                                    allQuestionsMap.set(res.servicequestion.question_id, {
                                        question_text: res.servicequestion.question_text,
                                        question_type: res.servicequestion.question_type,
                                        display_order: res.servicequestion.display_order,
                                        response_text: res.response_text,
                                        media_url: res.media_url,
                                        options: []
                                    });
                                });

                                booking.bookingquestioncheckboxoptionresponse?.forEach(res => {
                                    if (!allQuestionsMap.has(res.servicequestion.question_id)) {
                                        allQuestionsMap.set(res.servicequestion.question_id, {
                                            question_text: res.servicequestion.question_text,
                                            question_type: res.servicequestion.question_type,
                                            display_order: res.servicequestion.display_order,
                                            response_text: null,
                                            media_url: null,
                                            options: []
                                        });
                                    }
                                    allQuestionsMap.get(res.servicequestion.question_id).options.push(res.servicequestionoption.option_text);
                                });

                                const sortedQuestions = Array.from(allQuestionsMap.values()).sort((a, b) => a.display_order - b.display_order);

                                return sortedQuestions.map((q, index) => (
                                    <div 
                                    key={q.question_id} 
                                    className={`pb-2 ${index < sortedQuestions.length - 1 ? 'mb-3' : ''}`} 
                                    style={{ borderBottom: `1px solid ${themeColorBackgroundCard}` }}
                                    >
                                        <p className="font-medium text-xs md:text-base opacity-70 leading-none">{q.question_text}</p>
                                        {q.question_type === 'open_text' && (
                                            <p className="font-bold text-sm">{q.response_text || t('noResponse')}</p>
                                        )}
                                        {q.question_type === 'media_upload' && (
                                            <p className="ml-2">
                                                {q.media_url ? (
                                                    <a href={q.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                        {t('viewMedia')}
                                                    </a>
                                                ) : (
                                                    t('noMediaUploaded')
                                                )}
                                            </p>
                                        )}
                                        {q.question_type === 'checkbox_multi' && (
                                            <ul className="list-disc list-inside flex flex-row flex-wrap text-left gap-x-2">
                                                {q.options && q.options.length > 0 ? (
                                                    q.options.map((optionText: string, i: number) => (
                                                        <li key={i} className="font-bold">{optionText}</li>
                                                    ))
                                                ) : (
                                                    <li>{t('noOptionsSelected')}</li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <div className="details p-6f rounded-[1.75em] shadow-lg text-left text-sm" style={{ backgroundColor: themeColorBackgroundCard }}>
                            <p className="opacity-50">{t('noServiceSpecificDetails')}</p>
                        </div>
                    )}

                </div>

                {/* Right Column (Booking Details) - Order 1 on large screens */}
                <div className="w-full lg:w-1/3 flex-shrink-0 flex flex-col gap-6 lg:order-1">
                    <div className="details-container p-6 rounded-[2em] shadow-lg text-center" style={{ backgroundColor: themeColorBackgroundCard }}>
                        <p className="font-bold text-lg mb-4" style={{ color: themeColorText }}>{t('bookingDetails')}</p>

                        {/* Booking Reference */}
                        <div className="mt-5 mb-6">
                            <div className="booking-ref p-3 rounded-[1em] border-2 border-blue-500 text-left flex items-center justify-between gap-2" style={{ backgroundColor: themeColorBackgroundSecondary }}>
                                <p className="text-xs leading-none">{t('bookingReference')}:</p>
                                <span className="text-xl font-mono text-blue-400">{booking.booking_reference}</span>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="details p-4 rounded-xl shadow-md text-left text-sm mb-4" style={{ backgroundColor: themeColorBackgroundSecondary }}>
                            <h4 className="font-bold text-base mb-2">{t('yourDetails')}</h4>
                            <div>
                                <div className="font-bold text-base">{booking.customer_name}</div>
                                <div className="text-sm">{booking.customer_email}</div>
                                {booking.customer_phone && (
                                    <div className="text-sm">{booking.customer_phone}</div>
                                )}
                            </div>
                            {booking.customer_notes && (
                                <p className="mt-3 text-sm"><strong>{t('notes')}:</strong> {booking.customer_notes}</p>
                            )}
                        </div>

                        {/* Service Details */}
                        <div className="details p-4 rounded-xl shadow-md text-left text-sm" style={{ backgroundColor: themeColorBackgroundSecondary }}>
                            <h4 className="font-bold text-base mb-2">{t('serviceDetails')}</h4>
                            <p className="flex flex-col gap-0.5 mb-2 leading-tight">
                                <strong>{t('service')}:</strong> {booking.service.service_name} ({booking.service.duration_minutes !== null ? booking.service.duration_minutes : '-'} {t('minutes', { count: booking.service.duration_minutes ?? 0 })})
                            </p>
                            <p className="flex flex-col gap-0.5 mb-2 leading-tight">
                                <strong>{t('basePrice')}:</strong> {booking.service.price_base !== null ? parseFloat(String(booking.service.price_base)).toLocaleString(locale, { style: 'currency', currency: 'EUR' }) : '-'}
                            </p>
                            {/* Conditionally display date and time based on service.date_selection */}
                            {booking.service.date_selection ? (
                                <p className="flex flex-col gap-0.5 mb-2 leading-tight">
                                    <strong>{t('dateAndTime')}:</strong> {formattedBookingDateFull}, {formattedBookingTimeStart} - {formattedBookingTimeEnd}
                                </p>
                            ) : (
                                <p className="flex flex-col gap-0.5 leading-tight"></p>
                            )}
                        </div>

                        {/* Back to Business Link */}
                        <div className="back-button-container mt-8 text-center">
                            <a
                                href={`/${locale}/${business.business_urlname}`}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                style={{ color: themeColorButton }}
                            >
                                {t('goToBusinessWebsite')} {business.business_name}
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Error Message Section */}
            {!booking && (
                <section className="container mx-auto py-8 text-center px-4">
                    <div className="text-red-500 text-6xl mb-4">✖</div>
                    <p className="text-2xl font-bold mb-2">{t('bookingNotFoundTitle')}</p>
                    <p className="text-gray-700 mb-6">
                        {t('bookingNotFoundMessage')}
                    </p>
                    <a href={`/${locale}`} className="inline-block bg-black text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-gray-800 transition-colors">
                        {t('backToHome')}
                    </a>
                </section>
            )}
        </div>
    );
}
