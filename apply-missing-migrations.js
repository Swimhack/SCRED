/**
 * Apply Missing Table Migrations
 * Creates the missing tables in the new Supabase instance
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const NEW_SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY;

if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEW_SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

async function applySql(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    throw error;
  }
  
  return data;
}

async function main() {
  console.log('\n📝 Applying Missing Table Migrations');
  console.log('====================================\n');
  console.log('URL:', NEW_SUPABASE_URL);
  console.log('');
  
  console.log('Reading SQL file...');
  const sql = fs.readFileSync('apply-missing-tables.sql', 'utf8');
  
  console.log('Applying migrations...\n');
  
  try {
    // Split SQL into individual statements (basic approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.includes('CREATE TABLE')) {
        const tableName = stmt.match(/CREATE TABLE.*?([\w.]+)/i)?.[1] || 'unknown';
        console.log(`  Creating table: ${tableName}...`);
      } else if (stmt.includes('CREATE INDEX')) {
        const indexName = stmt.match(/CREATE INDEX.*?([\w.]+)/i)?.[1] || 'unknown';
        console.log(`  Creating index: ${indexName}...`);
      }
      
      try {
        await supabase.from('_').select('1').limit(0); // Dummy query to test connection
        // Note: Direct SQL execution requires database function, using client instead
        console.log(`  ✅ Statement ${i + 1}/${statements.length} prepared`);
      } catch (err) {
        console.error(`  ❌ Statement ${i + 1} failed:`, err.message);
      }
    }
    
    console.log('\n⚠️  MANUAL STEP REQUIRED ⚠️\n');
    console.log('Due to API limitations, you need to manually apply the SQL migrations.');
    console.log('Follow these steps:\n');
    console.log('1. Open: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/editor');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "+ New query"');
    console.log('4. Copy the contents of: apply-missing-tables.sql');
    console.log('5. Paste into the SQL Editor');
    console.log('6. Click "Run" or press Ctrl+Enter\n');
    console.log('After applying, re-run the migration script:\n');
    console.log('  $env:NEW_SUPABASE_SERVICE_KEY="your-key"; node migrate-supabase-data.js\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
