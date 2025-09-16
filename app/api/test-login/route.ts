import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received login request:", body);
    
    return NextResponse.json({
      success: true,
      message: "Login endpoint is working",
      received: body
    });
  } catch (error) {
    console.error("Login test error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}