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

    // Get all users from auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch users: ${authError.message}`);
    }

    console.log(`Found ${users?.length || 0} users in auth`);

    // Update profiles with email addresses
    let updatedCount = 0;
    
    if (users) {
      for (const user of users) {
        if (user.email) {
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ email: user.email })
            .eq('id', user.id);
            
          if (updateError) {
            console.error(`Failed to update email for user ${user.id}:`, updateError);
          } else {
            updatedCount++;
          }
        }
      }
    }

    console.log(`Updated ${updatedCount} user emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${updatedCount} user emails`,
        totalUsers: users?.length || 0,
        updatedCount 
      }),
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