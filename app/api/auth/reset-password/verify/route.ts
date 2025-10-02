import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { validateStringInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    console.log("Password reset verification API called");
    
    let jsonData;
    try {
      jsonData = await request.json();
      console.log("Received JSON data:", jsonData);
    } catch (jsonError: any) {
      console.error("JSON parsing error:", jsonError);
      return NextResponse.json({ error: "Invalid JSON format in request body" }, { status: 400 });
    }
    
    const { token, password, confirmPassword } = jsonData;
    console.log("Extracted data:", { token, password: password ? "[HIDDEN]" : "undefined", confirmPassword: confirmPassword ? "[HIDDEN]" : "undefined" });

    // Validate input
    const sanitizedToken = validateStringInput(token, 100, 1);
    const sanitizedPassword = validateStringInput(password, 100, 1);
    const sanitizedConfirmPassword = validateStringInput(confirmPassword, 100, 1);
    
    console.log("Sanitized inputs");

    if (!sanitizedToken || !sanitizedPassword || !sanitizedConfirmPassword) {
      console.log("Validation failed: All fields must be filled");
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      console.log("Validation failed: Passwords do not match");
      return NextResponse.json({ error: "Password dan konfirmasi password tidak cocok" }, { status: 400 });
    }

    // Check if token exists and is valid (not expired)
    console.log("Checking token validity:", sanitizedToken);
    const result = await sql`
      SELECT id, email, token, updated_at
      FROM cms_users 
      WHERE token = ${sanitizedToken} AND status = 'Active'
    `;

    if (result.length === 0) {
      console.log("Invalid or expired token");
      return NextResponse.json({ error: "Token tidak valid atau telah kedaluwarsa" }, { status: 400 });
    }

    const user = result[0];
    console.log("User found with token:", user.id);

    // Check if token is expired (1 hour)
    const tokenCreatedAt = new Date(user.updated_at);
    const now = new Date();
    const diffInMinutes = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60);
    
    if (diffInMinutes > 60) {
      console.log("Token has expired");
      return NextResponse.json({ error: "Token telah kedaluwarsa" }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);
    console.log("Password hashed successfully");

    // Update the user's password and clear the token
    await sql`
      UPDATE cms_users 
      SET password = ${hashedPassword}, token = NULL, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log("Password updated successfully for user:", user.id);

    return NextResponse.json({ 
      success: true, 
      message: "Password berhasil diubah. Anda dapat login dengan password baru Anda." 
    });
  } catch (error: any) {
    console.error("Password reset verification error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}