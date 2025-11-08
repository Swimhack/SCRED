import { PoolClient } from "pg";

export interface UserWithProfile {
  id: string;
  email: string;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  first_name: string | null;
  last_name: string | null;
  role_id: number | null;
  role_name: string | null;
  is_super_admin: boolean;
  created_at: string | null;
  updated_at: string | null;
}

const baseUserSelect = `
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
`;

export async function findUserByEmail(
  client: PoolClient,
  email: string
): Promise<UserWithProfile | null> {
  const { rows } = await client.query<UserWithProfile>(
    `${baseUserSelect}
     WHERE LOWER(u.email) = LOWER($1)
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(
  client: PoolClient,
  userId: string
): Promise<UserWithProfile | null> {
  const { rows } = await client.query<UserWithProfile>(
    `${baseUserSelect}
     WHERE u.id = $1
       AND u.deleted_at IS NULL
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roleId: number | null;
  roleName: string | null;
  isSuperAdmin: boolean;
  emailVerified: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export function mapToPublicUser(user: UserWithProfile): PublicUser {
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


