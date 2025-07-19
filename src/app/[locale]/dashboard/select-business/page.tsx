"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

interface Business {
  business_id: string
  business_name: string
  business_city: string
  business_img_profile?: string
}

export default function BusinessSelectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations("Dashboard")
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/signin")
      return
    }

    // Fetch user's businesses
    const fetchBusinesses = async () => {
      try {
        const response = await fetch("/api/user/businesses")
        if (response.ok) {
          const data = await response.json()
          setBusinesses(data.businesses)
        }
      } catch (error) {
        console.error("Error fetching businesses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center text-white">
          <ArrowPathIcon className="w-6 h-6 mr-2 animate-spin" />
          {t("loading")}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleBusinessSelect = (businessId: string) => {
    router.push(`/dashboard/business/${businessId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium mb-8">
            {t("welcome", { name: session.user?.name?.split(" ")[0] || "" })}
          </h1>
          <h2 className="text-3xl font-bold mb-12">{t("whatToManage")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {businesses.map((business) => (
            <button
              key={business.business_id}
              onClick={() => handleBusinessSelect(business.business_id)}
              className="bg-white text-gray-900 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 mb-4 overflow-hidden">
                  <Image
                    src={business.business_img_profile || "/placeholder.svg?height=64&width=64"}
                    alt={business.business_name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm leading-tight">{business.business_name}</h3>
                <p className="text-xs text-gray-500 mt-1">{business.business_city}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="text-2xl font-bold">twenter</div>
        </div>
      </div>
    </div>
  )
}
