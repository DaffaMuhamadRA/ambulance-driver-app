import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, createSession } from "@/lib/auth";
import { validateStringInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate input
    const sanitizedUsername = validateStringInput(username, 100, 1);
    const sanitizedPassword = validateStringInput(password, 100, 1);

    if (!sanitizedUsername || !sanitizedPassword) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 });
    }

    const user = await authenticateUser(sanitizedUsername, sanitizedPassword);

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    // Create session with 2-day expiration
    const sessionToken = await createSession(user.id);

    // Set cookie with 2-day maxAge
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
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
  } catch (error: any) {
    console.error("Login error:", error);
    // Return more specific error messages for debugging
    if (error.message && error.message.includes("database")) {
      return NextResponse.json({ error: "Koneksi database gagal. Silakan coba lagi nanti." }, { status: 500 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}