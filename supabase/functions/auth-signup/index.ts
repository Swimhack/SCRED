import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
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

    const { email, password, firstName, lastName }: SignupRequest = await req.json()

    // Validation
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Password must be at least 6 characters long'
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
      // Check if user already exists
      const existingUser = await connection.queryObject(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
        [email]
      )

      if (existingUser.rows.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'An account with this email already exists'
          }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password)

      // Create user
      const userResult = await connection.queryObject<{
        id: string
        email: string
        created_at: string
        updated_at: string
      }>(
        `INSERT INTO users (email, encrypted_password, email_confirmed_at, confirmed_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, email, created_at, updated_at`,
        [email, hashedPassword]
      )

      const user = userResult.rows[0]

      // Create profile
      await connection.queryObject(
        `INSERT INTO profiles (id, email, first_name, last_name, role_id)
         VALUES ($1, $2, $3, $4, 1)`,
        [user.id, user.email, firstName || null, lastName || null]
      )

      // Get role name
      const roleResult = await connection.queryObject<{
        name: string
      }>(
        `SELECT name FROM roles WHERE id = 1 LIMIT 1`
      )

      const roleName = roleResult.rows[0]?.name || 'user'

      // Generate JWT token
      const token = await generateToken(user.id, user.email)

      // Log the signup
      await connection.queryObject(
        `INSERT INTO application_logs (level, message, metadata, user_id, route)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'info',
          'User signed up',
          JSON.stringify({ email: user.email, firstName, lastName }),
          user.id,
          '/api/auth-signup'
        ]
      )

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: firstName || null,
            lastName: lastName || null,
            roleId: 1,
            roleName: roleName,
            isSuperAdmin: false,
            emailVerified: true,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          }
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('Signup error:', error)
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
