import type { Handler, HandlerEvent } from "@netlify/functions";
import bcrypt from "bcryptjs";
import { withClient } from "./_shared/neonClient";
import {
  findUserByEmail,
  mapToPublicUser,
} from "./_shared/userQueries";
import { signAuthToken } from "./_shared/authHelpers";

interface LoginRequestBody {
  email?: string;
  password?: string;
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
    const body: LoginRequestBody = event.body ? JSON.parse(event.body) : {};

    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Email and password are required",
        }),
      };
    }

    return await withClient(async (client) => {
      const user = await findUserByEmail(client, email);

      if (!user || !user.encrypted_password) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Invalid email or password",
          }),
        };
      }

      const isValidPassword = await bcrypt.compare(
        password,
        user.encrypted_password
      );

      if (!isValidPassword) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Invalid email or password",
          }),
        };
      }

      await client.query(
        `
          UPDATE public.users
          SET last_sign_in_at = NOW(), updated_at = NOW()
          WHERE id = $1
        `,
        [user.id]
      );

      const role =
        user.role_name || (user.is_super_admin ? "super_admin" : null);
      const token = signAuthToken(
        {
          sub: user.id,
          email: user.email,
          role,
          rememberMe,
        },
        rememberMe
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token,
          user: mapToPublicUser(user),
        }),
      };
    });
  } catch (error) {
    console.error("Auth login error:", error);
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


