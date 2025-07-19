"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("SignIn")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        userType: "manager", // Default to manager for business login
        redirect: false,
      })

      if (result?.error) {
        setError(t("invalidCredentials"))
      } else {
        // Get session to determine redirect
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (session?.user?.redirectTo) {
          router.push(session.user.redirectTo)
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      setError(t("connectionError"))
    } finally {
      setLoading(false)
    }
  }

  const message = searchParams?.get("message")

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("brandTitle")}</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("pageTitle")}</h2>

          {message && <div className="mb-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">{message}</div>}

          {error && <div className="mb-4 p-3 rounded-md bg-red-100 text-red-800 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-gray-100 border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder={t("emailPlaceholder")}
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-gray-100 border-0 rounded-md focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder={t("passwordPlaceholder")}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium transition-colors"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                  {t("signingIn")}
                </div>
              ) : (
                t("signInButton")
              )}
            </button>
          </form>

          <div className="mt-8 space-y-2 text-sm">
            <Link href="/signup/business" className="block text-gray-900 hover:text-blue-600 transition-colors">
              {t("createBusinessAccount")}
            </Link>
            <Link href="/signin/general" className="block text-gray-900 hover:text-blue-600 transition-colors">
              {t("generalAccess")}
            </Link>
            <Link href="/about" className="block text-gray-900 hover:text-blue-600 transition-colors">
              {t("discoverTwenter")}
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Dark background */}
      <div className="flex-1 bg-gray-900"></div>
    </div>
  )
}
