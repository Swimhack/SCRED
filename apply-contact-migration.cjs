const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://sctzykgcfkhadowyqcrj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHN5a2djZmtoYWRvd3lnY3JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5MTkwNSwiZXhwIjoyMDY3MTY3OTA1fQ.LZO9ckLrpeSFGf1Av0v9bFqpSP8dcQllrFJ-yHGAZdo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Reading migration SQL...');
    const sql = fs.readFileSync('./manual-contact-migration.sql', 'utf8');
    
    console.log('Applying contact_submissions table migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sql
    });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration applied successfully');
    
    // Test the table exists
    const { data: testData, error: testError } = await supabase
      .from('contact_submissions')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.log('⚠️  Table test failed:', testError.message);
    } else {
      console.log('✅ contact_submissions table is accessible');
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();