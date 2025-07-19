"use client"

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid"
import { useTranslations } from "next-intl"

interface PasswordRequirementsProps {
  password: string
  show: boolean
}

export const PasswordRequirements = ({ password, show }: PasswordRequirementsProps) => {
  const t = useTranslations("BusinessSignup")

  if (!show) return null

  const requirements = [
    {
      text: t("passwordMinLength"),
      met: password.length >= 8,
    },
    {
      text: t("passwordLowercase"),
      met: /(?=.*[a-z])/.test(password),
    },
    {
      text: t("passwordUppercase"),
      met: /(?=.*[A-Z])/.test(password),
    },
    {
      text: t("passwordNumber"),
      met: /(?=.*\d)/.test(password),
    },
    {
      text: t("passwordSpecialChar"),
      met: /(?=.*[@$!%*?&])/.test(password),
    },
  ]

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-md border">
      <p className="text-sm font-medium text-gray-700 mb-2">{t("passwordRequirementsTitle")}</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center text-sm">
            {req.met ? (
              <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <XMarkIcon className="w-4 h-4 text-red-500 mr-2" />
            )}
            <span className={req.met ? "text-green-700" : "text-red-700"}>{req.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
