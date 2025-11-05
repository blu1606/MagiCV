/**
 * Migration Runner using Direct Postgres Connection
 * Executes SQL migrations via direct Postgres connection from Supabase connection string
 *
 * Usage:
 *   npx tsx scripts/run-migration-direct.ts supabase/migrations/20250106_add_profile_contact_fields.sql
 * 
 * Note: This requires the 'pg' package. Install it with: npm install pg @types/pg
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

async function runMigration(migrationPath: string) {
  console.log('🚀 Supabase Migration Runner (Direct Postgres)\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
  }

  // Try to import pg
  let pg;
  try {
    pg = await import('pg');
  } catch (error) {
    console.error('❌ Missing "pg" package. Installing...\n');
    console.log('   Run: npm install pg @types/pg\n');
    console.log('   Or use Supabase Dashboard method (see below)\n');
    
    // Show manual instructions
    const absolutePath = path.isAbsolute(migrationPath)
      ? migrationPath
      : path.join(process.cwd(), migrationPath);
    
    if (fs.existsSync(absolutePath)) {
      const migrationSQL = fs.readFileSync(absolutePath, 'utf-8');
      console.log('📋 Migration SQL to execute manually:\n');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      console.log('\n💡 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] + '/sql\n');
    }
    
    process.exit(1);
  }

  // Build connection string from Supabase URL
  // Supabase connection string format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  // We need to extract project ref and construct connection string
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  // If we have DATABASE_URL, use it; otherwise construct from service key
  // Note: For security, Supabase doesn't expose the direct DB password in service key
  // We need to use the connection pooler or get the direct connection string
  if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL or SUPABASE_DB_URL environment variable');
    console.error('   Get it from: Supabase Dashboard → Settings → Database → Connection String');
    console.error('   Use the "Direct connection" or "Connection pooling" string\n');
    process.exit(1);
  }

  console.log(`✓ Connecting to Supabase database...\n`);

  // Read migration file
  const absolutePath = path.isAbsolute(migrationPath)
    ? migrationPath
    : path.join(process.cwd(), migrationPath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Migration file not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`📄 Reading migration: ${path.basename(absolutePath)}`);
  const migrationSQL = fs.readFileSync(absolutePath, 'utf-8');
  console.log(`  → Size: ${migrationSQL.length} bytes\n`);

  // Execute migration
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    console.log('⏳ Executing migration...\n');

    // Execute the SQL
    const result = await client.query(migrationSQL);

    console.log('✅ Migration executed successfully!\n');
    
    if (result.rows && result.rows.length > 0) {
      console.log('📊 Result:', JSON.stringify(result.rows, null, 2));
    }

    await client.end();
    
  } catch (error: any) {
    await client.end();
    console.error(`\n❌ Migration failed: ${error.message}\n`);
    
    if (error.position) {
      console.error(`   Error at position: ${error.position}`);
    }
    
    // Show the SQL for manual execution
    console.log('\n📋 Migration SQL to execute manually:\n');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log('\n💡 Go to Supabase Dashboard SQL Editor to run manually\n');
    
    process.exit(1);
  }
}

// Main execution
const migrationPath = process.argv[2] || 'supabase/migrations/20250106_add_profile_contact_fields.sql';

if (!migrationPath) {
  console.error('❌ Usage: npx tsx scripts/run-migration-direct.ts <migration-file-path>');
  console.error(
    '   Example: npx tsx scripts/run-migration-direct.ts supabase/migrations/20250106_add_profile_contact_fields.sql'
  );
  process.exit(1);
}

runMigration(migrationPath)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });

