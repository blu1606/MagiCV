import { NextRequest, NextResponse } from 'next/server'
import { AIRephraseService, RephraseMode } from '@/services/ai-rephrase-service'

/**
 * POST /api/cv/rephrase
 * Rephrase CV content using AI
 */
export async function POST(request: NextRequest) {
  try {
    const {
      text,
      bullets,
      mode = 'professional',
      context,
      preserveStructure,
      targetLength,
      emphasize,
    } = await request.json()

    // Validate mode
    const validModes: RephraseMode[] = [
      'professional',
      'concise',
      'impactful',
      'quantified',
      'action-oriented',
    ]

    if (!validModes.includes(mode)) {
      return NextResponse.json(
        {
          error: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Either text or bullets must be provided
    if (!text && (!bullets || bullets.length === 0)) {
      return NextResponse.json(
        { error: 'Either text or bullets must be provided' },
        { status: 400 }
      )
    }

    const options = {
      mode,
      context,
      preserveStructure,
      targetLength,
      emphasize,
    }

    let result

    if (bullets && bullets.length > 0) {
      // Batch rephrase bullets
      result = await AIRephraseService.rephraseBullets(bullets, options)
    } else {
      // Single text rephrase
      result = await AIRephraseService.rephrase(text, options)
    }

    return NextResponse.json({
      result,
      mode,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in rephrase:', error)
    return NextResponse.json(
      { error: 'Failed to rephrase content: ' + error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cv/rephrase/analyze
 * Quick analysis of text without AI rephrasing
 */
export async function PUT(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      )
    }

    const suggestions = AIRephraseService.quickAnalysis(text)

    return NextResponse.json({
      suggestions,
      textLength: text.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in rephrase/analyze:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
