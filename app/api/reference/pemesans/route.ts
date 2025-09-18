import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const pemesans = await sql`
      SELECT id, nama_pemesan, hp FROM pemesan ORDER BY nama_pemesan
    `
    
    return NextResponse.json(pemesans)
  } catch (error) {
    console.error("Error fetching pemesans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nama_pemesan, hp } = body

    if (!nama_pemesan || !hp) {
      return NextResponse.json(
        { error: "Nama pemesan and HP are required" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO pemesan (nama_pemesan, hp)
      VALUES (${nama_pemesan}, ${hp})
      RETURNING id, nama_pemesan, hp
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating pemesan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
