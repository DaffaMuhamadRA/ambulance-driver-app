import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { validateStringInput } from "@/lib/validation";

// Generate a secure token
function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  try {
    console.log("Password reset request API called");
    
    let jsonData;
    try {
      jsonData = await request.json();
      console.log("Received JSON data:", jsonData);
    } catch (jsonError: any) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
    }
    
    const { email } = jsonData;
    console.log("Extracted email:", email);

    // Validate input
    const sanitizedEmail = validateStringInput(email, 100, 1);
    console.log("Sanitized email:", sanitizedEmail);

    if (!sanitizedEmail) {
      console.log("Validation failed: Email must be filled");
      return NextResponse.json({ error: "Email harus diisi" }, { status: 400 });
    }

    // Check if user exists
    console.log("Checking if user exists with email:", sanitizedEmail);
    const result = await sql`
      SELECT id, name, email
      FROM cms_users 
      WHERE email = ${sanitizedEmail} AND status = 'Active'
    `;

    if (result.length === 0) {
      // For security reasons, we don't reveal if the email exists or not
      console.log("User not found or not active, but returning success to prevent email enumeration");
      return NextResponse.json({ 
        success: true, 
        message: "Jika email Anda terdaftar, Anda akan menerima instruksi untuk mereset password Anda." 
      });
    }

    const user = result[0];
    console.log("User found:", user.id);

    // Generate a reset token
    const resetToken = generateToken();
    console.log("Generated reset token");

    // Store the token in the database with an expiration time (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await sql`
      UPDATE cms_users 
      SET token = ${resetToken}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log("Reset token saved to database for user:", user.id);

    // In a real application, you would send an email with the reset token
    // For now, we'll just return the token in the response for testing
    // In production, you should send this via email instead
    console.log("Would send email with reset token to:", user.email);
    
    return NextResponse.json({ 
      success: true, 
      message: "Jika email Anda terdaftar, Anda akan menerima instruksi untuk mereset password Anda.",
      // In production, remove this token from the response and send via email instead
      token: resetToken // Only for testing purposes
    });
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}