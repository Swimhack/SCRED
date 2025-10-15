/**
 * List Users and Create Admin Invitation
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://tvqyozyjqcswojsbduzw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listAllUsers() {
  console.log('\n📋 ALL REGISTERED USERS');
  console.log('======================\n');
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!profiles || profiles.length === 0) {
      console.log('No users found in database.\n');
      return [];
    }
    
    console.log(`Found ${profiles.length} user(s):\n`);
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.email || 'No email'}`);
      console.log(`   Name: ${profile.first_name || 'N/A'} ${profile.last_name || 'N/A'}`);
      console.log(`   Role: ${profile.roles?.name || 'unknown'} (ID: ${profile.role_id})`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
      console.log('');
    });
    
    return profiles;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    return [];
  }
}

async function createAdminUser() {
  console.log('\n👤 CREATING ADMIN USER FOR ajlipka@gmail.com');
  console.log('============================================\n');
  
  const targetEmail = 'ajlipka@gmail.com';
  const tempPassword = crypto.randomBytes(16).toString('hex');
  
  try {
    // Check if user already exists in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;
    
    const existingUser = users.find(u => u.email === targetEmail);
    
    if (existingUser) {
      console.log('✅ User already exists in authentication system');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}\n`);
      
      // Update their role to super_admin
      console.log('📝 Updating user role to Super Admin...\n');
      
      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({ role_id: 4 }) // Super admin
        .eq('id', existingUser.id)
        .select('*, roles(name)')
        .single();
      
      if (updateError) {
        console.warn('Note: Profile may not exist yet, creating it...');
        
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.id,
            email: existingUser.email,
            first_name: existingUser.user_metadata?.first_name || '',
            last_name: existingUser.user_metadata?.last_name || '',
            role_id: 4
          });
        
        if (insertError) throw insertError;
        console.log('✅ Profile created with Super Admin access!\n');
      } else {
        console.log('✅ User role updated to Super Admin!\n');
      }
      
      return;
    }
    
    // Create new user
    console.log('Creating new user account...\n');
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'A.J.',
        last_name: 'Lipka'
      }
    });
    
    if (createError) throw createError;
    
    console.log('✅ User account created!');
    console.log(`   Email: ${newUser.user.email}`);
    console.log(`   User ID: ${newUser.user.id}\n`);
    
    // Create profile with super_admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: targetEmail,
        first_name: 'A.J.',
        last_name: 'Lipka',
        role_id: 4 // Super admin
      });
    
    if (profileError) {
      console.warn('Warning: Profile creation had an issue, but user exists.');
      console.log('The trigger should create the profile automatically.\n');
    } else {
      console.log('✅ Profile created with Super Admin access!\n');
    }
    
    console.log('🔐 TEMPORARY PASSWORD (save this):\n');
    console.log(`   ${tempPassword}\n`);
    console.log('⚠️  IMPORTANT: Send this password securely to ajlipka@gmail.com');
    console.log('   They should change it immediately after first login.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║     USER MANAGEMENT & ADMIN ACCESS         ║');
  console.log('╚════════════════════════════════════════════╝');
  
  // List all current users
  const users = await listAllUsers();
  
  // Check if ajlipka@gmail.com exists
  const targetUser = users.find(u => u.email === 'ajlipka@gmail.com');
  
  if (!targetUser) {
    console.log('⚠️  ajlipka@gmail.com not found. Creating admin account...\n');
    await createAdminUser();
  } else {
    console.log('✅ ajlipka@gmail.com already exists!\n');
    
    if (targetUser.role_id !== 4) {
      console.log('📝 Updating to Super Admin role...\n');
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: 4 })
        .eq('id', targetUser.id);
      
      if (error) {
        console.error('❌ Failed to update role:', error.message);
      } else {
        console.log('✅ User role updated to Super Admin!\n');
      }
    } else {
      console.log('✅ User already has Super Admin access!\n');
    }
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
