declare module "@/lib/data/booking" {
  export type Booking = {
    booking_id: string;
    booking_date: Date | null;
    booking_time_start: Date | null;
    booking_time_end: Date | null;
    price_subtotal: number | null;
    status: string;
    booking_reference: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    customer_notes: string | null;
    customer_user_id: string | null;
    service: {
      service_name: string;
      duration_minutes: number | null;
      price_base: number | null;
      available_booking: boolean | null;
    };
    business: {
      business_name: string;
      business_urlname: string;
      business_email: string;
      business_public_uuid: string;
    };
    bookingrequirementresponse?: any[];
    bookingquestionresponse?: any[];
    bookingquestioncheckboxoptionresponse?: any[];
    bookingselectedserviceitem?: any[];
  };
  export function getBookingByReference(bookingReference: string): Promise<Booking | null>;
  export function getBookingMessages(bookingId: string): Promise<any[]>;
  export function getBookingStatusHistory(bookingId: string): Promise<any[]>;
}
