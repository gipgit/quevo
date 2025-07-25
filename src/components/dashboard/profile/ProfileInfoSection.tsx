import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { CheckIcon, XMarkIcon, ArrowPathIcon, GlobeAltIcon } from "@heroicons/react/24/outline"

interface ProfileInfoSectionProps {
  profileData: Record<string, any>
  onChange: (field: string, value: string) => void
}

interface UrlValidation {
  status: "idle" | "checking" | "available" | "unavailable" | "error"
  message: string
}

export default function ProfileInfoSection({ profileData, onChange }: ProfileInfoSectionProps) {
  const t = useTranslations("profile")
  // --- Business URL name validation logic ---
  const [urlValidation, setUrlValidation] = useState<UrlValidation>({ status: "idle", message: "" })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const originalUrlname = useRef<string>(profileData.business_urlname || "")
  const [isUrlInputFocused, setIsUrlInputFocused] = useState(false)

  const checkUrlAvailability = async (urlname: string) => {
    if (!urlname || urlname.length < 3) {
      setUrlValidation({ status: "idle", message: "" })
      return false
    }
    
    // Don't validate if it's the same as the original URL name
    if (urlname === originalUrlname.current) {
      setUrlValidation({ status: "idle", message: "" })
      return true
    }
    
    setUrlValidation({ status: "checking", message: t("businessUrlNameChecking") })
    try {
      const response = await fetch("/api/business/check-urlname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlname }),
      })
      const data = await response.json()
      setUrlValidation({
        status: data.available ? "available" : "unavailable",
        message: data.message,
      })
      return data.available
    } catch (error) {
      setUrlValidation({ status: "error", message: t("businessUrlNameError") })
      return false
    }
  }

  const handleUrlChange = (value: string) => {
    const cleanValue = value
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/_+/g, "_")
      .replace(/-+/g, "-")
      .replace(/^[-_]|[-_]$/g, "")
    onChange("business_urlname", cleanValue)
    setUrlValidation({ status: "idle", message: "" })
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      checkUrlAvailability(cleanValue)
    }, 500)
  }

  const getIcon = () => {
    switch (urlValidation.status) {
      case "checking":
        return <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
      case "available":
        return <CheckIcon className="w-5 h-5 text-green-500" />
      case "unavailable":
        return <XMarkIcon className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  // --- Emails/Phones logic ---
  const parseArray = (val: any) => {
    if (Array.isArray(val)) {
      // Convert array of strings to array of objects with value and title
      return val.map(item => {
        if (typeof item === "string") {
          return { value: item, title: "" }
        } else if (typeof item === "object" && item.value) {
          return { value: item.value, title: item.title || "" }
        }
        return { value: String(item), title: "" }
      })
    }
    if (typeof val === "string") {
      try {
        const arr = JSON.parse(val)
        if (Array.isArray(arr)) {
          return arr.map(item => {
            if (typeof item === "string") {
              return { value: item, title: "" }
            } else if (typeof item === "object" && item.value) {
              return { value: item.value, title: item.title || "" }
            }
            return { value: String(item), title: "" }
          })
        }
      } catch {}
    }
    return val ? [{ value: String(val), title: "" }] : []
  }
  const [emails, setEmails] = useState<{ value: string; title: string }[]>(
    parseArray(profileData.business_emails || profileData.business_email)
  )
  const [phones, setPhones] = useState<{ value: string; title: string }[]>(
    parseArray(profileData.business_phones || profileData.business_phone)
  )

  const handleEmailChange = (idx: number, field: "value" | "title", val: string) => {
    const updated = emails.map((e, i) => (i === idx ? { ...e, [field]: val } : e))
    setEmails(updated)
    onChange("business_emails", JSON.stringify(updated))
  }
  const handleAddEmail = () => {
    if (emails.length < 3) {
      const updated = [...emails, { value: "", title: "" }]
      setEmails(updated)
      onChange("business_emails", JSON.stringify(updated))
    }
  }
  const handleRemoveEmail = (idx: number) => {
    const updated = emails.filter((_, i) => i !== idx)
    setEmails(updated)
    onChange("business_emails", JSON.stringify(updated))
  }

  const handlePhoneChange = (idx: number, field: "value" | "title", val: string) => {
    const updated = phones.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    setPhones(updated)
    onChange("business_phones", JSON.stringify(updated))
  }
  const handleAddPhone = () => {
    if (phones.length < 3) {
      const updated = [...phones, { value: "", title: "" }]
      setPhones(updated)
      onChange("business_phones", JSON.stringify(updated))
    }
  }
  const handleRemovePhone = (idx: number) => {
    const updated = phones.filter((_, i) => i !== idx)
    setPhones(updated)
    onChange("business_phones", JSON.stringify(updated))
  }

  return (
    <div className="py-2 space-y-6">
      {/* Business URL Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessUrlName")}</label>
        <div className="flex items-center rounded-full shadow-sm overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 border-r border-gray-300">
            <GlobeAltIcon className="w-5 h-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">
              quevo.app/
            </span>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={profileData.business_urlname || ""}
              onFocus={() => setIsUrlInputFocused(true)}
              onBlur={(e) => {
                setIsUrlInputFocused(false)
                handleUrlChange(e.target.value)
              }}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={`w-full p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent ${
                urlValidation.status === "available"
                  ? "text-green-800 placeholder-green-400"
                  : urlValidation.status === "unavailable"
                  ? "text-red-800 placeholder-red-400"
                  : "text-gray-900 placeholder-gray-400"
              }`}
              placeholder="il-mio-business"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {getIcon()}
            </div>
          </div>
        </div>
        {isUrlInputFocused && (
          <p className="mt-2 text-xs text-gray-500">
            Questo sarà il link del tuo profilo. Deve contenere solo lettere minuscole, numeri, trattini e underscore.
          </p>
        )}
        {urlValidation.message && (
          <p
            className={`mt-2 text-sm ${
              urlValidation.status === "available"
                ? "text-green-600"
                : urlValidation.status === "unavailable"
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {urlValidation.message}
          </p>
        )}
      </div>

      {/* Business Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessName")}</label>
        <input
          type="text"
          value={profileData.business_name || ""}
          onChange={(e) => onChange("business_name", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Business Location - Country, Region, Address */}
      <div className="flex gap-2">
        <div className="w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessCountry")}</label>
          <input
            type="text"
            value={profileData.business_country || ""}
            onChange={(e) => onChange("business_country", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessRegion")}</label>
          <input
            type="text"
            value={profileData.business_region || ""}
            onChange={(e) => onChange("business_region", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="w-2/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessAddress")}</label>
          <input
            type="text"
            value={profileData.business_address || ""}
            onChange={(e) => onChange("business_address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Business Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t("businessDescr")}</label>
        <textarea
          value={profileData.business_descr || ""}
          onChange={(e) => onChange("business_descr", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      {/* Emails */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">{t("businessEmail")}</label>
          {emails.length < 3 && (
            <button type="button" onClick={handleAddEmail} className="text-blue-600 text-sm">{t("addEmail")}</button>
          )}
        </div>
        {emails.map((email, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="email"
              value={email.value}
              onChange={(e) => handleEmailChange(idx, "value", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t("emailPlaceholder")}
            />
            <input
              type="text"
              value={email.title}
              onChange={(e) => handleEmailChange(idx, "title", e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t("emailTitlePlaceholder")}
            />
            {emails.length > 1 && (
              <button type="button" onClick={() => handleRemoveEmail(idx)} className="text-red-500">{t("remove")}</button>
            )}
          </div>
        ))}
      </div>
      {/* Phones */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">{t("businessPhone")}</label>
          {phones.length < 3 && (
            <button type="button" onClick={handleAddPhone} className="text-blue-600 text-sm">{t("addPhone")}</button>
          )}
        </div>
        {phones.map((phone, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              type="text"
              value={phone.value}
              onChange={(e) => handlePhoneChange(idx, "value", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t("phonePlaceholder")}
            />
            <input
              type="text"
              value={phone.title}
              onChange={(e) => handlePhoneChange(idx, "title", e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t("phoneTitlePlaceholder")}
            />
            {phones.length > 1 && (
              <button type="button" onClick={() => handleRemovePhone(idx)} className="text-red-500">{t("remove")}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
