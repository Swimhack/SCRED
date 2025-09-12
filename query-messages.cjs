#!/usr/bin/env node

// CLI script to query developer messages from Supabase
// Usage: node query-messages.cjs

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://sctzykgcfkhadowyqcrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjdHp5a2djZmtoYWRvd3lxY3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTE5MDUsImV4cCI6MjA2NzE2NzkwNX0.8cpoEx0MXO0kkTqDrpkbYRhXQHVQ0bmjHA0xI2rUWqY";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function queryLatestMessages() {
  try {
    console.log('🔍 Querying latest developer messages...\n');

    // Query ALL messages (no limit to get everything)
    const { data: messages, error } = await supabase
      .from('developer_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying messages:', error.message);
      
      // If RLS blocks access, try without user info
      console.log('🔄 Trying simplified query...\n');
      
      const { data: simpleMessages, error: simpleError } = await supabase
        .from('developer_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.error('❌ Simple query also failed:', simpleError.message);
        console.log('\n💡 This might be due to Row Level Security (RLS) policies.');
        console.log('   You may need to authenticate as a user with appropriate permissions.');
        return;
      }

      messages = simpleMessages || [];
    }

    if (!messages || messages.length === 0) {
      console.log('📭 No messages found in the database.');
      return;
    }

    console.log(`📨 Found ${messages.length} messages:\n`);

    messages.forEach((message, index) => {
      const priorityEmoji = {
        urgent: '🔴',
        high: '🟠',
        normal: '🔵',
        low: '⚫'
      };

      const categoryEmoji = {
        bug_report: '🐛',
        feature_request: '✨',
        question: '❓',
        approval_needed: '✅',
        update: '💬',
        general: '💬'
      };

      console.log(`${index + 1}. ${categoryEmoji[message.category] || '💭'} ${priorityEmoji[message.priority] || '🔵'} ${message.category?.toUpperCase() || 'GENERAL'} - ${message.priority?.toUpperCase() || 'NORMAL'}`);
      console.log(`   📅 ${new Date(message.created_at).toLocaleString()}`);
      console.log(`   👤 From: ${message.sender_type} → ${message.recipient_type}`);
      console.log(`   📝 Message: ${message.message}`);
      console.log(`   📊 Status: ${message.status}`);
      
      if (message.thread_id) {
        console.log(`   🧵 Thread: ${message.thread_id}`);
      }

      if (message.ai_analysis && message.ai_analysis.length > 0) {
        const analysis = message.ai_analysis[0];
        console.log(`   🤖 AI Analysis: ${analysis.analysis_type} (${Math.round(analysis.confidence_score * 100)}% confidence)`);
        if (analysis.generated_prompt) {
          console.log(`   🎯 Generated Prompt: ${analysis.generated_prompt.substring(0, 100)}...`);
        }
      }

      console.log('');
    });

  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

async function checkConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('developer_messages')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log(`⚠️  Connection test failed: ${error.message}`);
      return false;
    }

    console.log(`✅ Connection successful! Total messages: ${data || 'Unknown'}\n`);
    return true;
  } catch (err) {
    console.log(`❌ Connection error: ${err.message}\n`);
    return false;
  }
}

async function main() {
  console.log('🚀 StreetCredRx Message Query Tool\n');
  
  const connected = await checkConnection();
  if (connected) {
    await queryLatestMessages();
  }

  console.log('\n💡 Tips:');
  console.log('   • Messages may be protected by Row Level Security');
  console.log('   • You might need to authenticate first to see all data');
  console.log('   • Check the web app at https://streetcredrx1.lovable.app/messages for full access');
}

// Run the script
main().catch(console.error);