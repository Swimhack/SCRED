import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LogFilters {
  level?: string;
  component?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET and POST methods
  if (!['GET', 'POST'].includes(req.method)) {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has admin role (role_id = 4)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role_id !== 4) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse query parameters OR body for filters
    let filters: LogFilters = {};
    
    if (req.method === 'GET') {
      // Parse from URL parameters
      const url = new URL(req.url);
      filters = {
        level: url.searchParams.get('level') || undefined,
        component: url.searchParams.get('component') || undefined,
        user_id: url.searchParams.get('user_id') || undefined,
        start_date: url.searchParams.get('start_date') || undefined,
        end_date: url.searchParams.get('end_date') || undefined,
        limit: parseInt(url.searchParams.get('limit') || '100'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
        search: url.searchParams.get('search') || undefined,
      };
    } else if (req.method === 'POST') {
      // Parse from request body with input validation
      const body = await req.json();
      
      // Sanitize and validate inputs
      filters = {
        level: typeof body.level === 'string' ? body.level.slice(0, 50) : undefined,
        component: typeof body.component === 'string' ? body.component.slice(0, 100) : undefined,
        user_id: typeof body.user_id === 'string' ? body.user_id.slice(0, 50) : undefined,
        start_date: typeof body.start_date === 'string' ? body.start_date.slice(0, 50) : undefined,
        end_date: typeof body.end_date === 'string' ? body.end_date.slice(0, 50) : undefined,
        limit: Math.min(Math.max(parseInt(body.limit) || 100, 1), 1000),
        offset: Math.max(parseInt(body.offset) || 0, 0),
        search: typeof body.search === 'string' ? body.search.slice(0, 500) : undefined,
      };
      
      // Validate date formats if provided
      if (filters.start_date && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(filters.start_date)) {
        throw new Error('Invalid start_date format');
      }
      if (filters.end_date && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(filters.end_date)) {
        throw new Error('Invalid end_date format');
      }
    }

    // Validate and sanitize filters
    if (filters.limit && (filters.limit < 1 || filters.limit > 1000)) {
      filters.limit = 100
    }
    if (filters.offset && filters.offset < 0) {
      filters.offset = 0
    }

    console.log('Fetching logs with filters:', filters)

    // Build the query
    let query = supabase
      .from('application_logs')
      .select('*')
      .order('timestamp', { ascending: false })

    // Apply filters
    if (filters.level) {
      query = query.eq('level', filters.level)
    }
    if (filters.component) {
      query = query.eq('component', filters.component)
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date)
    }
    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date)
    }
    if (filters.search) {
      query = query.or(`message.ilike.%${filters.search}%,component.ilike.%${filters.search}%`)
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 100) - 1)
    }

    // Execute query
    const { data: logs, error: queryError } = await query

    if (queryError) {
      console.error('Database query error:', queryError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch logs' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('application_logs')
      .select('*', { count: 'exact', head: true })

    // Apply same filters to count query (except pagination)
    if (filters.level) {
      countQuery = countQuery.eq('level', filters.level)
    }
    if (filters.component) {
      countQuery = countQuery.eq('component', filters.component)
    }
    if (filters.user_id) {
      countQuery = countQuery.eq('user_id', filters.user_id)
    }
    if (filters.start_date) {
      countQuery = countQuery.gte('timestamp', filters.start_date)
    }
    if (filters.end_date) {
      countQuery = countQuery.lte('timestamp', filters.end_date)
    }
    if (filters.search) {
      countQuery = countQuery.or(`message.ilike.%${filters.search}%,component.ilike.%${filters.search}%`)
    }

    const { count } = await countQuery

    // Return structured response
    const response = {
      success: true,
      data: logs,
      pagination: {
        total: count || 0,
        limit: filters.limit || 100,
        offset: filters.offset || 0,
        has_more: (count || 0) > (filters.offset || 0) + (filters.limit || 100)
      },
      filters: filters,
      timestamp: new Date().toISOString()
    }

    console.log(`Returning ${logs?.length || 0} logs out of ${count || 0} total`)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})