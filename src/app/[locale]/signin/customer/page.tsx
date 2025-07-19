"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function CustomerSignInPage() {
  const t = useTranslations("CustomerSignIn")
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/signin-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || t("loginError"))
      router.push("/") // Redirect to home or customer dashboard
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("title")}</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t("emailLabel")}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t("passwordLabel")}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t("loading") : t("loginButton")}
        </button>
      </form>
    </div>
  )
}
