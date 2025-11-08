import { Pool, PoolClient } from "pg";

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error("NEON_DATABASE_URL environment variable is not configured");
}

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

export async function withClient<T>(handler: (client: PoolClient) => Promise<T>): Promise<T> {
  const poolInstance = getPool();
  const client = await poolInstance.connect();
  try {
    return await handler(client);
  } finally {
    client.release();
  }
}

export { getPool };


