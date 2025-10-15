/**
 * Update ajlipka@gmail.com to Super Admin
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n🔧 Updating ajlipka@gmail.com to Super Admin');
  console.log('==========================================\n');
  
  const userId = 'f78c19be-a01d-4362-a1f3-17532460fcfb';
  const targetEmail = 'ajlipka@gmail.com';
  
  try {
    // Update the profile with role_id and email
    console.log('📝 Updating profile...\n');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role_id: 4, // Super admin
        email: targetEmail
      })
      .eq('id', userId)
      .select('*, roles(name)')
      .single();
    
    if (error) throw error;
    
    console.log('✅ Successfully updated user access!');
    console.log('');
    console.log('User details:');
    console.log(`   Email: ${data.email}`);
    console.log(`   Name: ${data.first_name} ${data.last_name}`);
    console.log(`   Role: ${data.roles?.name} (ID: ${data.role_id})`);
    console.log('');
    console.log('🎉 ajlipka@gmail.com now has full Super Admin access!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
