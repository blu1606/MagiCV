import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GitHubComponentService } from '@/services/github-component-service';

/**
 * POST /api/github/crawl
 *
 * Crawl GitHub profile and create components
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
    const { githubUsername, includeReadme = true, maxRepos = 50 } = body;

    if (!githubUsername) {
      return NextResponse.json(
        { error: 'githubUsername is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    let cleanUsername = githubUsername.trim();

    // Extract username from URL if provided
    if (cleanUsername.includes('github.com')) {
      const match = cleanUsername.match(/github\.com\/([^\/]+)/);
      cleanUsername = match ? match[1] : cleanUsername;
    }

    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      );
    }

    console.log(`🚀 Starting GitHub crawl for user ${user.id}: ${cleanUsername}`);

    // Crawl and create components
    const result = await GitHubComponentService.crawlAndCreateComponents(
      user.id,
      cleanUsername,
      {
        includeReadme,
        maxRepos,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to crawl GitHub profile',
          details: result.errors,
        },
        { status: 500 }
      );
    }

    console.log(`✅ GitHub crawl complete for ${cleanUsername}`);
    console.log(`   Components created: ${result.componentsCreated}`);
    console.log(`   Errors: ${result.errors.length}`);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${result.componentsCreated} components from GitHub`,
      data: {
        componentsCreated: result.componentsCreated,
        profile: result.profile,
        errors: result.errors,
      },
    });
  } catch (error: any) {
    console.error('❌ GitHub crawl API error:', error.message);
    return NextResponse.json(
      {
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
