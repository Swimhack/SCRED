const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sctzykgcfkhadowyqcrj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHN5a2djZmtoYWRvd3lnY3JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5MTkwNSwiZXhwIjoyMDY3MTY3OTA1fQ.LZO9ckLrpeSFGf1Av0v9bFqpSP8dcQllrFJ-yHGAZdo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTable() {
  try {
    console.log('Creating contact_submissions table...');
    
    // First, let's check if table exists
    const { data: tables, error: listError } = await supabase
      .rpc('exec_sql', { 
        sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_submissions';
        `
      });
    
    if (listError) {
      console.log('Could not check existing tables, proceeding with creation...');
    } else {
      console.log('Existing tables check result:', tables);
    }
    
    // Create the table with a simple SQL command
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.contact_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow anonymous insert" ON public.contact_submissions FOR INSERT TO anon WITH CHECK (true);
      CREATE POLICY IF NOT EXISTS "Allow authenticated read" ON public.contact_submissions FOR SELECT TO authenticated USING (true);
    `;
    
    console.log('Executing SQL...');
    
    // Try using direct SQL execution
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (error) {
      console.error('Error creating table:', error);
      
      // Fallback: try inserting a test record to see if table exists
      console.log('Trying alternative approach...');
      
      const { data: testInsert, error: insertError } = await supabase
        .from('contact_submissions')
        .insert({
          name: 'Test User',
          email: 'test@example.com', 
          message: 'Test message'
        })
        .select();
        
      if (insertError) {
        console.error('Table does not exist:', insertError.message);
        return;
      } else {
        console.log('✅ Table exists and is writable');
        
        // Clean up test record
        await supabase
          .from('contact_submissions')
          .delete()
          .eq('email', 'test@example.com');
      }
    } else {
      console.log('✅ SQL executed successfully');
    }
    
    // Test table access
    const { data: testData, error: testError } = await supabase
      .from('contact_submissions')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('❌ Table test failed:', testError.message);
    } else {
      console.log('✅ contact_submissions table is accessible');
      console.log('Current records:', testData?.length || 0);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTable();