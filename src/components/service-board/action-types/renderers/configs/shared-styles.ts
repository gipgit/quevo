// Common styles that can be reused across all renderers
export const commonStyles = {
  // Layout styles
  container: 'mb-4',
  label: 'text-sm font-medium text-gray-500',
  wrapper: 'mt-1',

  // Text styles
  text: {
    default: 'text-sm text-gray-900',
    heading: 'text-xl font-semibold text-gray-900',
    amount: 'text-3xl font-bold text-primary',
    muted: 'text-sm text-gray-600',
  },

  // Status styles
  status: {
    container: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    colors: {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    },
  },

  // Button styles
  button: {
    primary: 'w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors',
    secondary: 'w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors',
  },

  // Link styles
  link: {
    default: 'text-sm text-blue-600 hover:text-blue-800',
    withIcon: 'inline-flex items-center text-sm text-blue-600 hover:text-blue-800',
  },

  // Card styles
  card: {
    default: 'p-4 rounded-lg border border-gray-200',
    interactive: 'p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors',
  },

  // Icon styles
  icon: {
    default: 'h-5 w-5 text-gray-400',
  },

  // Flex layouts
  flex: {
    row: 'flex items-center space-x-2',
    col: 'flex flex-col space-y-2',
    between: 'flex items-center justify-between',
  },
}; 