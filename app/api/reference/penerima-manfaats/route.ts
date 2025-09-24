import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateStringInput, validateNumericInput, validateDateInput } from "@/lib/validation"

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

    // Validate required fields
    const sanitizedNamaPm = validateStringInput(nama_pm, 100, 1)
    if (!sanitizedNamaPm) {
      return NextResponse.json(
        { error: "Nama PM is required and must be between 1 and 100 characters" },
        { status: 400 }
      )
    }

    // Validate optional fields
    const sanitizedAlamatPm = alamat_pm ? validateStringInput(alamat_pm, 255) : null
    const sanitizedJenisKelaminPm = jenis_kelamin_pm ? validateStringInput(jenis_kelamin_pm, 20) : null
    const sanitizedUsiaPm = usia_pm ? validateNumericInput(usia_pm, 0, 150) : null
    const sanitizedIdAsnaf = id_asnaf ? validateNumericInput(id_asnaf, 1) : null
    const sanitizedNik = nik ? validateStringInput(nik, 20) : null
    const sanitizedNoKk = no_kk ? validateStringInput(no_kk, 20) : null
    const sanitizedTempatLahir = tempat_lahir ? validateStringInput(tempat_lahir, 100) : null
    const sanitizedTglLahir = tgl_lahir ? validateDateInput(tgl_lahir) : null
    const sanitizedStatusMarital = status_marital ? validateStringInput(status_marital, 20) : null
    const sanitizedAgama = agama ? validateStringInput(agama, 20) : null

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
        ${sanitizedNamaPm},
        ${sanitizedAlamatPm},
        ${sanitizedJenisKelaminPm},
        ${sanitizedUsiaPm},
        ${sanitizedIdAsnaf},
        ${sanitizedNik},
        ${sanitizedNoKk},
        ${sanitizedTempatLahir},
        ${sanitizedTglLahir},
        ${sanitizedStatusMarital},
        ${sanitizedAgama}
      )
      RETURNING id, nama_pm, alamat_pm, jenis_kelamin_pm, usia_pm, id_asnaf, 
                nik, no_kk, tempat_lahir, tgl_lahir, status_marital, agama
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