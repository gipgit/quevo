"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { signIn } from "next-auth/react"
import { TriangleAlert as ExclamationTriangleIcon, X as XMarkIcon, CheckCircle as CheckCircleIcon, Eye as EyeIcon, EyeOff as EyeSlashIcon } from 'lucide-react'
import LocaleSwitcherButton from "@/components/ui/LocaleSwitcherButton"
import LocaleSelectModal from "@/components/ui/LocaleSelectModal"
import { useLocaleSwitcher } from "@/hooks/useLocaleSwitcher"

interface ErrorState {
  message: string
  type: "credentials" | "system" | "network"
  show: boolean
}

export default function ManagerSignInPage() {
  const t = useTranslations("BusinessSignIn")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorState>({ message: "", type: "credentials", show: false })
  const [showPassword, setShowPassword] = useState(false)
  
  const { isModalOpen, setIsModalOpen, currentLocale, availableLocales, switchLocale } = useLocaleSwitcher()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error.show) {
      setError(prev => ({ ...prev, show: false }))
    }
  }

  const showError = (message: string, type: "credentials" | "system" | "network" = "credentials") => {
    setError({ message, type, show: true })
  }

  const hideError = () => {
    setError(prev => ({ ...prev, show: false }))
  }

  const getErrorType = (errorMessage: string): "credentials" | "system" | "network" => {
    const credentialErrors = [
      "Credenziali non valide",
      "Invalid credentials",
      "CredentialsSignin",
      "User not found",
      "User does not exist",
      "Account not active",
      "Account in attesa di verifica",
      "Account pending verification",
      "Password is incorrect",
      "Wrong password",
      "Email or password is incorrect",
      "Email o password non corretti",
      "Configuration" // NextAuth sanitizes account status errors to "Configuration"
    ]
    
    const networkErrors = [
      "Failed to fetch",
      "Network error",
      "Connection error",
      "Timeout",
      "ECONNREFUSED",
      "ENOTFOUND"
    ]

    const systemErrors = [
      "There was a problem with the server configuration",
      "Configuration",
      "Internal server error",
      "Server error"
    ]

    if (credentialErrors.some(err => errorMessage.toLowerCase().includes(err.toLowerCase()))) {
      return "credentials"
    } else if (networkErrors.some(err => errorMessage.toLowerCase().includes(err.toLowerCase()))) {
      return "network"
    } else if (systemErrors.some(err => errorMessage.toLowerCase().includes(err.toLowerCase()))) {
      return "system"
    } else {
      // Default to credentials for unknown errors to be more user-friendly
      return "credentials"
    }
  }

  const getErrorMessage = (errorMessage: string): string => {
    // Map server error messages to user-friendly messages
    const errorMap: Record<string, string> = {
      // Credential errors
      "Credenziali non valide": "Email o password non corretti. Riprova.",
      "Invalid credentials": "Email o password non corretti. Riprova.",
      "CredentialsSignin": "Email o password non corretti. Riprova.",
      "User not found": "Utente non trovato. Verifica la tua email.",
      "User does not exist": "Utente non trovato. Verifica la tua email.",
      "Password is incorrect": "Password non corretta. Riprova.",
      "Wrong password": "Password non corretta. Riprova.",
      "Email or password is incorrect": "Email o password non corretti. Riprova.",
      "Email o password non corretti": "Email o password non corretti. Riprova.",
      
      // Account status errors
      "Account non attivo": "Il tuo account non è ancora attivo. Controlla la tua email per il link di attivazione.",
      "Account not active": "Il tuo account non è ancora attivo. Controlla la tua email per il link di attivazione.",
      "Account in attesa di verifica": "Il tuo account è in attesa di verifica da parte dell'amministratore.",
      "Account pending verification": "Il tuo account è in attesa di verifica da parte dell'amministratore.",
      "Account non attivo. Controlla la tua email per il link di attivazione.": "Il tuo account non è ancora attivo. Controlla la tua email per il link di attivazione.",
      
      // Network errors
      "Failed to fetch": "Errore di connessione. Verifica la tua connessione internet e riprova.",
      "Network error": "Errore di connessione. Verifica la tua connessione internet e riprova.",
      "Connection error": "Errore di connessione. Verifica la tua connessione internet e riprova.",
      "Timeout": "Timeout della connessione. Riprova più tardi.",
      "ECONNREFUSED": "Impossibile connettersi al server. Riprova più tardi.",
      "ENOTFOUND": "Impossibile raggiungere il server. Verifica la tua connessione internet.",
      
      // System errors - but "Configuration" might be a sanitized version of account status errors
      "There was a problem with the server configuration": "Errore di configurazione del server. Riprova più tardi.",
      "Configuration": "Il tuo account non è ancora attivo. Controlla la tua email per il link di attivazione.",
      "Internal server error": "Errore interno del server. Riprova più tardi.",
      "Server error": "Errore del server. Riprova più tardi."
    }

    // Try exact match first
    if (errorMap[errorMessage]) {
      return errorMap[errorMessage]
    }
    
    // Try case-insensitive match
    const lowerErrorMessage = errorMessage.toLowerCase()
    for (const [key, value] of Object.entries(errorMap)) {
      if (lowerErrorMessage.includes(key.toLowerCase())) {
        return value
      }
    }
    
    // Default to a user-friendly credential error message
    return "Email o password non corretti. Riprova."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    hideError()

    // Clear any existing session data before attempting new login
    // This prevents conflicts when manually navigating back to signin
    try {
      // Clear session storage
      sessionStorage.clear()
      
      // Clear ALL cookies except locale settings to ensure complete session reset
      const cookies = document.cookie.split(";")
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        // Clear all cookies except locale settings
        if (name && !name.startsWith('NEXT_LOCALE') && !name.startsWith('next-i18next')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        }
      })
      
      // Clear local storage
      localStorage.clear()
      
      // Add a small delay to ensure cookies are cleared
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.warn("Error clearing session data:", error)
    }

    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        userType: "manager",
        redirect: false,
      })

      if (res?.error) {
        console.log("Raw error from server:", res.error)
        const errorType = getErrorType(res.error)
        const userFriendlyMessage = getErrorMessage(res.error)
        console.log("Error type:", errorType)
        console.log("User friendly message:", userFriendlyMessage)
        showError(userFriendlyMessage, errorType)
        setLoading(false)
      } else if (res?.ok) {
        // Success - force session refresh and redirect to dashboard
        console.log("SignIn successful, refreshing session and redirecting to dashboard...")
        
        try {
          // Call session refresh endpoint to ensure fresh server-side session
          await fetch('/api/auth/refresh-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          console.warn('Session refresh failed, continuing with redirect:', error)
        }
        
        // Get the current locale from the URL
        const pathname = window.location.pathname
        const locale = pathname.split('/')[1] || 'it'
        // Force a complete page reload to ensure fresh session data
        window.location.href = `/${locale}/dashboard?t=${Date.now()}&fresh=true`
        return
      } else {
        showError(t("unexpectedError"), "system")
        setLoading(false)
      }
    } catch (err: any) {
      const errorMessage = err.message || t("connectionError")
      showError(errorMessage, "network")
      setLoading(false)
    }
  }

  // Auto-hide error after 10 seconds
  useEffect(() => {
    if (error.show) {
      const timer = setTimeout(() => {
        hideError()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [error.show])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 relative overflow-hidden">
      {/* Light Neutral Gradient Layer 1 */}
      <div 
        className="absolute z-1"
        style={{
          background: 'linear-gradient(143.241deg, rgb(255, 255, 255) 0%, rgb(252, 253, 254) 31.087%, rgb(248, 250, 252) 70.4599%, rgb(250, 251, 253) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.8,
          height: '600px',
          left: '-300px',
          top: '-200px',
          width: '800px'
        }}
      ></div>
      
      {/* Light Neutral Gradient Layer 2 */}
      <div 
        className="absolute z-1"
        style={{
          background: 'linear-gradient(140.017deg, rgb(255, 255, 255) 0%, rgb(252, 253, 254) 60.8266%, rgb(250, 251, 253) 100%)',
          filter: 'blur(80px)',
          borderRadius: '100%',
          opacity: 0.6,
          height: '600px',
          right: '-200px',
          bottom: '-150px',
          width: '800px'
        }}
      ></div>
      
      {/* Bottom Color Layer 1 */}
      <div 
        className="absolute z-1"
        style={{
          background: '#8A5FBF',
          filter: 'blur(80px)',
          opacity: 0.9,
          height: '180px',
          bottom: '-90px',
          left: '0',
          width: '33.33%',
          borderRadius: '100%'
        }}
      ></div>
      
      {/* Bottom Color Layer 2 */}
      <div 
        className="absolute z-1"
        style={{
          background: '#FFB366',
          filter: 'blur(80px)',
          opacity: 0.9,
          height: '180px',
          bottom: '-90px',
          left: '33.33%',
          width: '33.33%',
          borderRadius: '100%'
        }}
      ></div>
      
      {/* Bottom Color Layer 3 */}
      <div 
        className="absolute z-1"
        style={{
          background: '#7ED321',
          filter: 'blur(80px)',
          opacity: 0.9,
          height: '180px',
          bottom: '-90px',
          left: '66.66%',
          width: '33.33%',
          borderRadius: '100%'
        }}
      ></div>
      
      <div className="text-center mb-8 relative z-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Flowia</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>
      
                 <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-[380px] relative z-10">
         
         <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {tCommon("mailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error.show && error.type === "credentials" ? "border-red-300" : "border-gray-300"
              }`}
              disabled={loading}
              placeholder={tCommon("emailPlaceholder")}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              {tCommon("passwordLabel")}
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 text-base md:text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  error.show && error.type === "credentials" ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
                placeholder={tCommon("passwordPlaceholder")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg font-medium text-base md:text-sm transition-all duration-200 flex items-center justify-center relative overflow-hidden ${
              loading
                ? "bg-black text-white cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800 active:transform active:scale-95"
            }`}
            disabled={loading}
          >
            {loading && (
              <div className="absolute inset-0 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 w-1/3"
                  style={{
                    animation: 'shimmer 2s ease-in-out infinite',
                    left: '-100%'
                  }}
                ></div>
              </div>
            )}
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              tCommon("loginButton")
            )}
                     </button>
         </form>
         
                   {/* Error Toast */}
          {error.show && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 shadow-md animate-in slide-in-from-top-2 duration-300 relative ${
              error.type === "credentials" 
                ? "bg-red-50 border-red-400 text-red-700" 
                : error.type === "network"
                ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                : "bg-orange-50 border-orange-400 text-orange-700"
            }`}>
                             <p className="text-sm font-medium">{error.message}</p>
              <button
                onClick={hideError}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
         
                </div>
      
             {/* Links and locale switcher below the card */}
       <div className="mt-6 text-center relative z-10">
         <p className="text-sm text-gray-600 mb-4">
           {t("noAccountText")}{" "}
           <a 
             href="/signup/business" 
             className="text-gray-600 hover:text-gray-700 underline font-medium transition-colors"
           >
             {tCommon("createAccountLink")}
           </a>
         </p>
         
         {/* Locale Switcher */}
         <div className="flex justify-center">
           <LocaleSwitcherButton 
             onClick={() => setIsModalOpen(true)}
             className="text-gray-600 hover:text-gray-800"
           />
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
