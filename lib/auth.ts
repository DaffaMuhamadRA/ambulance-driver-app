import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "driver" | "admin";
  status: string;
  photo?: string;
}

export interface Session {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: Date;
}

// Generate a secure session token
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Create a new session
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await sql`
    INSERT INTO sessions (user_id, session_token, expires_at)
    VALUES (${userId}, ${sessionToken}, ${expiresAt})
  `;

  return sessionToken;
}

// Get session by token
export async function getSession(token: string): Promise<(Session & { user: User }) | null> {
  const result = await sql`
    SELECT 
      s.id, s.user_id, s.session_token, s.expires_at,
      u.id as user_id, u.name, u.email, u.id_cms_privileges, u.status, u.photo
    FROM sessions s
    JOIN cms_users u ON s.user_id = u.id
    WHERE s.session_token = ${token} AND s.expires_at > NOW() AND u.status = 'Active'
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    user_id: row.user_id,
    session_token: row.session_token,
    expires_at: new Date(row.expires_at),
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.id_cms_privileges == 1 ? "admin" : "driver",
      status: row.status,
      photo: row.photo,
    },
  };
}

// Authenticate user
export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  console.log("Authenticating user:", identifier);
  
  const result = await sql`
    SELECT id, name, email, password, id_cms_privileges, status, photo
    FROM cms_users 
    WHERE (name = ${identifier} OR email = ${identifier}) AND status = 'Active'
  `;

  console.log("Database query result:", result);

  if (result.length === 0) {
    console.log("No user found with identifier:", identifier);
    return null;
  }

  const user = result[0];
  console.log("User found:", user.name);
  console.log("Stored password hash:", user.password);
  console.log("Provided password:", password);

  // Check if the stored password is already hashed or plain text
  let isValidPassword = false;
  if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
    // It's a bcrypt hash
    isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password validation result (bcrypt):", isValidPassword);
  } else {
    // It's plain text (not recommended for production)
    isValidPassword = password === user.password;
    console.log("Password validation result (plain text):", isValidPassword);
  }

  if (!isValidPassword) {
    console.log("Invalid password for user:", identifier);
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.id_cms_privileges == 1 ? "admin" : "driver",
    status: user.status,
    photo: user.photo,
  };
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  const session = await getSession(sessionToken);
  return session?.user || null;
}

// Require authentication
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// Require specific role
export async function requireRole(role: "driver" | "admin"): Promise<User> {
  const user = await requireAuth();
  if (user.role !== role) {
    redirect("/unauthorized");
  }
  return user;
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE session_token = ${token}`;
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
}