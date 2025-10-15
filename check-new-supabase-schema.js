/**
 * Check New Supabase Schema
 * Verifies that the new Supabase instance has all required tables
 */

import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY;

if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEW_SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Usage: NEW_SUPABASE_SERVICE_KEY=your_service_key node check-new-supabase-schema.js');
  process.exit(1);
}

const supabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

const REQUIRED_TABLES = [
  'roles',
  'profiles',
  'pharmacist_applications',
  'pharmacist_questionnaires',
  'developer_messages',
  'ai_analysis',
  'notification_preferences',
  'notification_logs',
  'user_invitations',
  'user_activity_logs',
  'application_logs',
  'contact_submissions'
];

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return { name: tableName, exists: false, error: 'Table does not exist' };
      }
      return { name: tableName, exists: false, error: error.message };
    }
    
    return { name: tableName, exists: true };
  } catch (err) {
    return { name: tableName, exists: false, error: err.message };
  }
}

async function main() {
  console.log('\n🔍 Checking New Supabase Schema');
  console.log('=================================\n');
  console.log('URL:', NEW_SUPABASE_URL);
  console.log('');
  
  console.log('Checking required tables...\n');
  
  const results = [];
  for (const table of REQUIRED_TABLES) {
    const result = await checkTable(table);
    results.push(result);
    
    if (result.exists) {
      console.log(`✅ ${table} - exists`);
    } else {
      console.log(`❌ ${table} - MISSING (${result.error})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  
  console.log(`✅ Existing tables: ${existing.length}/${REQUIRED_TABLES.length}`);
  console.log(`❌ Missing tables: ${missing.length}/${REQUIRED_TABLES.length}`);
  
  if (missing.length > 0) {
    console.log('\n⚠️  MIGRATION REQUIRED ⚠️');
    console.log('\nThe following tables are missing:');
    missing.forEach(t => console.log(`   - ${t.name}`));
    console.log('\nYou need to apply database migrations before migrating data.');
    console.log('Run the following commands:\n');
    console.log('  # Option 1: Using Supabase CLI');
    console.log('  supabase link --project-ref tvqyozyjqcswojsbduzw');
    console.log('  supabase db push\n');
    console.log('  # Option 2: Manually apply migrations');
    console.log('  # Copy the SQL from supabase/migrations/ and run in Supabase SQL Editor\n');
  } else {
    console.log('\n✅ All required tables exist!');
    console.log('You can proceed with data migration.\n');
    console.log('Run: $env:NEW_SUPABASE_SERVICE_KEY="your-key"; node migrate-supabase-data.js\n');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
