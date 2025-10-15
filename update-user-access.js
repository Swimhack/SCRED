/**
 * Update User Access Level
 * Ensures ajlipka@gmail.com has admin access
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Usage: SUPABASE_SERVICE_KEY=your_service_key node update-user-access.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('\n🔍 Checking User Access');
  console.log('======================\n');
  
  const targetEmail = 'ajlipka@gmail.com';
  
  try {
    // First, get all roles to find the admin role ID
    console.log('📋 Fetching available roles...\n');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('id');
    
    if (rolesError) throw rolesError;
    
    console.log('Available roles:');
    roles.forEach(role => {
      console.log(`   ${role.id}. ${role.name} - ${role.description}`);
    });
    console.log('');
    
    // Find the super_admin role (typically ID 4)
    const superAdminRole = roles.find(r => r.name === 'super_admin');
    if (!superAdminRole) {
      throw new Error('Super admin role not found!');
    }
    
    console.log(`✅ Super Admin role found: ID ${superAdminRole.id}\n`);
    
    // Check current user
    console.log(`🔍 Looking for user: ${targetEmail}...\n`);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('email', targetEmail);
    
    if (profileError) throw profileError;
    
    if (!profiles || profiles.length === 0) {
      console.log(`❌ User ${targetEmail} not found in database.`);
      console.log('The user needs to sign up first.\n');
      return;
    }
    
    const profile = profiles[0];
    console.log('Current user status:');
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
    console.log(`   Current Role: ${profile.roles?.name || 'unknown'} (ID: ${profile.role_id})`);
    console.log('');
    
    // Update if needed
    if (profile.role_id === superAdminRole.id) {
      console.log('✅ User already has Super Admin access!');
      console.log('   No changes needed.\n');
    } else {
      console.log(`⚠️  User currently has role ID ${profile.role_id}`);
      console.log(`📝 Updating to Super Admin (ID ${superAdminRole.id})...\n`);
      
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: superAdminRole.id })
        .eq('id', profile.id)
        .select('*, roles(name)')
        .single();
      
      if (updateError) throw updateError;
      
      console.log('✅ Successfully updated user access!');
      console.log('');
      console.log('New user status:');
      console.log(`   Email: ${updated.email}`);
      console.log(`   Name: ${updated.first_name} ${updated.last_name}`);
      console.log(`   Role: ${updated.roles?.name} (ID: ${updated.role_id})`);
      console.log('');
      console.log('🎉 User now has full Super Admin access!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
