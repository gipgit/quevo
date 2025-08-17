import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AppointmentsWrapper from "./appointments-wrapper"
import { getCurrentBusinessIdFromCookie } from "@/lib/server-business-utils"

export default async function AppointmentsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get current business ID from cookie
  const currentBusinessId = getCurrentBusinessIdFromCookie()
  
  if (!currentBusinessId) {
    redirect('/dashboard')
  }

  // Fetch appointments for the current business (appointments-specific data)
  const appointments = await prisma.appointment.findMany({
    where: {
      business_id: currentBusinessId
    },
    include: {
      serviceboard: {
        select: {
          board_title: true,
          board_ref: true
        }
      },
      usercustomer: {
        select: {
          name_first: true,
          name_last: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: {
      appointment_datetime: 'asc'
    }
  })

  // Transform appointments to match the expected format
  const transformedAppointments = appointments.map(appointment => ({
    id: appointment.id,
    title: appointment.appointment_title || 'Untitled Appointment',
    start: appointment.appointment_datetime,
    end: appointment.appointment_datetime, // Using same datetime for end since we don't have end time
    customerName: `${appointment.usercustomer.name_first || ''} ${appointment.usercustomer.name_last || ''}`.trim() || 'Unknown Customer',
    customerEmail: appointment.usercustomer.email,
    customerPhone: appointment.usercustomer.phone || undefined,
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed', // Default status
    notes: undefined,
    appointment_title: appointment.appointment_title || undefined,
    service_board_title: appointment.serviceboard?.board_title,
    service_board_ref: appointment.serviceboard?.board_ref,
    platform_name: undefined,
    platform_link: undefined,
    appointment_location: appointment.appointment_location || undefined,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at
  }))

  return (
    <AppointmentsWrapper 
      appointments={transformedAppointments}
    />
  )
}