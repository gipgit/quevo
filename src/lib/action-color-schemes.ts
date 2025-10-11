// lib/action-color-schemes.ts
// Color schemes for LandingIconAction and BoardIconAction components
// Each scheme has 3 colors for gradient, border, and shadow effects

export interface ColorScheme {
  color1: string;
  color2: string;
  color3: string;
}

export const actionColorSchemes: Record<string, ColorScheme> = {
  // Appointment & Scheduling
  appointment_scheduling: {
    color1: '#3B82F6', // blue-500
    color2: '#6366F1', // indigo-500
    color3: '#8B5CF6'  // violet-500
  },

  // Messages & Communication
  generic_message: {
    color1: '#06B6D4', // cyan-500
    color2: '#0EA5E9', // sky-500
    color3: '#3B82F6'  // blue-500
  },

  // Payments
  payment_request: {
    color1: '#10B981', // emerald-500
    color2: '#14B8A6', // teal-500
    color3: '#06B6D4'  // cyan-500
  },

  // Information requests / Questions & Forms
  information_request: {
    color1: '#EC4899', // pink-500
    color2: '#D946EF', // fuchsia-500
    color3: '#A855F7'  // purple-500
  },

  // File uploads / Media upload
  file_upload: {
    color1: '#F59E0B', // amber-500
    color2: '#F97316', // orange-500
    color3: '#EF4444'  // red-500
  },
  
  media_upload: {
    color1: '#F59E0B', // amber-500
    color2: '#F97316', // orange-500
    color3: '#EF4444'  // red-500
  },

  // Document download
  document_download: {
    color1: '#6366F1', // indigo-500
    color2: '#8B5CF6', // violet-500
    color3: '#A855F7'  // purple-500
  },

  // Checklists & Tasks
  checklist: {
    color1: '#8B5CF6', // violet-500
    color2: '#A855F7', // purple-500
    color3: '#D946EF'  // fuchsia-500
  },

  // Approvals
  approval_request: {
    color1: '#10B981', // emerald-500
    color2: '#059669', // emerald-600
    color3: '#047857'  // emerald-700
  },

  // Signature request
  signature_request: {
    color1: '#EF4444', // red-500
    color2: '#DC2626', // red-600
    color3: '#B91C1C'  // red-700
  },

  // Milestone / Progress tracking
  milestone_update: {
    color1: '#8B5CF6', // violet-500
    color2: '#7C3AED', // violet-600
    color3: '#6D28D9'  // violet-700
  },

  // Feedback request
  feedback_request: {
    color1: '#EC4899', // pink-500
    color2: '#D946EF', // fuchsia-500
    color3: '#A855F7'  // purple-500
  },

  // Resource link
  resource_link: {
    color1: '#06B6D4', // cyan-500
    color2: '#0891B2', // cyan-600
    color3: '#0E7490'  // cyan-700
  },

  // Location & Address
  address_collection: {
    color1: '#EF4444', // red-500
    color2: '#F97316', // orange-500
    color3: '#F59E0B'  // amber-500
  },

  // Questions & Forms
  question: {
    color1: '#EC4899', // pink-500
    color2: '#D946EF', // fuchsia-500
    color3: '#A855F7'  // purple-500
  },

  // Documents & Text
  text_block: {
    color1: '#6366F1', // indigo-500
    color2: '#8B5CF6', // violet-500
    color3: '#A855F7'  // purple-500
  },

  // Approvals (alternate key)
  approval: {
    color1: '#10B981', // emerald-500
    color2: '#059669', // emerald-600
    color3: '#047857'  // emerald-700
  },

  // Date selection
  date_selection: {
    color1: '#3B82F6', // blue-500
    color2: '#2563EB', // blue-600
    color3: '#1D4ED8'  // blue-700
  },

  // Links
  link: {
    color1: '#06B6D4', // cyan-500
    color2: '#0891B2', // cyan-600
    color3: '#0E7490'  // cyan-700
  },

  // Images
  image: {
    color1: '#F59E0B', // amber-500
    color2: '#D97706', // amber-600
    color3: '#B45309'  // amber-700
  },

  // Video
  video: {
    color1: '#EF4444', // red-500
    color2: '#DC2626', // red-600
    color3: '#B91C1C'  // red-700
  },

  // Progress tracking (alternate key)
  progress: {
    color1: '#8B5CF6', // violet-500
    color2: '#7C3AED', // violet-600
    color3: '#6D28D9'  // violet-700
  },

  // Notifications
  notification: {
    color1: '#EC4899', // pink-500
    color2: '#DB2777', // pink-600
    color3: '#BE185D'  // pink-700
  },

  // Default fallback
  default: {
    color1: '#6B7280', // gray-500
    color2: '#4B5563', // gray-600
    color3: '#374151'  // gray-700
  }
};

/**
 * Get color scheme for a specific action type
 * @param actionType - The action type key
 * @returns Color scheme object with color1, color2, color3
 */
export function getActionColorScheme(actionType: string): ColorScheme {
  return actionColorSchemes[actionType] || actionColorSchemes.default;
}

/**
 * Get all available action types
 * @returns Array of action type keys
 */
export function getAvailableActionTypes(): string[] {
  return Object.keys(actionColorSchemes).filter(key => key !== 'default');
}

