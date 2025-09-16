import { useState, useEffect } from 'react'

interface AICreditsStatus {
  creditsAvailable: number
  creditsUsed: number
  periodStart: Date | null
  periodEnd: Date | null
  lastUpdate: Date
}

interface FeatureCosts {
  MARKETING_EMAIL_CONTENT: number
  SOCIAL_MEDIA_CONTENT: number
  SUPPORT_RESPONSE_GENERATION: number
  SUPPORT_TEXT_ENHANCEMENT: number
}

interface AICreditsData {
  creditsStatus: AICreditsStatus
  featureCosts: FeatureCosts
}

export function useAICredits(businessId: string | null) {
  const [creditsData, setCreditsData] = useState<AICreditsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = async () => {
    if (!businessId) {
      setCreditsData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/businesses/${businessId}/ai-credits`)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch AI credits: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      setCreditsData(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching AI credits:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [businessId])

  return {
    creditsStatus: creditsData?.creditsStatus || null,
    featureCosts: creditsData?.featureCosts || null,
    loading,
    error,
    refetch: fetchCredits
  }
}
