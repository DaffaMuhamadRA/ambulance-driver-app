import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticateUser, createSession } from "@/lib/auth";
import { validateStringInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    console.log("Login API called");
    
    let jsonData;
    try {
      jsonData = await request.json();
      console.log("Received JSON data:", jsonData);
    } catch (jsonError: any) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
    }
    
    const { username, password } = jsonData;
    console.log("Extracted credentials:", { username, password: password ? "[HIDDEN]" : "undefined" });

    // Validate input
    const sanitizedEmail = validateStringInput(username, 100, 1); // Use email as username
    const sanitizedPassword = validateStringInput(password, 100, 1);
    console.log("Sanitized inputs:", { sanitizedEmail, sanitizedPassword });

    if (!sanitizedEmail || !sanitizedPassword) {
      console.log("Validation failed: Email and password must be filled");
      return NextResponse.json({ error: "Email dan password harus diisi" }, { status: 400 });
    }

    console.log("Attempting to authenticate user with email:", sanitizedEmail);
    const user = await authenticateUser(sanitizedEmail, sanitizedPassword);
    console.log("Authentication result:", user ? "Success" : "Failed");

    if (!user) {
      console.log("Authentication failed: Invalid email or password");
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    console.log("Creating session for user:", user.id)
    // Create session with 2-day expiration
    const sessionToken = await createSession(user.id)
    console.log("Session created successfully:", sessionToken)

    // Set cookie with 2-day maxAge
    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
      path: "/",
    })
    console.log("Cookie set successfully")

    // Also set a non-httpOnly cookie for client-side checking
    cookieStore.set("sessionExists", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2 * 24 * 60 * 60, // 2 days in seconds
      path: "/",
    })
    console.log("Client cookie set successfully")

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        photo: user.photo,
        id_driver: user.id_driver, // Include driver ID for driver users
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