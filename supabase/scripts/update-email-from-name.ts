// Script to update Supabase email from name via Management API
// Run with: deno run --allow-net --allow-env update-email-from-name.ts

/**
 * Updates the email "from name" in Supabase Cloud project
 * 
 * This script uses Supabase Management API to update email settings.
 * Requires SUPABASE_ACCESS_TOKEN environment variable.
 * 
 * Usage:
 *   export SUPABASE_ACCESS_TOKEN=your_access_token
 *   deno run --allow-net --allow-env update-email-from-name.ts
 */

const SUPABASE_PROJECT_REF = "tvqyozyjqcswojsbduzw";
const SUPABASE_ACCESS_TOKEN = Deno.env.get("SUPABASE_ACCESS_TOKEN");

if (!SUPABASE_ACCESS_TOKEN) {
  console.error("❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required");
  console.log("\nTo get your access token:");
  console.log("1. Go to: https://supabase.com/dashboard/account/tokens");
  console.log("2. Create a new access token");
  console.log("3. Set it as: export SUPABASE_ACCESS_TOKEN=your_token");
  Deno.exit(1);
}

const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`;

interface EmailSettings {
  enable_signup?: boolean;
  enable_confirmations?: boolean;
  mailer_from_name?: string;
  mailer_from_email?: string;
}

async function updateEmailFromName() {
  try {
    console.log("🔄 Updating Supabase email from name...");
    
    // Get current settings first
    const getResponse = await fetch(`${MANAGEMENT_API_URL}/config/auth`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`Failed to get current settings: ${getResponse.status} ${errorText}`);
    }

    const currentSettings = await getResponse.json();
    console.log("✅ Current settings retrieved");

    // Update email settings
    const emailSettings: EmailSettings = {
      mailer_from_name: "StreetCredRX",
      mailer_from_email: "noreply@streetcredrx.com",
    };

    // Update auth config
    const updateResponse = await fetch(`${MANAGEMENT_API_URL}/config/auth`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentSettings,
        ...emailSettings,
      }),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update settings: ${updateResponse.status} ${errorText}`);
    }

    const updatedSettings = await updateResponse.json();
    console.log("✅ Email from name updated successfully!");
    console.log("\n📧 Email Settings:");
    console.log(`   From Name: ${updatedSettings.mailer_from_name || emailSettings.mailer_from_name}`);
    console.log(`   From Email: ${updatedSettings.mailer_from_email || emailSettings.mailer_from_email}`);
    console.log("\n✨ All authentication emails will now show 'StreetCredRX' as the sender name!");

  } catch (error) {
    console.error("❌ Error updating email settings:", error);
    console.log("\n💡 Alternative: Update via Supabase Dashboard:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/auth/templates");
    console.log("   2. Click 'Settings' tab");
    console.log("   3. Set 'From Name' to: StreetCredRX");
    console.log("   4. Set 'From Email' to: noreply@streetcredrx.com");
    Deno.exit(1);
  }
}

updateEmailFromName();

