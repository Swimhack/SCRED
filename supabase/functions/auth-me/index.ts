import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts"
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// JWT secret key - store this in environment variables
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this'

async function verifyToken(token: string): Promise<{ sub: string; email: string } | null> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    const payload = await verify(token, key)

    if (typeof payload === 'object' && payload !== null && 'sub' in payload && 'email' in payload) {
      return {
        sub: payload.sub as string,
        email: payload.email as string
      }
    }

    return null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let pool: Pool | null = null

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing or invalid authorization header'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const payload = await verifyToken(token)

    if (!payload) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get NeonDB connection string
    const neonDbUrl = Deno.env.get('NEON_DATABASE_URL') ||
      'postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

    pool = new Pool(neonDbUrl, 3, true)
    const connection = await pool.connect()

    try {
      // Get user from database
      const userResult = await connection.queryObject<{
        id: string
        email: string
        email_confirmed_at: string | null
        created_at: string
        updated_at: string
      }>(
        `SELECT id, email, email_confirmed_at, created_at, updated_at
         FROM users
         WHERE id = $1
         LIMIT 1`,
        [payload.sub]
      )

      if (userResult.rows.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'User not found'
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const user = userResult.rows[0]

      // Get profile information
      const profileResult = await connection.queryObject<{
        id: string
        first_name: string | null
        last_name: string | null
        role_id: number | null
      }>(
        `SELECT id, first_name, last_name, role_id
         FROM profiles
         WHERE id = $1
         LIMIT 1`,
        [user.id]
      )

      let profile = profileResult.rows[0]

      // If no profile exists, create one
      if (!profile) {
        await connection.queryObject(
          `INSERT INTO profiles (id, email, role_id)
           VALUES ($1, $2, 1)`,
          [user.id, user.email]
        )
        profile = {
          id: user.id,
          first_name: null,
          last_name: null,
          role_id: 1
        }
      }

      // Get role name
      const roleResult = await connection.queryObject<{
        name: string
      }>(
        `SELECT name FROM roles WHERE id = $1 LIMIT 1`,
        [profile.role_id || 1]
      )

      const roleName = roleResult.rows[0]?.name || 'user'

      // Return user data
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            roleId: profile.role_id,
            roleName: roleName,
            isSuperAdmin: profile.role_id === 4,
            emailVerified: !!user.email_confirmed_at,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('Auth-me error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } finally {
    if (pool) {
      await pool.end()
    }
  }
})
