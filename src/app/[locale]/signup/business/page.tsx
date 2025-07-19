"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { CheckIcon, ArrowPathIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid"
import { PasswordRequirements } from "@/components/password-requirements"

interface FormData {
  name_first: string
  email: string
  password: string
  promotional_code: string
}

interface EmailValidation {
  status: "idle" | "checking" | "available" | "unavailable" | "error"
  message: string
}

interface PasswordValidation {
  status: "idle" | "valid" | "invalid"
  message: string
}

export default function BusinessSignupPage() {
  const router = useRouter()
  const t = useTranslations("BusinessSignup")
  const emailTimeoutRef = useRef<NodeJS.Timeout>()
  const passwordTimeoutRef = useRef<NodeJS.Timeout>()

  const [formData, setFormData] = useState<FormData>({
    name_first: "",
    email: "",
    password: "",
    promotional_code: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    status: "idle",
    message: "",
  })
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    status: "idle",
    message: "",
  })
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const checkEmailAvailability = async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailValidation({ status: "idle", message: "" })
      return
    }

    setEmailValidation({ status: "checking", message: t("emailChecking") })

    try {
      const response = await fetch("/api/auth/check-email-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      setEmailValidation({
        status: data.available ? "available" : "unavailable",
        message: data.message,
      })
    } catch (error) {
      setEmailValidation({
        status: "error",
        message: t("emailCheckError"),
      })
    }
  }

  const validatePassword = useCallback(
    (password: string): boolean => {
      const passwordChecks = [
        { test: password.length >= 8, message: t("passwordMinLength") },
        { test: /(?=.*[a-z])/.test(password), message: t("passwordLowercase") },
        { test: /(?=.*[A-Z])/.test(password), message: t("passwordUppercase") },
        { test: /(?=.*\d)/.test(password), message: t("passwordNumber") },
        { test: /(?=.*[@$!%*?&])/.test(password), message: t("passwordSpecialChar") },
      ]

      const failedCheck = passwordChecks.find((check) => !check.test)

      if (failedCheck) {
        setPasswordValidation({ status: "invalid", message: failedCheck.message })
        return false
      } else {
        setPasswordValidation({ status: "valid", message: t("passwordStrong") })
        return true
      }
    },
    [t],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
      setMessage("")

      if (name === "email") {
        setEmailValidation({ status: "idle", message: "" })
        if (emailTimeoutRef.current) {
          clearTimeout(emailTimeoutRef.current)
        }
      }

      if (name === "password") {
        setPasswordValidation({ status: "idle", message: "" });
      }
    },
    [errors],
  )

  const handleEmailBlur = () => {
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
    }
    emailTimeoutRef.current = setTimeout(() => {
      checkEmailAvailability(formData.email)
    }, 300)
  }

  const handlePasswordFocus = () => {
    // This is the key: always set to true on focus
    setShowPasswordRequirements(true);
  }

  const handlePasswordBlur = () => {
    const isValid = validatePassword(formData.password)
    // Only hide requirements if password is valid
    if (isValid) {
      setShowPasswordRequirements(false)
    }
    // If not valid, showPasswordRequirements remains true
  }

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name_first.trim()) {
      newErrors.name_first = t("nameRequired")
    } else if (formData.name_first.trim().length < 2) {
      newErrors.name_first = t("nameMinLength")
    } else if (formData.name_first.trim().length > 50) {
      newErrors.name_first = t("nameMaxLength")
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.name_first)) {
      newErrors.name_first = t("nameInvalidChars")
    }

    if (!formData.email) {
      newErrors.email = t("emailRequired")
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid")
    } else if (emailValidation.status === "unavailable") {
      newErrors.email = t("emailAlreadyExists")
    }

    const isPasswordValidOnSubmit = validatePassword(formData.password)
    if (!isPasswordValidOnSubmit) {
      newErrors.password = passwordValidation.message
      // Ensure requirements are visible if invalid on submit, even if not focused
      setShowPasswordRequirements(true); 
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const localizedErrors: Record<string, string> = {}
          Object.keys(data.errors).forEach((key) => {
            localizedErrors[key] = data.errors[key][0]
          })
          setErrors(localizedErrors)
        } else {
          setMessage(data.message || t("signupError"))
        }
      } else {
        router.push(`/signup/business/confirmation?email=${encodeURIComponent(formData.email)}`)
      }
    } catch (error) {
      setMessage(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  const getEmailInputIcon = () => {
    switch (emailValidation.status) {
      case "checking":
        return <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
      case "available":
        return <CheckIcon className="w-5 h-5 text-green-500" />
      case "unavailable":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getPasswordInputIcon = () => {
    // Only show icons if password has been interacted with (not idle)
    if (passwordValidation.status === "valid") {
      return <CheckIcon className="w-5 h-5 text-green-500" />
    } else if (passwordValidation.status === "invalid") {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    }
    return null
  }

  return (
    <>
      {/* Full Screen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="rounded-lg p-8 flex flex-col items-center">
            <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("creatingAccount")}</h3>
            <p className="text-gray-600 text-center">
              {t("pleaseWait") || "Attendere prego, stiamo creando il tuo account..."}
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="flex-1 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("brandTitle")}</h1>
              <h2 className="text-xl text-gray-700">{t("pageTitle")}</h2>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-md text-sm ${
                  message.includes("successo") || message.includes("Completata") || message === t("signupSuccess")
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Name Field */}
              <div>
                <label htmlFor="name_first" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("nameLabel")} *
                </label>
                <input
                  id="name_first"
                  name="name_first"
                  type="text"
                  value={formData.name_first}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.name_first ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={t("namePlaceholder")}
                />
                {errors.name_first && <p className="mt-1 text-sm text-red-600">{errors.name_first}</p>}
              </div>

              {/* Email Field with Real-time Validation */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("emailLabel")} *
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    disabled={loading}
                    className={`w-full p-4 pr-12 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : emailValidation.status === "available"
                          ? "border-green-300 bg-green-50"
                          : emailValidation.status === "unavailable"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder={t("emailPlaceholder")}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{getEmailInputIcon()}</div>
                </div>
                {emailValidation.message && (
                  <p
                    className={`mt-1 text-sm ${
                      emailValidation.status === "available"
                        ? "text-green-600"
                        : emailValidation.status === "unavailable"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {emailValidation.message}
                  </p>
                )}
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Password Field with Requirements and Toggle */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("passwordLabel")} *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    disabled={loading}
                    className={`w-full p-4 pr-12 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : passwordValidation.status === "valid"
                          ? "border-green-300 bg-green-50"
                          : passwordValidation.status === "invalid"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                    }`}
                    placeholder={t("passwordPlaceholder")}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button type="button" onClick={togglePasswordVisibility} className="text-gray-500 hover:text-gray-700">
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                    {/* Icon for password validation status */}
                    <div className="ml-2">{getPasswordInputIcon()}</div>
                  </div>
                </div>
                {/* Corrected: PasswordRequirements visibility controlled by showPasswordRequirements state */}
                <PasswordRequirements password={formData.password} show={showPasswordRequirements} />
                {/* Only show error message from errors state if present AND password requirements are NOT visible */}
                {errors.password && !showPasswordRequirements && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Promotional Code Field (hidden for now) */}
              <div className="hidden">
                <label htmlFor="promotional_code" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("promotionalCodeLabel")}
                </label>
                <input
                  id="promotional_code"
                  name="promotional_code"
                  type="text"
                  value={formData.promotional_code}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.promotional_code ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder={t("promotionalCodePlaceholder")}
                />
                {errors.promotional_code && <p className="mt-1 text-sm text-red-600">{errors.promotional_code}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                disabled={loading || emailValidation.status === "checking" || emailValidation.status === "unavailable"}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    {t("creatingAccount")}
                  </div>
                ) : (
                  t("createAccountButton")
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  {t("signInLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Dark background with branding */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center text-white p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{t("rightSideTitle")}</h1>
            <p className="text-gray-300 mb-8">
              {t("rightSideSubtitle")}{" "}
              <Link href="/signup/general" className="text-blue-400 hover:text-blue-300 underline">
                {t("rightSideLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}