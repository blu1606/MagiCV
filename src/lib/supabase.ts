import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Service role client for admin operations
export const getSupabaseAdmin = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Database types based on actual Supabase schema

export type ProviderType = 'linkedin' | 'github' | 'behance';

export type ComponentType = 'experience' | 'project' | 'education' | 'skill';

export interface Profile {
  id: string; // UUID from auth.users
  full_name?: string;
  avatar_url?: string;
  profession?: string;
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
  created_at: string;
  updated_at: string;
  src?: string;
}

export interface CV {
  id: string;
  user_id: string;
  title: string;
  job_description?: string;
  match_score?: number;
  content: any; // jsonb
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

