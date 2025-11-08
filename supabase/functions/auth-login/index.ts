import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

// JWT secret key - store this in environment variables
const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-this'

async function generateToken(userId: string, email: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const payload = {
    sub: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  }

  return await create({ alg: "HS256", typ: "JWT" }, payload, key)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let pool: Pool | null = null

  try {
    // Get NeonDB connection string
    const neonDbUrl = Deno.env.get('NEON_DATABASE_URL') ||
      'postgresql://neondb_owner:npg_1GEjV8oCAUNZ@ep-rough-leaf-ahl8nq8p-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'

    pool = new Pool(neonDbUrl, 3, true)

    const { email, password }: LoginRequest = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and password are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Connect to database
    const connection = await pool.connect()

    try {
      // Find user by email
      const userResult = await connection.queryObject<{
        id: string
        email: string
        encrypted_password: string
        email_confirmed_at: string | null
        created_at: string
        updated_at: string
      }>(
        `SELECT id, email, encrypted_password, email_confirmed_at, created_at, updated_at
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
      )

      if (userResult.rows.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const user = userResult.rows[0]

      // Verify password
      if (!user.encrypted_password) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Account not properly configured. Please contact support.'
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      const passwordMatch = await bcrypt.compare(password, user.encrypted_password)

      if (!passwordMatch) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid email or password'
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

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

      // Update last_sign_in_at
      await connection.queryObject(
        `UPDATE users SET last_sign_in_at = NOW() WHERE id = $1`,
        [user.id]
      )

      // Generate JWT token
      const token = await generateToken(user.id, user.email)

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          token,
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
    console.error('Login error:', error)
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
