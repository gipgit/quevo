import React, { useState, useEffect } from "react"

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
  const [progressAnimation, setProgressAnimation] = useState(0)
  const percent = max === -1 ? 0 : Math.min(100, (current / max) * 100)

  // Animate progress bar on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressAnimation(percent)
    }, 300) // Initial delay before starting animation
    
    return () => clearTimeout(timer)
  }, [percent])

  return (
    <div className="mt-1">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--dashboard-text-secondary)]">
              {label.replace("{current}", String(current)).replace("{max}", max === -1 ? unlimitedText : String(max))}
            </span>
          </div>
          {max !== -1 && max !== null && (
            <div className="w-full rounded-full h-2 mt-1" style={{ background: 'var(--progress-bg)' }}>
              <div
                className="h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressAnimation}%`,
                  background: 'var(--progress-fill)'
                }}
              />
            </div>
          )}
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
