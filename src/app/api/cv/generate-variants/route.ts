import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CVVariantGeneratorService } from '@/services/cv-variant-generator-service';
import type { MatchResult, JDMatchingResults } from '@/lib/types/jd-matching';
import type { Component } from '@/lib/supabase';
import type { FocusArea } from '@/services/cv-variant-generator-service';

/**
 * POST /api/cv/generate-variants
 *
 * Generate multiple CV variants with different focus areas
 *
 * Request body:
 * {
 *   matches: MatchResult[];
 *   jdMetadata: JDMatchingResults['jdMetadata'];
 *   jdComponents: Component[];
 *   customFocusAreas?: FocusArea[];  // Optional: specify custom focus areas
 * }
 *
 * Response:
 * {
 *   variants: CVVariant[];
 *   focusAnalysis: FocusAreaAnalysis;
 *   recommendation: {
 *     recommended: CVVariant;
 *     comparison: Array<{...}>;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { matches, jdMetadata, jdComponents, customFocusAreas } = body as {
      matches: MatchResult[];
      jdMetadata: JDMatchingResults['jdMetadata'];
      jdComponents: Component[];
      customFocusAreas?: FocusArea[];
    };

    // Validate input
    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json(
        { error: 'matches array is required' },
        { status: 400 }
      );
    }

    if (!jdMetadata) {
      return NextResponse.json(
        { error: 'jdMetadata is required' },
        { status: 400 }
      );
    }

    if (!jdComponents || !Array.isArray(jdComponents)) {
      return NextResponse.json(
        { error: 'jdComponents array is required' },
        { status: 400 }
      );
    }

    console.log('🎯 Generating CV variants...');

    // Step 1: Analyze focus areas (unless custom ones provided)
    let focusAreas: FocusArea[];
    let focusAnalysis;

    if (customFocusAreas && customFocusAreas.length > 0) {
      focusAreas = customFocusAreas;
      console.log(`✓ Using custom focus areas: ${focusAreas.join(', ')}`);

      // Still analyze for metadata
      focusAnalysis = await CVVariantGeneratorService.analyzeFocusAreas(
        matches,
        jdMetadata,
        jdComponents
      );
    } else {
      focusAnalysis = await CVVariantGeneratorService.analyzeFocusAreas(
        matches,
        jdMetadata,
        jdComponents
      );
      focusAreas = focusAnalysis.suggestedFocusAreas;
      console.log(`✓ Analyzed focus areas: ${focusAreas.join(', ')}`);
    }

    // Step 2: Generate variants
    const variants = await CVVariantGeneratorService.generateVariants(
      matches,
      jdMetadata,
      focusAreas
    );

    console.log(`✓ Generated ${variants.length} variants`);

    // Step 3: Compare and recommend
    const recommendation = CVVariantGeneratorService.compareVariants(variants);

    console.log(`✓ Recommended variant: ${recommendation.recommended.focusArea} (score: ${recommendation.recommended.score})`);

    return NextResponse.json({
      variants,
      focusAnalysis,
      recommendation,
      meta: {
        generatedAt: new Date().toISOString(),
        variantCount: variants.length,
        topScore: recommendation.recommended.score,
      },
    });
  } catch (error: any) {
    console.error('❌ Variant generation error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cv/generate-variants/focus-areas
 *
 * Get available focus areas and their descriptions
 */
export async function GET(request: NextRequest) {
  try {
    const focusAreas = [
      {
        id: 'technical',
        name: 'Technical Excellence',
        description: 'Emphasizes programming languages, frameworks, tools, and technical depth',
        icon: 'code',
        color: 'blue',
      },
      {
        id: 'leadership',
        name: 'Leadership & Management',
        description: 'Emphasizes team leadership, mentoring, and stakeholder management',
        icon: 'users',
        color: 'purple',
      },
      {
        id: 'impact',
        name: 'Business Impact',
        description: 'Emphasizes metrics, business outcomes, and measurable achievements',
        icon: 'trending-up',
        color: 'green',
      },
      {
        id: 'innovation',
        name: 'Innovation & R&D',
        description: 'Emphasizes new solutions, cutting-edge technology, and pioneering work',
        icon: 'lightbulb',
        color: 'orange',
      },
      {
        id: 'balanced',
        name: 'Balanced Approach',
        description: 'Evenly distributes focus across all areas',
        icon: 'balance-scale',
        color: 'gray',
      },
    ];

    return NextResponse.json({
      focusAreas,
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
