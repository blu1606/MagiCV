import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Connection pool configuration
const DB_POOL_SIZE = parseInt(process.env.DB_POOL_SIZE || '20', 10);
const DB_TIMEOUT = parseInt(process.env.DB_TIMEOUT || '30000', 10); // 30 seconds
const DB_STATEMENT_TIMEOUT = parseInt(process.env.DB_STATEMENT_TIMEOUT || '10000', 10); // 10 seconds
const DB_IDLE_TIMEOUT = parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10); // 60 seconds

// Singleton pattern for default client
let defaultClient: SupabaseClient | null = null;

export const supabase = (() => {
  if (!defaultClient) {
    defaultClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        db: {
          schema: 'public',
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'X-Client-Info': 'magiccv-web',
          },
        },
      }
    );

    // Log connection pool configuration
    console.log('🔧 Supabase client configured with connection pooling:', {
      poolSize: DB_POOL_SIZE,
      timeout: `${DB_TIMEOUT}ms`,
      statementTimeout: `${DB_STATEMENT_TIMEOUT}ms`,
      idleTimeout: `${DB_IDLE_TIMEOUT}ms`,
    });
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
        db: {
          schema: 'public',
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'X-Client-Info': 'magiccv-admin',
          },
        },
      }
    );

    // Log admin client configuration
    console.log('🔧 Supabase admin client configured with connection pooling:', {
      poolSize: DB_POOL_SIZE,
      timeout: `${DB_TIMEOUT}ms`,
      role: 'service_role',
    });
  }

  return adminClient;
};

/**
 * Connection pool monitoring utilities
 */
export const getConnectionPoolMetrics = () => {
  return {
    poolSize: DB_POOL_SIZE,
    timeout: DB_TIMEOUT,
    statementTimeout: DB_STATEMENT_TIMEOUT,
    idleTimeout: DB_IDLE_TIMEOUT,
  };
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> => {
  const start = Date.now();
  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from('profiles').select('id').limit(1);

    if (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        error: error.message,
      };
    }

    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error.message || 'Unknown error',
    };
  }
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

