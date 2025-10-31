import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/profile - Get current user profile
 * Returns profile data for authenticated user
 * 
 * Caching: 30 seconds (revalidate)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get profile from Supabase
    const profile = await SupabaseService.getProfileById(user.id);

    if (!profile) {
      // Profile might not exist yet, return with user email
      return NextResponse.json({
        id: user.id,
        email: user.email || '',
        full_name: null,
        avatar_url: null,
        profession: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Return profile with email from auth
    const response = NextResponse.json({
      ...profile,
      email: user.email || '',
    });

    // Add caching headers
    response.headers.set(
      'Cache-Control',
      'private, s-maxage=30, stale-while-revalidate=60'
    );

    return response;
  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile - Update current user profile
 * Body: { full_name?, avatar_url?, profession? }
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url, profession } = body;

    // Validate that at least one field is provided
    if (full_name === undefined && avatar_url === undefined && profession === undefined) {
      return NextResponse.json(
        { error: 'At least one field (full_name, avatar_url, profession) must be provided' },
        { status: 400 }
      );
    }

    // Check if profile exists
    let profile = await SupabaseService.getProfileById(user.id);

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await SupabaseService.createProfile(
        user.id,
        full_name || null,
        avatar_url || null,
        profession || null
      );
    } else {
      // Update existing profile
      const updates: any = {};
      if (full_name !== undefined) updates.full_name = full_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (profession !== undefined) updates.profession = profession;

      profile = await SupabaseService.updateProfile(user.id, updates);
    }

    // Return updated profile with email
    const response = NextResponse.json({
      ...profile,
      email: user.email || '',
    });

    // No cache for mutations - data has changed
    response.headers.set('Cache-Control', 'no-store, must-revalidate');

    return response;
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

