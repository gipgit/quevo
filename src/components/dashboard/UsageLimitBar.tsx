import React from "react"

interface UsageLimitBarProps {
  current: number
  max: number
  label: string
  showUpgrade?: boolean
  onUpgrade?: () => void
  upgradeText?: string
  unlimitedText?: string
}

export const UsageLimitBar: React.FC<UsageLimitBarProps> = ({
  current,
  max,
  label,
  showUpgrade = false,
  onUpgrade,
  upgradeText = "Upgrade Plan",
  unlimitedText = "Unlimited",
}) => {
  const percent = max === -1 ? 0 : Math.min(100, (current / max) * 100)
  return (
    <div className="mt-1">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {label.replace("{current}", String(current)).replace("{max}", max === -1 ? unlimitedText : String(max))}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 lg:h-2.5 mt-1">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {showUpgrade && max !== -1 && current >= max && (
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors whitespace-nowrap"
            onClick={onUpgrade}
          >
            {upgradeText}
          </button>
        )}
      </div>
    </div>
  )
}
