/**
 * Supabase Data Migration Script
 * Migrates all data from old Supabase instance to new instance
 * 
 * OLD: https://sctzykgcfkhadowyqcrj.supabase.co
 * NEW: https://tvqyozyjqcswojsbduzw.supabase.co
 */

import { createClient } from '@supabase/supabase-js';

// Old Supabase configuration
const OLD_SUPABASE_URL = 'https://sctzykgcfkhadowyqcrj.supabase.co';
const OLD_SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHN5a2djZmtoYWRvd3lnY3JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5MTkwNSwiZXhwIjoyMDY3MTY3OTA1fQ.LZO9ckLrpeSFGf1Av0v9bFqpSP8dcQllrFJ-yHGAZdo';

// New Supabase configuration
const NEW_SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const NEW_SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_KEY;

if (!NEW_SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEW_SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Usage: NEW_SUPABASE_SERVICE_KEY=your_service_key node migrate-supabase-data.js');
  process.exit(1);
}

const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_KEY);

// Tables to migrate in dependency order
const TABLES_TO_MIGRATE = [
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

async function testConnection(supabase, label) {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log(`✅ ${label} connection successful`);
    return true;
  } catch (error) {
    console.error(`❌ ${label} connection failed:`, error.message);
    return false;
  }
}

async function getTableData(supabase, tableName) {
  console.log(`📥 Fetching data from ${tableName}...`);
  let allData = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + batchSize - 1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`⚠️  Table ${tableName} does not exist in source database`);
        return null;
      }
      throw error;
    }
    
    if (!data || data.length === 0) break;
    
    allData = allData.concat(data);
    console.log(`   Fetched ${data.length} rows (total: ${allData.length})`);
    
    if (data.length < batchSize) break;
    from += batchSize;
  }
  
  return allData;
}

async function insertTableData(supabase, tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⏭️  No data to insert for ${tableName}`);
    return { success: 0, failed: 0 };
  }
  
  console.log(`📤 Inserting ${data.length} rows into ${tableName}...`);
  
  const batchSize = 100;
  let successCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`   ❌ Batch ${i}-${i + batch.length} failed:`, error.message);
        failedCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`   ✅ Inserted batch ${i}-${i + batch.length} (${successCount}/${data.length})`);
      }
    } catch (err) {
      console.error(`   ❌ Batch ${i}-${i + batch.length} error:`, err.message);
      failedCount += batch.length;
    }
  }
  
  return { success: successCount, failed: failedCount };
}

async function migrateTable(tableName) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Migrating table: ${tableName}`);
  console.log('='.repeat(60));
  
  try {
    // Fetch data from old database
    const data = await getTableData(oldSupabase, tableName);
    
    if (data === null) {
      return { table: tableName, status: 'skipped', reason: 'Table does not exist' };
    }
    
    if (data.length === 0) {
      return { table: tableName, status: 'skipped', reason: 'No data to migrate' };
    }
    
    // Insert data into new database
    const result = await insertTableData(newSupabase, tableName, data);
    
    return {
      table: tableName,
      status: result.failed === 0 ? 'success' : 'partial',
      total: data.length,
      success: result.success,
      failed: result.failed
    };
  } catch (error) {
    console.error(`❌ Error migrating ${tableName}:`, error.message);
    return {
      table: tableName,
      status: 'error',
      error: error.message
    };
  }
}

async function main() {
  console.log('\n🚀 Starting Supabase Data Migration');
  console.log('====================================\n');
  console.log('OLD:', OLD_SUPABASE_URL);
  console.log('NEW:', NEW_SUPABASE_URL);
  console.log('');
  
  // Test connections
  console.log('Testing connections...\n');
  const oldConnected = await testConnection(oldSupabase, 'Old Supabase');
  const newConnected = await testConnection(newSupabase, 'New Supabase');
  
  if (!oldConnected || !newConnected) {
    console.error('\n❌ Connection test failed. Aborting migration.');
    process.exit(1);
  }
  
  console.log('\n✅ Both connections successful. Starting migration...\n');
  
  // Migrate each table
  const results = [];
  for (const table of TABLES_TO_MIGRATE) {
    const result = await migrateTable(table);
    results.push(result);
  }
  
  // Print summary
  console.log('\n\n');
  console.log('='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log('');
  
  const successTables = results.filter(r => r.status === 'success');
  const partialTables = results.filter(r => r.status === 'partial');
  const errorTables = results.filter(r => r.status === 'error');
  const skippedTables = results.filter(r => r.status === 'skipped');
  
  console.log(`✅ Successful: ${successTables.length}`);
  successTables.forEach(r => {
    console.log(`   - ${r.table}: ${r.success} rows migrated`);
  });
  
  if (partialTables.length > 0) {
    console.log(`\n⚠️  Partial: ${partialTables.length}`);
    partialTables.forEach(r => {
      console.log(`   - ${r.table}: ${r.success}/${r.total} rows (${r.failed} failed)`);
    });
  }
  
  if (errorTables.length > 0) {
    console.log(`\n❌ Errors: ${errorTables.length}`);
    errorTables.forEach(r => {
      console.log(`   - ${r.table}: ${r.error}`);
    });
  }
  
  if (skippedTables.length > 0) {
    console.log(`\n⏭️  Skipped: ${skippedTables.length}`);
    skippedTables.forEach(r => {
      console.log(`   - ${r.table}: ${r.reason}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  const totalSuccess = results.reduce((sum, r) => sum + (r.success || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failed || 0), 0);
  
  console.log(`\n📈 Total: ${totalSuccess} rows migrated successfully`);
  if (totalFailed > 0) {
    console.log(`❌ Total: ${totalFailed} rows failed`);
  }
  
  console.log('\n✅ Migration complete!\n');
}

// Run the migration
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
