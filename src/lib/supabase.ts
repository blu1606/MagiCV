import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Singleton pattern for default client
let defaultClient: SupabaseClient | null = null;

export const supabase = (() => {
  if (!defaultClient) {
    defaultClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return defaultClient;
})();

// Service role client singleton for admin operations
let adminClient: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return adminClient;
};

// Database types based on actual Supabase schema

export type ProviderType = 'linkedin' | 'github' | 'behance';

export type ComponentType = 'experience' | 'project' | 'education' | 'skill';

export type ComponentCategory = 'always-include' | 'match-required' | 'optional';

export interface Language {
  name: string;
  level: string; // e.g., "Native", "Fluent", "Intermediate", "Basic"
}

export interface Profile {
  id: string; // UUID from auth.users
  full_name?: string;
  avatar_url?: string;
  profession?: string;

  // Enhanced profile fields (Solution A: Hybrid Architecture)
  professional_title?: string;
  summary?: string;
  bio?: string;

  // Contact information
  email?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;

  // Skills and interests
  soft_skills?: string[]; // ["Leadership", "Communication", "Problem Solving"]
  languages?: Language[]; // [{"name": "English", "level": "Native"}, ...]
  interests?: string[]; // ["Open Source", "Hiking", "Photography"]

  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  provider: ProviderType;
  provider_account_id: string;
  access_token?: string;
  refresh_token?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  token_expires_at?: string;
  scopes?: string[];
}

export interface Component {
  id: string;
  user_id: string;
  account_id?: string;
  type: ComponentType;
  title: string;
  organization?: string;
  start_date?: string; // date
  end_date?: string; // date
  description?: string;
  highlights: any[]; // jsonb array
  embedding?: number[]; // vector(768)
  category?: ComponentCategory; // Solution A: Hybrid Architecture
  created_at: string;
  updated_at: string;
  src?: string;
  source_id?: string;
}

export interface CV {
  id: string;
  user_id: string;
  title: string;
  job_description?: string;
  match_score?: number;
  content: any; // jsonb
  embedding?: number[]; // vector(768) - for vector search
  created_at: string;
  updated_at: string;
}

export interface CVPdf {
  id: string;
  user_id: string;
  cv_id?: string;
  file_url: string;
  filename?: string;
  mime_type: string;
  byte_size?: number;
  sha256?: string;
  page_count?: number;
  version: number;
  generated_at?: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility with existing tools
export type LegacySourceType = 'github' | 'youtube' | 'linkedin' | 'manual';

export interface LegacyComponentData {
  source: LegacySourceType;
  data: any;
  metadata?: {
    crawled_at?: string;
    url?: string;
    [key: string]: any;
  };
}

