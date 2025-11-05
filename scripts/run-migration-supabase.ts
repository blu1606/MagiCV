/**
 * Migration Runner using Supabase REST API
 * Executes SQL migrations directly via Supabase HTTP API
 *
 * Usage:
 *   npx tsx scripts/run-migration-supabase.ts supabase/migrations/20250106_add_profile_contact_fields.sql
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

async function runMigration(migrationPath: string) {
  console.log('🚀 Supabase Migration Runner\n');

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    process.exit(1);
  }

  if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    process.exit(1);
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.error('❌ Invalid Supabase URL format');
    process.exit(1);
  }

  console.log(`✓ Supabase Project: ${projectRef}`);
  console.log(`✓ URL: ${supabaseUrl}\n`);

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

  // Execute migration via Supabase Management API
  console.log('⏳ Executing migration via Supabase API...\n');

  try {
    // Use Supabase Management API to execute SQL
    // Note: This requires the Management API which may need different authentication
    // For now, we'll use the direct SQL execution via REST API
    
    // Supabase allows SQL execution via their SQL Editor API
    // However, the safest way is to use the Management API or direct Postgres connection
    
    // Alternative: Use Supabase's SQL execution endpoint
    const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    console.log('📡 Attempting to execute via Supabase Management API...\n');
    
    const response = await fetch(managementApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        query: migrationSQL,
      }),
    });

    if (!response.ok) {
      // If Management API doesn't work, try direct Postgres approach
      console.log('⚠️  Management API not available, trying alternative method...\n');
      
      // Alternative: Execute via Supabase REST API using a helper function
      // This requires creating a function in Supabase first
      console.log('💡 For direct SQL execution, please use one of these methods:\n');
      console.log('   1. Supabase Dashboard (Recommended):');
      console.log('      - Go to https://supabase.com/dashboard/project/' + projectRef + '/sql');
      console.log('      - Click "New Query"');
      console.log('      - Paste the migration SQL');
      console.log('      - Click "Run"\n');
      console.log('   2. Use Supabase CLI:');
      console.log('      - Install: npm i -g supabase');
      console.log('      - Run: supabase db push\n');
      console.log('   3. Direct Postgres connection:');
      console.log('      - Use psql or pgAdmin with connection string\n');
      
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
      console.log('\n📋 Migration SQL to execute:\n');
      console.log('─'.repeat(60));
      console.log(migrationSQL);
      console.log('─'.repeat(60));
      
      process.exit(1);
    }

    const result = await response.json();
    
    if (result.error) {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!\n');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error(`\n❌ Migration failed: ${error.message}\n`);
    
    // Provide helpful instructions
    console.log('💡 To run this migration manually:\n');
    console.log('   1. Go to Supabase Dashboard:');
    console.log(`      https://supabase.com/dashboard/project/${projectRef}/sql`);
    console.log('   2. Click "New Query"');
    console.log('   3. Copy and paste the migration SQL below:');
    console.log('\n' + '─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60) + '\n');
    console.log('   4. Click "Run"\n');
    
    process.exit(1);
  }
}

// Main execution
const migrationPath = process.argv[2] || 'supabase/migrations/20250106_add_profile_contact_fields.sql';

if (!migrationPath) {
  console.error('❌ Usage: npx tsx scripts/run-migration-supabase.ts <migration-file-path>');
  console.error(
    '   Example: npx tsx scripts/run-migration-supabase.ts supabase/migrations/20250106_add_profile_contact_fields.sql'
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

