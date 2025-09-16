import prisma from "@/lib/prisma"

export interface AIContentGenerationRateLimitConfig {
  generationsAvailable: number
  fillRate: number // generations per week
  lastRefill: Date
}

export interface AIContentGenerationRateLimitResult {
  allowed: boolean
  generationsAvailable: number
  fillRate: number
  nextRefillTime?: Date
  errorMessage?: string
}

export class AIContentGenerationRateLimiter {
  private static readonly REFILL_INTERVAL_HOURS = 168 // 7 days (1 week)
  private static readonly UNLIMITED_GENERATION = false // Set to false to enable rate limiting

  static async initializeRateLimit(businessId: string, planId: number): Promise<AIContentGenerationRateLimitConfig> {
    // Get plan limits for AI content generation
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: planId,
        feature: 'ai_content_generation'
      }
    })

    const rateLimit = planLimits.find(limit => limit.feature === 'ai_content_generation')
    const fillRate = rateLimit?.value || 1 // Default to 1 generation per week

    // Check if rate limit record exists
    let rateLimitRecord = await (prisma as any).aicontentgenerationratelimit.findUnique({
      where: { business_id: businessId }
    })

    if (!rateLimitRecord) {
      // Create new rate limit record
      rateLimitRecord = await (prisma as any).aicontentgenerationratelimit.create({
        data: {
          business_id: businessId,
          generations_available: fillRate,
          fill_rate: fillRate,
          last_refill: new Date()
        }
      })
    }

    return {
      generationsAvailable: rateLimitRecord.generations_available,
      fillRate: rateLimitRecord.fill_rate,
      lastRefill: rateLimitRecord.last_refill
    }
  }

  static async checkAndConsumeToken(businessId: string, planId: number): Promise<AIContentGenerationRateLimitResult> {
    // If unlimited generation is enabled, always allow
    if (this.UNLIMITED_GENERATION) {
      return {
        allowed: true,
        generationsAvailable: 999, // Show a high number for unlimited
        fillRate: 999
      }
    }

    const config = await this.initializeRateLimit(businessId, planId)
    
    // Check if it's time to refill tokens
    const now = new Date()
    const timeSinceLastRefill = now.getTime() - config.lastRefill.getTime()
    const hoursSinceLastRefill = timeSinceLastRefill / (1000 * 60 * 60)
    
    let generationsAvailable = config.generationsAvailable
    let lastRefill = config.lastRefill

    // Refill tokens if enough time has passed
    if (hoursSinceLastRefill >= this.REFILL_INTERVAL_HOURS) {
      const weeksPassed = Math.floor(hoursSinceLastRefill / this.REFILL_INTERVAL_HOURS)
      generationsAvailable = config.fillRate * weeksPassed
      lastRefill = new Date(now.getTime() - (hoursSinceLastRefill % this.REFILL_INTERVAL_HOURS) * 60 * 60 * 1000)
    }

    // Check if we have tokens available
    if (generationsAvailable < 1) {
      const hoursUntilRefill = this.REFILL_INTERVAL_HOURS - (hoursSinceLastRefill % this.REFILL_INTERVAL_HOURS)
      const nextRefillTime = new Date(now.getTime() + hoursUntilRefill * 60 * 60 * 1000)
      
      return {
        allowed: false,
        generationsAvailable: 0,
        fillRate: config.fillRate,
        nextRefillTime,
        errorMessage: `AI content generation rate limit exceeded. You can generate ${config.fillRate} content pieces per week. Next refill in ${Math.ceil(hoursUntilRefill / 24)} days.`
      }
    }

    // Consume one token
    generationsAvailable -= 1

    // Update the database
    await (prisma as any).aicontentgenerationratelimit.upsert({
      where: { business_id: businessId },
      update: {
        generations_available: generationsAvailable,
        last_refill: lastRefill,
        updated_at: now
      },
      create: {
        business_id: businessId,
        generations_available: generationsAvailable,
        fill_rate: config.fillRate,
        last_refill: lastRefill
      }
    })

    return {
      allowed: true,
      generationsAvailable,
      fillRate: config.fillRate
    }
  }

  static async getRateLimitStatus(businessId: string, planId: number): Promise<AIContentGenerationRateLimitResult> {
    // If unlimited generation is enabled, always show unlimited status
    if (this.UNLIMITED_GENERATION) {
      return {
        allowed: true,
        generationsAvailable: 999, // Show a high number for unlimited
        fillRate: 999
      }
    }

    const config = await this.initializeRateLimit(businessId, planId)
    
    // Check if it's time to refill tokens
    const now = new Date()
    const timeSinceLastRefill = now.getTime() - config.lastRefill.getTime()
    const hoursSinceLastRefill = timeSinceLastRefill / (1000 * 60 * 60)
    
    let generationsAvailable = config.generationsAvailable

    // Refill tokens if enough time has passed
    if (hoursSinceLastRefill >= this.REFILL_INTERVAL_HOURS) {
      const weeksPassed = Math.floor(hoursSinceLastRefill / this.REFILL_INTERVAL_HOURS)
      generationsAvailable = config.fillRate * weeksPassed
      
      // Update the database with refilled tokens
      const newLastRefill = new Date(now.getTime() - (hoursSinceLastRefill % this.REFILL_INTERVAL_HOURS) * 60 * 60 * 1000)
      await (prisma as any).aicontentgenerationratelimit.upsert({
        where: { business_id: businessId },
        update: {
          generations_available: generationsAvailable,
          last_refill: newLastRefill,
          updated_at: now
        },
        create: {
          business_id: businessId,
          generations_available: generationsAvailable,
          fill_rate: config.fillRate,
          last_refill: newLastRefill
        }
      })
    }

    return {
      allowed: generationsAvailable > 0,
      generationsAvailable,
      fillRate: config.fillRate
    }
  }
}
