import prisma from "@/lib/prisma"

export interface EmailRateLimitConfig {
  tokensAvailable: number
  tokensCapacity: number
  fillRate: number // tokens per hour
  lastRefill: Date
}

export interface EmailRateLimitResult {
  allowed: boolean
  tokensRemaining: number
  tokensCapacity: number
  nextRefillTime?: Date
  errorMessage?: string
}

export class EmailRateLimiter {
  /**
   * Initialize or get the rate limit configuration for a business
   */
  static async initializeRateLimit(businessId: string, planId: number): Promise<EmailRateLimitConfig> {
    // Get plan limits
    const planLimits = await prisma.planlimit.findMany({
      where: {
        plan_id: planId,
        feature: {
          in: ['email_rate_limit', 'email_burst_limit']
        }
      }
    })

    const rateLimit = planLimits.find(limit => limit.feature === 'email_rate_limit')
    const burstLimit = planLimits.find(limit => limit.feature === 'email_burst_limit')

    const fillRate = rateLimit?.value || 10 // default 10 per hour
    const capacity = burstLimit?.value || 20 // default 20 burst limit

    // Check if rate limit record exists
    let rateLimitRecord = await prisma.emailratelimit.findUnique({
      where: { business_id: businessId }
    })

    if (!rateLimitRecord) {
      // Create new rate limit record
      rateLimitRecord = await prisma.emailratelimit.create({
        data: {
          business_id: businessId,
          tokens_available: capacity,
          tokens_capacity: capacity,
          fill_rate: fillRate,
          last_refill: new Date()
        }
      })
    }

    return {
      tokensAvailable: rateLimitRecord.tokens_available,
      tokensCapacity: rateLimitRecord.tokens_capacity,
      fillRate: rateLimitRecord.fill_rate,
      lastRefill: rateLimitRecord.last_refill || new Date()
    }
  }

  /**
   * Check if an email can be sent and consume a token if allowed
   */
  static async checkAndConsumeToken(businessId: string, planId: number): Promise<EmailRateLimitResult> {
    const config = await this.initializeRateLimit(businessId, planId)
    
    // Refill tokens based on time passed
    const now = new Date()
    const timePassed = now.getTime() - config.lastRefill.getTime()
    const hoursPassed = timePassed / (1000 * 60 * 60)
    
    let newTokensAvailable = config.tokensAvailable
    let newLastRefill = config.lastRefill

    if (hoursPassed >= 1) {
      // Refill tokens
      const tokensToAdd = Math.floor(hoursPassed * config.fillRate)
      newTokensAvailable = Math.min(config.tokensCapacity, config.tokensAvailable + tokensToAdd)
      newLastRefill = now
    }

    // Check if we can consume a token
    if (newTokensAvailable < 1) {
      // Calculate next refill time
      const tokensNeeded = 1 - newTokensAvailable
      const hoursUntilRefill = tokensNeeded / config.fillRate
      const nextRefillTime = new Date(now.getTime() + (hoursUntilRefill * 60 * 60 * 1000))

      return {
        allowed: false,
        tokensRemaining: newTokensAvailable,
        tokensCapacity: config.tokensCapacity,
        nextRefillTime,
        errorMessage: `Email rate limit exceeded. You can send ${config.fillRate} emails per hour. Next refill in ${Math.ceil(hoursUntilRefill * 60)} minutes.`
      }
    }

    // Consume the token
    const finalTokensAvailable = newTokensAvailable - 1

    // Update the database
    await prisma.emailratelimit.upsert({
      where: { business_id: businessId },
      update: {
        tokens_available: finalTokensAvailable,
        last_refill: newLastRefill,
        updated_at: now
      },
      create: {
        business_id: businessId,
        tokens_available: finalTokensAvailable,
        tokens_capacity: config.tokensCapacity,
        fill_rate: config.fillRate,
        last_refill: newLastRefill
      }
    })

    return {
      allowed: true,
      tokensRemaining: finalTokensAvailable,
      tokensCapacity: config.tokensCapacity
    }
  }

  /**
   * Get current rate limit status without consuming tokens
   */
  static async getRateLimitStatus(businessId: string, planId: number): Promise<EmailRateLimitResult> {
    const config = await this.initializeRateLimit(businessId, planId)
    
    // Refill tokens based on time passed
    const now = new Date()
    const timePassed = now.getTime() - config.lastRefill.getTime()
    const hoursPassed = timePassed / (1000 * 60 * 60)
    
    let newTokensAvailable = config.tokensAvailable

    if (hoursPassed >= 1) {
      // Refill tokens
      const tokensToAdd = Math.floor(hoursPassed * config.fillRate)
      newTokensAvailable = Math.min(config.tokensCapacity, config.tokensAvailable + tokensToAdd)
    }

    return {
      allowed: newTokensAvailable >= 1,
      tokensRemaining: newTokensAvailable,
      tokensCapacity: config.tokensCapacity
    }
  }

  /**
   * Reset rate limit for a business (useful for testing or manual overrides)
   */
  static async resetRateLimit(businessId: string, planId: number): Promise<void> {
    const config = await this.initializeRateLimit(businessId, planId)
    
    await prisma.emailratelimit.upsert({
      where: { business_id: businessId },
      update: {
        tokens_available: config.tokensCapacity,
        last_refill: new Date(),
        updated_at: new Date()
      },
      create: {
        business_id: businessId,
        tokens_available: config.tokensCapacity,
        tokens_capacity: config.tokensCapacity,
        fill_rate: config.fillRate,
        last_refill: new Date()
      }
    })
  }
}
