import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const penerimaManfaats = await sql`
      SELECT 
        id, 
        nama_pm, 
        alamat_pm, 
        jenis_kelamin_pm, 
        usia_pm, 
        id_asnaf, 
        nik, 
        no_kk, 
        tempat_lahir, 
        tgl_lahir, 
        status_marital, 
        agama 
      FROM penerima_manfaat 
      ORDER BY nama_pm
    `
    
    return NextResponse.json(penerimaManfaats)
  } catch (error) {
    console.error("Error fetching penerima manfaats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      nama_pm, 
      alamat_pm, 
      jenis_kelamin_pm, 
      usia_pm, 
      id_asnaf, 
      nik, 
      no_kk, 
      tempat_lahir, 
      tgl_lahir, 
      status_marital, 
      agama 
    } = body

    if (!nama_pm) {
      return NextResponse.json(
        { error: "Nama PM is required" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO penerima_manfaat (
        nama_pm, 
        alamat_pm, 
        jenis_kelamin_pm, 
        usia_pm, 
        id_asnaf, 
        nik, 
        no_kk, 
        tempat_lahir, 
        tgl_lahir, 
        status_marital, 
        agama
      )
      VALUES (
        ${nama_pm}, 
        ${alamat_pm || null}, 
        ${jenis_kelamin_pm || null}, 
        ${usia_pm || null}, 
        ${id_asnaf || null}, 
        ${nik || null}, 
        ${no_kk || null}, 
        ${tempat_lahir || null}, 
        ${tgl_lahir || null}, 
        ${status_marital || null}, 
        ${agama || null}
      )
      RETURNING id, nama_pm
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating penerima manfaat:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}