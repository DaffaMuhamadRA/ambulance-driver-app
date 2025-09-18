import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sql } from "./db";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "driver" | "admin";
  status: string;
  photo?: string;
  id_driver?: number;
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

  try {
    await sql`
      INSERT INTO sessions (user_id, session_token, expires_at)
      VALUES (${userId}, ${sessionToken}, ${expiresAt})
    `;

    return sessionToken;
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
}

// Authenticate user
export async function authenticateUser(identifier: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, name, email, password, id_cms_privileges, status, photo, id_driver
      FROM cms_users 
      WHERE (name = ${identifier} OR email = ${identifier}) AND status = 'Active'
    `;

    if (result.length === 0) {
      return null;
    }

    const user = result[0];

    // Check if the stored password is already hashed or plain text
    let isValidPassword = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$') || user.password.startsWith('$2y$')) {
      // It's a bcrypt hash
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // It's plain text (not recommended for production)
      isValidPassword = password === user.password;
    }

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.id_cms_privileges == 1 ? "admin" : "driver",
      status: user.status,
      photo: user.photo,
      id_driver: user.id_driver,
    };
  } catch (error) {
    console.error("Database error during authentication:", error);
    throw new Error("Database connection failed during authentication");
  }
}

// Require authentication
export async function requireAuth(): Promise<User> {
  // We'll handle authentication through the API route
  // This function is kept for backward compatibility but will redirect to login
  redirect("/login");
}

// Require specific role
export async function requireRole(role: "driver" | "admin"): Promise<User> {
  // We'll handle role checking through the API route
  // This function is kept for backward compatibility but will redirect to login
  redirect("/login");
}

// Delete session (logout)
export async function deleteSession(token: string): Promise<void> {
  try {
    await sql`DELETE FROM sessions WHERE session_token = ${token}`;
  } catch (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session");
  }
}

// Clean expired sessions
export async function cleanExpiredSessions(): Promise<void> {
  try {
    await sql`DELETE FROM sessions WHERE expires_at < NOW()`;
  } catch (error) {
    console.error("Error cleaning expired sessions:", error);
    throw new Error("Failed to clean expired sessions");
  }
}
