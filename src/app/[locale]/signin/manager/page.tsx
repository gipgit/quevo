"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { signIn } from "next-auth/react"

export default function ManagerSignInPage() {
  const t = useTranslations("SignIn")
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
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        userType: "manager",
        redirect: false,
      })
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      } else {
        // Keep loading state active during redirect
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quevo</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("pageTitle")}</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            placeholder={t("emailPlaceholder")}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            placeholder={t("passwordPlaceholder")}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-md font-medium transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t("signingIn") : t("signInButton")}
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            No account?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
