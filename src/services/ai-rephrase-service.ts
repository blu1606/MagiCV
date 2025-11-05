/**
 * AI Rephrasing Service
 * Advanced AI-powered content rephrasing with context awareness
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMUtilsService } from './llm-utils-service'

export type RephraseMode = 'professional' | 'concise' | 'impactful' | 'quantified' | 'action-oriented'

export interface RephraseOptions {
  mode: RephraseMode
  context?: string // Job description or company context
  preserveStructure?: boolean
  targetLength?: number
  emphasize?: string[] // Keywords to emphasize
}

export interface RephraseResult {
  original: string
  rephrased: string
  improvements: string[]
  mode: RephraseMode
  confidence: number
}

export class AIRephraseService {
  private static genAI: GoogleGenerativeAI | null = null

  private static getClient() {
    if (!this.genAI) {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found')
      }
      this.genAI = new GoogleGenerativeAI(apiKey)
    }
    return this.genAI
  }

  /**
   * Rephrase a single text with AI
   */
  static async rephrase(
    text: string,
    options: RephraseOptions
  ): Promise<RephraseResult> {
    console.log(`🤖 Rephrasing text in ${options.mode} mode...`)

    const genAI = this.getClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = this.buildPrompt(text, options)

    try {
      const result = await LLMUtilsService.callWithRetry(model, prompt, {
        maxRetries: 2,
        parseJSON: true,
        validator: (data: any) => {
          return !!data.rephrased && !!data.improvements
        },
        validatorErrorMessage: 'Response must include rephrased text and improvements',
      })

      return {
        original: text,
        rephrased: result.rephrased,
        improvements: result.improvements || [],
        mode: options.mode,
        confidence: result.confidence || 0.9,
      }
    } catch (error: any) {
      console.error('❌ Error rephrasing text:', error.message)
      throw error
    }
  }

  /**
   * Rephrase multiple bullet points in batch
   */
  static async rephraseBullets(
    bullets: string[],
    options: RephraseOptions
  ): Promise<RephraseResult[]> {
    console.log(`🤖 Rephrasing ${bullets.length} bullets in ${options.mode} mode...`)

    const genAI = this.getClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = this.buildBatchPrompt(bullets, options)

    try {
      const result = await LLMUtilsService.callWithRetry(model, prompt, {
        maxRetries: 2,
        parseJSON: true,
        validator: (data: any) => {
          return Array.isArray(data.bullets) && data.bullets.length === bullets.length
        },
        validatorErrorMessage: 'Response must include same number of bullets',
      })

      return bullets.map((original, index) => ({
        original,
        rephrased: result.bullets[index]?.text || original,
        improvements: result.bullets[index]?.improvements || [],
        mode: options.mode,
        confidence: result.bullets[index]?.confidence || 0.9,
      }))
    } catch (error: any) {
      console.error('❌ Error rephrasing bullets:', error.message)
      throw error
    }
  }

  /**
   * Build prompt for single text rephrasing
   */
  private static buildPrompt(text: string, options: RephraseOptions): string {
    const modeInstructions = this.getModeInstructions(options.mode)
    const contextSection = options.context
      ? `\n\nJob Context:\n${options.context}\n\nTailor the rephrased text to match this job's requirements.`
      : ''

    const emphasizeSection = options.emphasize && options.emphasize.length > 0
      ? `\n\nKeywords to emphasize: ${options.emphasize.join(', ')}`
      : ''

    return `You are a professional CV writer and career coach. Rephrase the following text to make it more ${options.mode}.

Original Text:
"${text}"

${modeInstructions}${contextSection}${emphasizeSection}

${options.preserveStructure ? 'Preserve the original structure and key points.' : ''}
${options.targetLength ? `Target length: approximately ${options.targetLength} words.` : ''}

Return ONLY valid JSON with this structure:
{
  "rephrased": "The improved version of the text",
  "improvements": ["List of 2-3 specific improvements made"],
  "confidence": 0.95
}

Guidelines:
- Make it compelling and achievement-oriented
- Use strong action verbs
- Include quantifiable metrics where possible
- Be concise but impactful
- Match the tone appropriate for a CV
- Ensure it's truthful and doesn't exaggerate`
  }

  /**
   * Build prompt for batch bullet rephrasing
   */
  private static buildBatchPrompt(bullets: string[], options: RephraseOptions): string {
    const modeInstructions = this.getModeInstructions(options.mode)
    const contextSection = options.context
      ? `\n\nJob Context:\n${options.context}\n\nTailor each bullet to match this job's requirements.`
      : ''

    const bulletsList = bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')

    return `You are a professional CV writer. Rephrase these CV bullet points to make them more ${options.mode}.

Original Bullets:
${bulletsList}

${modeInstructions}${contextSection}

Return ONLY valid JSON with this structure:
{
  "bullets": [
    {
      "text": "Rephrased bullet 1",
      "improvements": ["Improvement 1", "Improvement 2"],
      "confidence": 0.95
    },
    // ... one object for each bullet
  ]
}

Guidelines:
- Start each bullet with a strong action verb
- Include quantifiable metrics (numbers, percentages, improvements)
- Focus on achievements and impact, not just responsibilities
- Keep bullets concise (1-2 lines max)
- Use ${options.mode} language
- Be truthful and don't exaggerate
- Ensure consistency across all bullets`
  }

  /**
   * Get mode-specific instructions
   */
  private static getModeInstructions(mode: RephraseMode): string {
    const instructions = {
      professional: `Make the text more professional and polished:
- Use formal business language
- Avoid casual expressions
- Maintain a confident, authoritative tone
- Use industry-standard terminology`,

      concise: `Make the text more concise and impactful:
- Remove unnecessary words and fluff
- Get straight to the point
- Keep only the most important information
- Use brief, powerful language`,

      impactful: `Make the text more impactful and compelling:
- Lead with strongest achievements
- Emphasize unique value and contributions
- Use powerful action verbs
- Create a sense of significance`,

      quantified: `Make the text more data-driven and quantified:
- Add or emphasize numbers, metrics, percentages
- Include scale and scope information
- Quantify achievements and results
- Use specific figures instead of vague terms`,

      'action-oriented': `Make the text more action-oriented:
- Start with strong action verbs (Led, Drove, Built, Increased, etc.)
- Focus on what you DID, not what you were responsible for
- Emphasize active contributions
- Show initiative and leadership`,
    }

    return instructions[mode]
  }

  /**
   * Suggest rephrasing for an entire experience
   */
  static async suggestExperienceImprovements(
    title: string,
    description: string,
    highlights: string[],
    jobContext?: string
  ): Promise<{
    title?: string
    description?: string
    highlights?: RephraseResult[]
    overallSuggestions: string[]
  }> {
    console.log('🤖 Analyzing experience for improvements...')

    const suggestions: string[] = []

    // Check if title needs improvement
    if (!title.match(/^(Lead|Senior|Principal|Chief|Director|Manager|Head)/i)) {
      suggestions.push('Consider emphasizing seniority level in title if applicable')
    }

    // Check if highlights use weak verbs
    const weakVerbs = ['worked', 'helped', 'assisted', 'responsible for', 'involved in']
    const hasWeakVerbs = highlights.some(h =>
      weakVerbs.some(v => h.toLowerCase().includes(v))
    )

    if (hasWeakVerbs) {
      suggestions.push('Replace weak verbs (worked, helped) with strong action verbs (Led, Built, Drove)')
    }

    // Check if highlights lack quantification
    const hasNumbers = highlights.some(h => /\d+/.test(h))
    if (!hasNumbers) {
      suggestions.push('Add quantifiable metrics (numbers, percentages, scales)')
    }

    // Rephrase highlights in quantified mode
    const rephrasedHighlights = highlights.length > 0
      ? await this.rephraseBullets(highlights, {
          mode: 'quantified',
          context: jobContext,
        })
      : undefined

    return {
      highlights: rephrasedHighlights,
      overallSuggestions: suggestions,
    }
  }

  /**
   * Quick improvement suggestions without AI
   */
  static quickAnalysis(text: string): string[] {
    const suggestions: string[] = []

    // Check length
    if (text.length < 50) {
      suggestions.push('Too short - add more detail and impact')
    }
    if (text.length > 300) {
      suggestions.push('Too long - make it more concise')
    }

    // Check for weak verbs
    const weakVerbs = ['worked', 'helped', 'assisted', 'responsible', 'involved', 'participated']
    if (weakVerbs.some(v => text.toLowerCase().includes(v))) {
      suggestions.push('Use stronger action verbs (Led, Built, Drove, Increased)')
    }

    // Check for numbers
    if (!/\d+/.test(text)) {
      suggestions.push('Add quantifiable metrics (numbers, percentages)')
    }

    // Check for passive voice
    if (/was|were|been/.test(text)) {
      suggestions.push('Avoid passive voice - use active voice instead')
    }

    return suggestions
  }
}
