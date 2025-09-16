import prisma from "@/lib/prisma";

// AI Feature Cost Structure
export const AI_FEATURE_COSTS = {
  MARKETING_EMAIL_CONTENT: 1,        // 1 credit per email generation
  SOCIAL_MEDIA_CONTENT: 2,           // 2 credits per social media content generation (more complex)
  SUPPORT_RESPONSE_GENERATION: 1,    // 1 credit per support response
  SUPPORT_TEXT_ENHANCEMENT: 1,       // 1 credit per text enhancement
  SERVICE_RESPONSE_GENERATION: 1,    // 1 credit per service request response
} as const

export type AIFeatureType = keyof typeof AI_FEATURE_COSTS

export interface AICreditsTransaction {
  business_id: string;
  transaction_type: 'monthly_allocation' | 'purchase' | 'usage' | 'rollover' | 'bonus' | 'compensation' | 'refund';
  amount: number; // Positive for additions, negative for usage
  description: string;
}

export interface AICreditsStatus {
  creditsAvailable: number;
  creditsUsed: number;
  periodStart: Date | null;
  periodEnd: Date | null;
  lastUpdate: Date;
}

export interface AICreditsConsumptionResult {
  success: boolean;
  creditsRemaining: number;
  creditsConsumed: number;
  errorMessage?: string;
}

export interface PlanRolloverSettings {
  ai_credits_rollover_max_percent: number;
  is_unlimited_ai: boolean;
}

export class AICreditsManager {
  /**
   * Get current AI credits status for a business
   */
  static async getCreditsStatus(businessId: string): Promise<AICreditsStatus> {
    try {
      console.log('🔍 [AICreditsManager] Getting credits for business:', businessId)
      const balance = await prisma.aicreditbalance.findUnique({
        where: { business_id: businessId }
      })
      console.log('📊 [AICreditsManager] Database balance result:', balance)

      if (!balance) {
        // Initialize credits for new business (default to plan 1 for now)
        await this.initializeCreditsForBusiness(businessId, 1)
        const newBalance = await prisma.aicreditbalance.findUnique({
          where: { business_id: businessId }
        })
        
        return {
          creditsAvailable: newBalance?.credits_available || 0,
          creditsUsed: 0,
          periodStart: newBalance?.credits_period_start || null,
          periodEnd: newBalance?.credits_period_end || null,
          lastUpdate: newBalance?.last_credit_update || new Date()
        }
      }

      // Calculate credits used this period
      const periodStart = balance.credits_period_start || new Date()
      const transactions = await prisma.aicredittransaction.findMany({
        where: {
          business_id: businessId,
          transaction_type: 'usage',
          created_at: { gte: periodStart }
        }
      })

      const creditsUsed = Math.abs(transactions.reduce((sum, tx) => sum + tx.amount, 0))

      return {
        creditsAvailable: balance.credits_available,
        creditsUsed,
        periodStart: balance.credits_period_start,
        periodEnd: balance.credits_period_end,
        lastUpdate: balance.last_credit_update
      }
    } catch (error) {
      console.error('Error getting AI credits status:', error)
      return {
        creditsAvailable: 0,
        creditsUsed: 0,
        periodStart: null,
        periodEnd: null,
        lastUpdate: new Date()
      }
    }
  }

  /**
   * Check if business has enough credits for a feature
   */
  static async hasEnoughCredits(businessId: string, featureType: AIFeatureType): Promise<boolean> {
    try {
      const cost = AI_FEATURE_COSTS[featureType]
      const status = await this.getCreditsStatus(businessId)
      return status.creditsAvailable >= cost
    } catch (error) {
      console.error('Error checking AI credits:', error)
      return false
    }
  }

  /**
   * Consume credits for an AI feature
   */
  static async consumeCredits(
    businessId: string, 
    featureType: AIFeatureType, 
    description?: string
  ): Promise<AICreditsConsumptionResult> {
    try {
      const cost = AI_FEATURE_COSTS[featureType]
      
      // Check if business has enough credits
      const hasCredits = await this.hasEnoughCredits(businessId, featureType)
      if (!hasCredits) {
        const status = await this.getCreditsStatus(businessId)
        return {
          success: false,
          creditsRemaining: status.creditsAvailable,
          creditsConsumed: 0,
          errorMessage: `Insufficient AI credits. You need ${cost} credits but only have ${status.creditsAvailable} available.`
        }
      }

      // Use credits
      const success = await this.useCredits(
        businessId, 
        cost, 
        description || `AI ${featureType.replace(/_/g, ' ').toLowerCase()}`
      )

      if (!success) {
        return {
          success: false,
          creditsRemaining: 0,
          creditsConsumed: 0,
          errorMessage: 'Failed to consume credits'
        }
      }

      // Get updated status
      const updatedStatus = await this.getCreditsStatus(businessId)

      return {
        success: true,
        creditsRemaining: updatedStatus.creditsAvailable,
        creditsConsumed: cost,
        errorMessage: undefined
      }
    } catch (error) {
      console.error('Error consuming AI credits:', error)
      return {
        success: false,
        creditsRemaining: 0,
        creditsConsumed: 0,
        errorMessage: 'An error occurred while consuming credits'
      }
    }
  }

