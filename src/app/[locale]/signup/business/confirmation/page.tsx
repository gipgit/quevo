"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import LocaleSwitcherButton from "@/components/ui/LocaleSwitcherButton"
import LocaleSelectModal from "@/components/ui/LocaleSelectModal"
import { useLocaleSwitcher } from "@/hooks/useLocaleSwitcher"

export default function SignupConfirmationPage() {
  const searchParams = useSearchParams()
  const t = useTranslations("SignupConfirmation")
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher()
  const email = searchParams?.get("email") || ""

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Email Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-6">
            <EnvelopeIcon className="h-12 w-12 text-blue-600" />
          </div>

          {/* Main Heading */}
          <h1 className="text-xl font-bold text-gray-900 mb-4">{t("title")}</h1>

          {/* Instructions */}
          <div className="space-y-4">
            {email && (
              <p className="text-lg font-medium text-gray-700">
                {t("emailSentTo", { email })}
              </p>
            )}

            <p className="mt-6 opacity-50 text-sm">{t("checkSpam")}</p>
          </div>


          {/* Action Links */}
          <div className="mt-8 space-y-3">
            <Link
              href="/signup/business"
              className="flex justify-center py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("tryAgain")}
            </Link>
          </div>

          {/* Support Link */}
          <div className="mt-6">
            <p className="text-xs text-gray-500">
              {t("needHelp")}{" "}
              <Link href="/support" className="text-blue-600 hover:text-blue-500">
                {t("contactSupport")}
              </Link>
            </p>
          </div>

          {/* Locale Switcher */}
          <div className="mt-6 flex justify-center">
            <LocaleSwitcherButton 
              onClick={() => setIsModalOpen(true)}
              className="text-gray-600 hover:text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Locale Selection Modal */}
      <LocaleSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableLocales={availableLocales}
        currentLocale={currentLocale}
        onLocaleSelect={switchLocale}
      />
    </div>
  )
}
