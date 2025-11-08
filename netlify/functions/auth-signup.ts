import type { Handler, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { withClient } from "./_shared/neonClient";
import { mapToPublicUser } from "./_shared/userQueries";
import { signAuthToken } from "./_shared/authHelpers";

interface SignupRequestBody {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: boolean;
}

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  try {
    const body: SignupRequestBody = event.body ? JSON.parse(event.body) : {};

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const firstName = body.firstName?.trim() || "";
    const lastName = body.lastName?.trim() || "";
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !password || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "First name, last name, email, and password are required",
        }),
      };
    }

    if (password.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Password must be at least 8 characters long",
        }),
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return await withClient(async (client) => {
      try {
        await client.query("BEGIN");

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
            email,
            passwordHash,
            JSON.stringify({
              first_name: firstName,
              last_name: lastName,
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
          [userId, email, firstName, lastName]
        );

        await client.query("COMMIT");

        const publicUser = mapToPublicUser({
          id: newUser.id,
          email: newUser.email,
          encrypted_password: passwordHash,
          email_confirmed_at: newUser.email_confirmed_at,
          first_name: firstName,
          last_name: lastName,
          role_id: 1,
          role_name: "user",
          is_super_admin: newUser.is_super_admin,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at,
        });

        const token = signAuthToken(
          {
            sub: publicUser.id,
            email: publicUser.email,
            role: publicUser.roleName,
            rememberMe,
          },
          rememberMe
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Account created successfully",
            token,
            user: publicUser,
          }),
        };
      } catch (error: any) {
        await client.query("ROLLBACK");

        if (error?.code === "23505") {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({
              success: false,
              error: "An account with this email already exists",
            }),
          };
        }

        console.error("Auth signup error:", error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Failed to create account",
          }),
        };
      }
    });
  } catch (error) {
    console.error("Auth signup error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
    };
  }
};

export { handler };


