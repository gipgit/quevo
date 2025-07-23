import { useTranslations } from "next-intl"

interface SaveButtonProps {
  onClick: () => void
  disabled?: boolean
  saving?: boolean
  className?: string
  children?: React.ReactNode
}

export default function SaveButton({ 
  onClick, 
  disabled = false, 
  saving = false, 
  className = "",
  children
}: SaveButtonProps) {
  const t = useTranslations("Common")
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || saving}
      className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children || (saving ? "Saving..." : t("save"))}
    </button>
  )
} 