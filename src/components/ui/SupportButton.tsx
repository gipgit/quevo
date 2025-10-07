import React from 'react'
import { MessageCircleQuestion as QuestionMarkCircleIcon } from 'lucide-react'

interface SupportButtonProps {
  onClick?: () => void
  className?: string
}

const SupportButton: React.FC<SupportButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-start gap-x-2 rounded-md px-2 py-1 text-xs font-medium leading-6 text-gray-500 transition-all hover:bg-gray-100 ${className}`}
    >
      <QuestionMarkCircleIcon className="h-4 w-4" />
      Support
    </button>
  )
}

export default SupportButton 