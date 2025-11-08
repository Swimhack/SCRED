// Express API server for authentication using Neon database
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Database connection
const connectionString = process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('NEON_DATABASE_URL environment variable is not configured');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const DEFAULT_TOKEN_TTL = '12h';
const REMEMBER_ME_TTL = '30d';

// Helper functions
function signAuthToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? REMEMBER_ME_TTL : DEFAULT_TOKEN_TTL;
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      role: payload.role ?? null,
      rememberMe: rememberMe ?? false,
    },
    JWT_SECRET,
    { expiresIn }
  );
}

function verifyAuthToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role ?? null,
    rememberMe: Boolean(decoded.rememberMe),
  };
}

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `
      SELECT
        u.id,
        u.email,
        u.encrypted_password,
        u.email_confirmed_at,
        u.is_super_admin,
        u.created_at,
        u.updated_at,
        p.first_name,
        p.last_name,
        p.role_id,
        r.name AS role_name
      FROM public.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      LEFT JOIN public.roles r ON r.id = p.role_id
      WHERE LOWER(u.email) = LOWER($1)
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [email]
  );
  return rows[0] ?? null;
}

async function findUserById(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        u.id,
        u.email,
        u.encrypted_password,
        u.email_confirmed_at,
        u.is_super_admin,
        u.created_at,
        u.updated_at,
        p.first_name,
        p.last_name,
        p.role_id,
        r.name AS role_name
      FROM public.users u
      LEFT JOIN public.profiles p ON p.id = u.id
      LEFT JOIN public.roles r ON r.id = p.role_id
      WHERE u.id = $1
        AND u.deleted_at IS NULL
      LIMIT 1
    `,
    [userId]
  );
  return rows[0] ?? null;
}

function mapToPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    roleId: user.role_id,
    roleName: user.role_name,
    isSuperAdmin: user.is_super_admin,
    emailVerified: Boolean(user.email_confirmed_at),
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

// Routes
app.post('/api/auth-login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user || !user.encrypted_password) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.encrypted_password);

    if (!isValidPassword) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    await pool.query(
      `
        UPDATE public.users
        SET last_sign_in_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `,
      [user.id]
    );

    const role = user.role_name || (user.is_super_admin ? 'super_admin' : null);
    const token = signAuthToken(
      {
        sub: user.id,
        email: user.email,
        role,
        rememberMe: Boolean(rememberMe),
      },
      Boolean(rememberMe)
    );

    return res.json({
      success: true,
      token,
      user: mapToPublicUser(user),
    });
  } catch (error) {
    console.error('Auth login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

app.post('/api/auth-signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, rememberMe } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const userResult = await client.query(
        `
          INSERT INTO public.users (
            email,
            encrypted_password,
            email_confirmed_at,
            confirmed_at,
            raw_user_meta_data,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            NOW(),
            NOW(),
            $3::jsonb,
            NOW(),
            NOW()
          )
          RETURNING
            id,
            email,
            is_super_admin,
            created_at,
            updated_at,
            email_confirmed_at
        `,
        [
          email.trim().toLowerCase(),
          passwordHash,
          JSON.stringify({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }),
        ]
      );

      const newUser = userResult.rows[0];
      const userId = newUser.id;

      await client.query(
        `
          INSERT INTO public.profiles (
            id,
            email,
            first_name,
            last_name,
            role_id,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, 1, NOW(), NOW())
        `,
        [userId, email.trim().toLowerCase(), firstName.trim(), lastName.trim()]
      );

      await client.query('COMMIT');

      const publicUser = mapToPublicUser({
        ...newUser,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role_id: 1,
        role_name: 'user',
      });

      const token = signAuthToken(
        {
          sub: publicUser.id,
          email: publicUser.email,
          role: publicUser.roleName,
          rememberMe: Boolean(rememberMe),
        },
        Boolean(rememberMe)
      );

      return res.json({
        success: true,
        message: 'Account created successfully',
        token,
        user: publicUser,
      });
    } catch (error) {
      await client.query('ROLLBACK');

      if (error?.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists',
        });
      }

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Auth signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create account',
    });
  }
});

app.get('/api/auth-me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring('Bearer '.length).trim();
    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.json({
      success: true,
      user: mapToPublicUser(user),
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`Serving static files from ${distPath}`);
});

