import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/components/stats - Get component statistics for user
 *
 * Returns count of components by type
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

    // Get all components for user
    const components = await SupabaseService.getComponentsByUserId(user.id);

    // Count by type
    const stats = {
      experience: components.filter(c => c.type === 'experience').length,
      education: components.filter(c => c.type === 'education').length,
      skill: components.filter(c => c.type === 'skill').length,
      project: components.filter(c => c.type === 'project').length,
      total: components.length,
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Error fetching component stats:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
