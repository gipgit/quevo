export interface Contact {
  id: string
  title: string
  value: string
}

/**
 * Parse contacts from JSON or handle legacy string format
 */
export function parseContacts(data: any): Contact[] {
  if (!data) return []
  
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return parsed.map((contact, index) => ({
          id: contact.id || `contact-${index}`,
          title: contact.title || '',
          value: contact.value || contact
        }))
      }
      // If it's a single string, treat as legacy format
      return [{
        id: 'contact-1',
        title: '',
        value: data
      }]
    } catch (e) {
      // If parsing fails, treat as legacy format
      return [{
        id: 'contact-1',
        title: '',
        value: data
      }]
    }
  }
  
  if (Array.isArray(data)) {
    return data.map((contact, index) => ({
      id: contact.id || `contact-${index}`,
      title: contact.title || '',
      value: contact.value || contact
    }))
  }
  
  return []
}

/**
 * Check if contacts array has any valid contacts
 */
export function hasValidContacts(contacts: Contact[]): boolean {
  return contacts.length > 0 && contacts.some(contact => contact.value && contact.value.trim() !== '')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Basic formatting for Italian numbers
  if (digitsOnly.startsWith('39') && digitsOnly.length === 12) {
    return `+${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 9)} ${digitsOnly.slice(9)}`
  }
  
  if (digitsOnly.startsWith('39') && digitsOnly.length === 11) {
    return `+${digitsOnly.slice(0, 2)} ${digitsOnly.slice(2, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`
  }
  
  // For other formats, just return the original
  return phone
}

/**
 * Create WhatsApp link from phone number
 */
export function createWhatsAppLink(phone: string): string {
  const formattedPhone = phone.replace(/\s/g, '')
  return `https://wa.me/${formattedPhone}`
} 