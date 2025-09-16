import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 });
    }

    console.log("Attempting to authenticate user:", username);
    const user = await authenticateUser(username, password);
    console.log("Authentication result:", user);

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    // Create session
    const sessionToken = await createSession(user.id);
    console.log("Session created for user:", user.id, "with token:", sessionToken);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}