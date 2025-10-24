import { NextRequest, NextResponse } from 'next/server';
import { SupabaseService } from '@/services/supabase-service';

/**
 * GET /api/users - Get all users
 */
export async function GET() {
  try {
    const users = await SupabaseService.getAllUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await SupabaseService.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'User already exists', user: existing },
        { status: 409 }
      );
    }

    const user = await SupabaseService.createUser(email, name);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

