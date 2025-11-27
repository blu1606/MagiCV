/**
 * Mock for SupabaseService
 * Jest will automatically use this when mocking @/services/supabase-service
 */

import type { Component, Profile } from '@/lib/supabase';

// Mock data generators
export const createMockComponent = (overrides?: Partial<Component>): Component => ({
  id: 'comp_' + Math.random().toString(36).substr(2, 9),
  user_id: 'user_123',
  type: 'experience',
  title: 'Software Engineer',
  organization: 'Tech Corp',
  description: 'Built amazing features',
  highlights: ['Achievement 1'],
  start_date: '2020-01',
  end_date: '2023-12',
  embedding: undefined,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProfile = (overrides?: Partial<Profile>): Profile => ({
  id: 'user_123',
  full_name: 'John Doe',
  profession: 'Software Engineer',
  bio: 'Passionate developer',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Mock SupabaseService class
export class SupabaseService {
  static async getUserComponents(userId: string, type?: string, source?: string) {
    const mockComponents = [
      createMockComponent({ user_id: userId, type: 'experience' }),
      createMockComponent({ user_id: userId, type: 'skill' }),
      createMockComponent({ user_id: userId, type: 'project' }),
    ];

    let filtered = mockComponents;
    if (type) {
      filtered = filtered.filter(c => c.type === type);
    }

    return {
      components: filtered,
      total: filtered.length,
    };
  }

  static async similaritySearchComponents(
    userId: string,
    embedding: number[],
    limit: number
  ): Promise<Component[]> {
    // Return mock components with embeddings
    return [
      createMockComponent({ user_id: userId, embedding }),
      createMockComponent({ user_id: userId, embedding }),
    ].slice(0, limit);
  }

  static async getProfileById(userId: string): Promise<Profile | null> {
    return createMockProfile({ id: userId });
  }

  static async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    return createMockProfile({ id: userId, ...data });
  }

  static async saveComponents(userId: string, components: any[]): Promise<void> {
    // Mock save
    return Promise.resolve();
  }

  static async getJobDescriptions(userId: string) {
    return {
      cvs: [],
      total: 0,
    };
  }
}