  /**
   * Get plan rollover settings
   */
  static async getPlanRolloverSettings(planId: number): Promise<PlanRolloverSettings | null> {
    const plan = await prisma.plan.findUnique({
      where: { plan_id: planId },
      select: {
        ai_credits_rollover_max_percent: true,
        is_unlimited_ai: true,
      }
    });

    if (!plan) return null;

    return {
      ai_credits_rollover_max_percent: plan.ai_credits_rollover_max_percent || 1.0,
      is_unlimited_ai: plan.is_unlimited_ai || false,
    };
  }

  /**
   * Check if business has enough credits for a transaction
   */
  static async hasEnoughCreditsForAmount(businessId: string, requiredCredits: number): Promise<boolean> {
    const status = await this.getCreditsStatus(businessId);
    return status.creditsAvailable >= requiredCredits;
  }

  /**
   * Use AI credits (decrement counter)
   */
  static async useCredits(
    businessId: string, 
    creditsToUse: number, 
    description: string
  ): Promise<boolean> {
    if (creditsToUse <= 0) return false;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Lock the balance record for update
        const balance = await tx.aicreditbalance.findUnique({
          where: { business_id: businessId }
        });

        if (!balance) {
          throw new Error('Business credit balance not found');
        }

        if (balance.credits_available < creditsToUse) {
          throw new Error('Insufficient credits');
        }

        const newAvailable = balance.credits_available - creditsToUse;

        // Update balance
        await tx.aicreditbalance.update({
          where: { business_id: businessId },
          data: {
            credits_available: newAvailable,
            last_credit_update: new Date(),
          }
        });

        // Create transaction log
        await tx.aicredittransaction.create({
          data: {
            business_id: businessId,
            transaction_type: 'usage',
            amount: -creditsToUse, // Negative for usage
            description,
          }
        });

        return { success: true, remaining: newAvailable };
      });

      return result.success;
    } catch (error) {
      console.error('Error using AI credits:', error);
      return false;
    }
  }

  /**
   * Add AI credits (increment counter)
   */
  static async addCredits(
    businessId: string,
    creditsToAdd: number,
    transactionType: 'monthly_allocation' | 'purchase' | 'rollover' | 'bonus' | 'compensation' | 'refund',
    description: string
  ): Promise<boolean> {
    if (creditsToAdd <= 0) return false;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get or create balance record
        let balance = await tx.aicreditbalance.findUnique({
          where: { business_id: businessId }
        });

        if (!balance) {
          // Create new balance record
          balance = await tx.aicreditbalance.create({
            data: {
              business_id: businessId,
              credits_available: 0,
              last_credit_update: new Date(),
            }
          });
        }

        const newAvailable = balance.credits_available + creditsToAdd;

        // Update balance
        await tx.aicreditbalance.update({
          where: { business_id: businessId },
          data: {
            credits_available: newAvailable,
            last_credit_update: new Date(),
          }
        });

        // Create transaction log
        await tx.aicredittransaction.create({
          data: {
            business_id: businessId,
            transaction_type: transactionType,
            amount: creditsToAdd, // Positive for additions
            description,
          }
        });

        return { success: true, remaining: newAvailable };
      });

      return result.success;
    } catch (error) {
      console.error('Error adding AI credits:', error);
      return false;
    }
  }

  /**
   * Allocate credits for a new billing period
   */
  static async allocateCreditsForPeriod(
    businessId: string,
    creditsToAllocate: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<boolean> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get current balance and plan settings
        const balance = await tx.aicreditbalance.findUnique({
          where: { business_id: businessId }
        });

        const business = await tx.business.findUnique({
          where: { business_id: businessId },
          include: { plan: true }
        });

        if (!business || !business.plan) {
          throw new Error('Business or plan not found');
        }

        const rolloverSettings = await this.getPlanRolloverSettings(business.plan_id);

        // Calculate rollover credits
        let rolloverCredits = 0;
        if (balance && balance.credits_available > 0 && rolloverSettings) {
          const maxRollover = Math.floor(creditsToAllocate * rolloverSettings.ai_credits_rollover_max_percent);
          rolloverCredits = Math.min(balance.credits_available, maxRollover);
        }

        const totalCredits = creditsToAllocate + rolloverCredits;

        // Update or create balance
        if (balance) {
          await tx.aicreditbalance.update({
            where: { business_id: businessId },
            data: {
              credits_available: totalCredits,
              credits_period_start: periodStart,
              credits_period_end: periodEnd,
              last_credit_update: new Date(),
            }
          });
        } else {
          await tx.aicreditbalance.create({
            data: {
              business_id: businessId,
              credits_available: totalCredits,
              credits_period_start: periodStart,
              credits_period_end: periodEnd,
              last_credit_update: new Date(),
            }
          });
        }

        // Log allocation transaction
        if (creditsToAllocate > 0) {
          await tx.aicredittransaction.create({
            data: {
              business_id: businessId,
              transaction_type: 'monthly_allocation',
              amount: creditsToAllocate,
              description: `Credits allocated for new billing period (${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]})`,
            }
          });
        }

        // Log rollover transaction
        if (rolloverCredits > 0) {
          await tx.aicredittransaction.create({
            data: {
              business_id: businessId,
              transaction_type: 'rollover',
              amount: rolloverCredits,
              description: `Credits rolled over from previous period (${rolloverCredits} credits)`,
            }
          });
        }

        return { success: true, totalCredits, rolloverCredits };
      });

      return result.success;
    } catch (error) {
      console.error('Error allocating credits for period:', error);
      return false;
    }
  }

  /**
   * Get transaction history for a business
   */
  static async getTransactionHistory(
    businessId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    return await prisma.aicredittransaction.findMany({
      where: { business_id: businessId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
      select: {
        transaction_id: true,
        transaction_type: true,
        amount: true,
        description: true,
        created_at: true,
      }
    });
  }

  /**
   * Get credits usage statistics
   */
  static async getUsageStats(businessId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await prisma.aicredittransaction.aggregate({
      where: {
        business_id: businessId,
        transaction_type: 'usage',
        created_at: { gte: startDate }
      },
      _sum: {
        amount: true
      },
      _count: {
        transaction_id: true
      }
    });

    return {
      total_used: Math.abs(stats._sum.amount || 0),
      transaction_count: stats._count.transaction_id,
      period_days: days,
    };
  }

  /**
   * Check if credits period needs renewal
   */
  static async checkPeriodRenewal(businessId: string): Promise<boolean> {
    const balance = await prisma.aicreditbalance.findUnique({
      where: { business_id: businessId },
      select: {
        credits_period_end: true,
      }
    });

    if (!balance || !balance.credits_period_end) {
      return false;
    }

    return new Date() >= balance.credits_period_end;
  }

  /**
   * Auto-renew credits if period has ended
   */
  static async autoRenewCredits(businessId: string): Promise<boolean> {
    const needsRenewal = await this.checkPeriodRenewal(businessId);
    if (!needsRenewal) return false;

    // Get plan credits allocation
    const business = await prisma.business.findUnique({
      where: { business_id: businessId },
      include: { plan: true }
    });

    if (!business || !business.plan) return false;

    // Get credits from plan features
    const planCredits = this.getPlanCredits(business.plan_id);
    
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return await this.allocateCreditsForPeriod(
      businessId,
      planCredits,
      now,
      nextMonth
    );
  }

  /**
   * Get credits allocation for a plan
   */
  private static getPlanCredits(planId: number): number {
    const planCreditsMap: Record<number, number> = {
      1: 50,    // FREE
      2: 500,   // PRO
      3: 1500,  // PRO PLUS
      4: 999999, // PRO UNLIMITED (effectively unlimited)
    };

    return planCreditsMap[planId] || 0;
  }

  /**
   * Initialize credits for a new business
   */
  static async initializeCreditsForBusiness(
    businessId: string,
    planId: number,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<boolean> {
    const planCredits = this.getPlanCredits(planId);
    if (planCredits === 0) return false;

    const start = periodStart || new Date();
    const end = periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    return await this.allocateCreditsForPeriod(businessId, planCredits, start, end);
  }

  /**
   * Get total credits used in current period
   */
  static async getCurrentPeriodUsage(businessId: string): Promise<number> {
    const balance = await prisma.aicreditbalance.findUnique({
      where: { business_id: businessId },
      select: { credits_period_start: true }
    });

    if (!balance || !balance.credits_period_start) return 0;

    const usage = await prisma.aicredittransaction.aggregate({
      where: {
        business_id: businessId,
        transaction_type: 'usage',
        created_at: { gte: balance.credits_period_start }
      },
      _sum: {
        amount: true
      }
    });

    return Math.abs(usage._sum.amount || 0);
  }

  /**
   * Get all feature costs
   */
  static getAllFeatureCosts() {
    return AI_FEATURE_COSTS;
  }

  /**
   * Get usage statistics with enhanced format
   */
  static async getEnhancedUsageStats(businessId: string): Promise<{
    totalCreditsUsed: number;
    creditsUsedThisPeriod: number;
    mostUsedFeature: string | null;
    averageUsagePerDay: number;
  }> {
    try {
      const stats = await this.getUsageStats(businessId)
      return {
        totalCreditsUsed: stats.total_used,
        creditsUsedThisPeriod: stats.total_used,
        mostUsedFeature: null, // This would need additional logic to determine
        averageUsagePerDay: stats.total_used / stats.period_days
      }
    } catch (error) {
      console.error('Error getting AI credits usage stats:', error)
      return {
        totalCreditsUsed: 0,
        creditsUsedThisPeriod: 0,
        mostUsedFeature: null,
        averageUsagePerDay: 0
      }
    }
  }
}

// Export singleton instance for backward compatibility
export const unifiedAICreditsManager = AICreditsManager;
