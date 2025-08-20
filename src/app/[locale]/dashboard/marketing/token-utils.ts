// Token calculation and cost estimation function
export function calculateTokenUsageAndCost(
  inputText: string,
  outputText: string,
  model: string = 'gpt-4o-mini'
): { inputTokens: number; outputTokens: number; totalTokens: number; estimatedCost: number } {
  // GPT-4o-mini pricing (as of 2024)
  const pricing = {
    'gpt-4o-mini': {
      input: 0.00015, // $0.15 per 1M input tokens
      output: 0.0006   // $0.60 per 1M output tokens
    }
  }

  // Simple token estimation (rough approximation)
  // GPT models typically use ~4 characters per token for English, ~2-3 for other languages
  const estimateTokens = (text: string): number => {
    // Remove extra whitespace and count characters
    const cleanText = text.replace(/\s+/g, ' ').trim()
    // Estimate ~3.5 characters per token (conservative estimate)
    return Math.ceil(cleanText.length / 3.5)
  }

  const inputTokens = estimateTokens(inputText)
  const outputTokens = estimateTokens(outputText)
  const totalTokens = inputTokens + outputTokens

  // Calculate cost with full precision
  const modelPricing = pricing[model as keyof typeof pricing] || pricing['gpt-4o-mini']
  const inputCost = (inputTokens / 1000000) * modelPricing.input
  const outputCost = (outputTokens / 1000000) * modelPricing.output
  const estimatedCost = inputCost + outputCost

  // Debug logging for cost calculation
  console.log("💰 Token Cost Calculation:")
  console.log(`  Input tokens: ${inputTokens.toLocaleString()}`)
  console.log(`  Output tokens: ${outputTokens.toLocaleString()}`)
  console.log(`  Total tokens: ${totalTokens.toLocaleString()}`)
  console.log(`  Input cost: $${inputCost.toFixed(8)}`)
  console.log(`  Output cost: $${outputCost.toFixed(8)}`)
  console.log(`  Total cost: $${estimatedCost.toFixed(8)}`)

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost
  }
}
