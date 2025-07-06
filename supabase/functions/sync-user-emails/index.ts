import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting email sync process...");

    // Get all users from auth with pagination to handle large user bases
    let allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    
    while (true) {
      const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      });
      
      if (authError) {
        throw new Error(`Failed to fetch users (page ${page}): ${authError.message}`);
      }

      if (!users || users.length === 0) {
        break;
      }

      allUsers = allUsers.concat(users);
      
      if (users.length < perPage) {
        break; // Last page
      }
      
      page++;
    }

    console.log(`Found ${allUsers.length} total users in auth`);

    // Update profiles with email addresses
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      // Get email from user object (works for both regular signup and OAuth)
      const email = user.email;
      
      if (!email) {
        console.log(`Skipping user ${user.id} - no email found`);
        skippedCount++;
        continue;
      }

      try {
        // Check if profile exists first
        const { data: existingProfile, error: fetchError } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
          console.error(`Error fetching profile for user ${user.id}:`, fetchError);
          errorCount++;
          continue;
        }

        if (existingProfile) {
          // Update existing profile
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              email: email,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error(`Failed to update email for user ${user.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`Updated email for user ${user.id}: ${email}`);
            updatedCount++;
          }
        } else {
          console.log(`Profile not found for user ${user.id}, skipping`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    const summary = {
      success: true,
      message: `Email sync completed: ${updatedCount} updated, ${skippedCount} skipped, ${errorCount} errors`,
      totalUsers: allUsers.length,
      updatedCount,
      skippedCount,
      errorCount
    };

    console.log("Sync summary:", summary);

    return new Response(
      JSON.stringify(summary),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in sync-user-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);