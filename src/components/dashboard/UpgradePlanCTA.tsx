import React from "react"

interface UpgradePlanCTAProps {
  onUpgrade?: () => void
  text?: string
}

export const UpgradePlanCTA: React.FC<UpgradePlanCTAProps> = ({ onUpgrade, text = "Upgrade Plan" }) => (
  <button
    className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded"
    onClick={onUpgrade}
  >
    {text}
  </button>
)
