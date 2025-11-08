import type { Handler, HandlerEvent } from "@netlify/functions";
import { withClient } from "./_shared/neonClient";
import { findUserById, mapToPublicUser } from "./_shared/userQueries";
import { verifyAuthToken } from "./_shared/authHelpers";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Missing or invalid authorization header",
      }),
    };
  }

  const token = authHeader.substring("Bearer ".length).trim();

  try {
    const payload = verifyAuthToken(token);

    return await withClient(async (client) => {
      const user = await findUserById(client, payload.sub);

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            success: false,
            error: "User not found",
          }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: mapToPublicUser(user),
        }),
      };
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Invalid or expired token",
      }),
    };
  }
};

export { handler };


