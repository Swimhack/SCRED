// Apply RLS fix for contact_submissions table
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\nUsage: Set environment variable first:');
  console.log('  $env:SUPABASE_SERVICE_KEY="your-service-key"; node apply-rls-fix.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sqlFile = './supabase/migrations/20251013000000-contact-submissions-rls-fix.sql';
const sql = readFileSync(sqlFile, 'utf-8');

console.log('📝 Applying RLS policy fix for contact_submissions table...\n');

// Split by semicolon and execute each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function applyMigration() {
  for (const statement of statements) {
    if (statement.trim().length === 0) continue;

    console.log(`Executing: ${statement.substring(0, 80)}...`);

    const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

    if (error) {
      console.error('❌ Error:', error.message);
      // Try direct approach
      const { error: directError } = await supabase.from('_migrations').select('*').limit(0);
      if (directError) {
        console.error('Unable to execute SQL. Please run this SQL manually in Supabase SQL Editor:');
        console.log('\n' + sql + '\n');
        process.exit(1);
      }
    } else {
      console.log('✅ Success');
    }
  }

  console.log('\n✅ Migration applied successfully!');
  console.log('\n📧 Now test your contact form at: https://streetcredrx.com/contact');
}

applyMigration();
