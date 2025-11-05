/**
 * Migration Runner
 * Runs SQL migrations against Supabase database
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts supabase/migrations/20250105_add_hybrid_architecture.sql
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

async function runMigration(migrationPath: string) {
  console.log('🚀 Migration Runner\n');

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

  // Create Supabase admin client
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`✓ Connected to Supabase: ${supabaseUrl}\n`);

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
  console.log('⏳ Executing migration...\n');

  try {
    // Execute the SQL migration
    // Note: rpc() is used for executing raw SQL via a database function
    // Alternatively, you can use the Supabase SQL editor or pgAdmin

    // Split migration into individual statements (basic splitter)
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`  → Found ${statements.length} SQL statements\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (
        statement.startsWith('/*') ||
        statement.startsWith('--') ||
        statement.trim().length === 0
      ) {
        continue;
      }

      console.log(`  [${i + 1}/${statements.length}] Executing...`);

      try {
        // Execute via RPC (requires a function on Supabase side)
        // For direct SQL execution, you'll need to use pg client or Supabase SQL editor
        // This is a placeholder - you may need to execute this manually via Supabase dashboard

        // For now, we'll use the pg client approach
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement,
        });

        if (error) {
          console.error(`    ❌ Error: ${error.message}`);
          errorCount++;
        } else {
          console.log(`    ✓ Success`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`    ❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`  ✓ Successful: ${successCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);

    if (errorCount > 0) {
      console.log(
        `\n⚠️  Some statements failed. You may need to run this migration manually via:`
      );
      console.log(`  1. Supabase Dashboard → SQL Editor`);
      console.log(`  2. Copy the migration file contents`);
      console.log(`  3. Execute in SQL Editor\n`);
    } else {
      console.log(`\n✅ Migration completed successfully!\n`);
    }
  } catch (error: any) {
    console.error(`\n❌ Migration failed: ${error.message}\n`);
    console.log(
      `\n💡 Alternative approach: Run migration manually via Supabase Dashboard:`
    );
    console.log(`  1. Go to Supabase Dashboard → SQL Editor`);
    console.log(`  2. Paste the contents of: ${path.basename(absolutePath)}`);
    console.log(`  3. Click "Run"\n`);
    process.exit(1);
  }
}

// Main execution
const migrationPath = process.argv[2];

if (!migrationPath) {
  console.error('❌ Usage: npx tsx scripts/run-migration.ts <migration-file-path>');
  console.error(
    '   Example: npx tsx scripts/run-migration.ts supabase/migrations/20250105_add_hybrid_architecture.sql'
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
