import { type NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Test authentication with known credentials
    const user = await authenticateUser("admin@example.com", "123456");
    
    if (user) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Authentication failed - Invalid credentials",
      }, { status: 401 });
    }
  } catch (error) {
    console.error("Test auth error:", error);
    return NextResponse.json({
      success: false,
      error: "Server error during authentication",
    }, { status: 500 });
  }
}