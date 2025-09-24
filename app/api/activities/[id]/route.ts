import { NextResponse } from "next/server"
import { getSession } from "@/app/api/auth/session/route"
import { getActivityById, getActivityByIdWithReferences } from "@/lib/activities"
import { sql } from "@/lib/db"
import { put } from '@vercel/blob'
import { sanitizeInput, validateNumericInput, validateDateInput, validateTimeInput, validateStringInput } from "@/lib/validation"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id)
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      )
    }
    
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.log("Fetching activity with ID:", activityId);
    
    const activity = await getActivityByIdWithReferences(activityId)
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    // Check if the activity belongs to the user
    if (session.user.role === "driver") {
      // Check if the activity's driver ID matches the current user's driver ID
      // If user.id_driver is null/undefined, fallback to user.id for comparison
      const userDriverId = session.user.id_driver || session.user.id
      if (userDriverId === null || activity.user.id !== userDriverId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }
    }
    
    console.log("Successfully fetched activity:", activity.id);
    return NextResponse.json(activity)
  } catch (error: any) {
    console.error("Error fetching activity:", error)
    console.error("Error stack:", error.stack)
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id)
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      )
    }
    
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Fetch the existing activity from the database
    const existingActivity = await getActivityByIdWithReferences(activityId);
    if (!existingActivity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Authorization check
    if (session.user.role === "driver") {
      const userDriverId = session.user.id_driver || session.user.id;
      if (userDriverId === null || existingActivity.user.id !== userDriverId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    // Parse form data
    const formData = await request.formData()
    const body = JSON.parse(formData.get("data") as string || "{}")
    const documentationFiles = formData.getAll("documentation") as File[]
    const existingDocumentation = formData.getAll("existingDocumentation") as string[]
    
    console.log("Received body for update:", body);
    
    // Extract fields from body with proper type handling
    const {
      id_kantor,
      tgl,
      tgl_pulang,
      id_ambulan,
      id_detail,
      jam_berangkat,
      jam_pulang,
      id_driver,
      asisten_luar_kota,
      area,
      dari,
      tujuan,
      km_awal,
      km_akhir,
      biaya_antar,
      biaya_dibayar,
      id_pemesan,
      id_penerima_manfaat,
      infaq,
      id_reward,
      kegiatan = "pengantaran",
      rumpun_program = "kesehatan"
    } = body
    
    // For server-side reconciliation, we only validate fields that are provided
    // If a field is not provided, we'll use the existing value from the database
    const validationErrors = []
    
    // Validate date if provided
    let sanitizedTgl = null
    if (tgl !== undefined) {
      sanitizedTgl = validateDateInput(tgl)
      if (!sanitizedTgl) validationErrors.push("Tanggal")
    }
    
    // Validate id_ambulan if provided
    let sanitizedIdAmbulan = null
    if (id_ambulan !== undefined) {
      sanitizedIdAmbulan = validateNumericInput(id_ambulan)
      if (!sanitizedIdAmbulan) validationErrors.push("ID Ambulan")
    }
    
    // Validate id_detail if provided
    let sanitizedIdDetail = null
    if (id_detail !== undefined) {
      sanitizedIdDetail = validateNumericInput(id_detail)
      if (!sanitizedIdDetail) validationErrors.push("ID Detail")
    }
    
    // Validate jam_berangkat if provided
    let sanitizedJamBerangkat = null
    if (jam_berangkat !== undefined) {
      // Handle time values that might include seconds (HH:MM:SS format)
      let timeValue = jam_berangkat;
      if (timeValue && timeValue.length === 8 && timeValue.split(':').length === 3) {
        // If time is in HH:MM:SS format, extract only HH:MM
        timeValue = timeValue.substring(0, 5);
      }
      sanitizedJamBerangkat = validateTimeInput(timeValue)
      if (!sanitizedJamBerangkat) validationErrors.push("Jam Berangkat")
    }
    
    // Validate area if provided
    let sanitizedArea = null
    if (area !== undefined) {
      sanitizedArea = validateStringInput(area)
      if (!sanitizedArea) validationErrors.push("Area")
    }
    
    // Validate dari if provided
    let sanitizedDari = null
    if (dari !== undefined) {
      sanitizedDari = validateStringInput(dari, 100)
      if (!sanitizedDari) validationErrors.push("Dari")
    }
    
    // Validate tujuan if provided
    let sanitizedTujuan = null
    if (tujuan !== undefined) {
      sanitizedTujuan = validateStringInput(tujuan, 100)
      if (!sanitizedTujuan) validationErrors.push("Tujuan")
    }
    
    // Validate km_awal if provided
    let sanitizedKmAwal = null
    if (km_awal !== undefined) {
      sanitizedKmAwal = validateNumericInput(km_awal, 0)
      if (sanitizedKmAwal === null) validationErrors.push("KM Awal")
    }
    
    // Validate km_akhir if provided
    let sanitizedKmAkhir = null
    if (km_akhir !== undefined) {
      sanitizedKmAkhir = validateNumericInput(km_akhir, 0)
      if (sanitizedKmAkhir === null) validationErrors.push("KM Akhir")
    }
    
    // Validate biaya_antar if provided
    let sanitizedBiayaAntar = null
    if (biaya_antar !== undefined) {
      sanitizedBiayaAntar = validateNumericInput(biaya_antar, 0)
      if (sanitizedBiayaAntar === null) validationErrors.push("Biaya Antar")
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Invalid fields provided",
          details: `Field(s) yang tidak valid: ${validationErrors.join(", ")}`
        },
        { status: 400 }
      )
    }
    
    // Validate and sanitize optional fields that are provided
    const sanitizedTglPulang = tgl_pulang !== undefined ? validateDateInput(tgl_pulang) : null
    let sanitizedJamPulang = null
    if (jam_pulang !== undefined) {
      // Handle time values that might include seconds (HH:MM:SS format)
      let timeValue = jam_pulang;
      if (timeValue && timeValue.length === 8 && timeValue.split(':').length === 3) {
        // If time is in HH:MM:SS format, extract only HH:MM
        timeValue = timeValue.substring(0, 5);
      }
      sanitizedJamPulang = validateTimeInput(timeValue)
    }
    const sanitizedIdKantor = id_kantor !== undefined ? validateNumericInput(id_kantor) : null
    const sanitizedIdDriver = id_driver !== undefined ? validateNumericInput(id_driver) : null
    const sanitizedAsistenLuarKota = asisten_luar_kota !== undefined ? validateStringInput(asisten_luar_kota, 100) : null
    const sanitizedBiayaDibayar = biaya_dibayar !== undefined && biaya_dibayar !== "" ? validateNumericInput(biaya_dibayar, 0) : null
    const sanitizedIdPemesan = id_pemesan !== undefined ? validateNumericInput(id_pemesan) : null
    const sanitizedIdPenerimaManfaat = id_penerima_manfaat !== undefined ? validateNumericInput(id_penerima_manfaat) : null
    const sanitizedInfaq = infaq !== undefined && infaq !== null && infaq !== "" ? validateNumericInput(infaq, 0) : null
    const sanitizedIdReward = id_reward !== undefined ? validateNumericInput(id_reward) : null
    const sanitizedKegiatan = kegiatan !== undefined ? validateStringInput(kegiatan, 50) : null
    const sanitizedRumpunProgram = rumpun_program !== undefined ? validateStringInput(rumpun_program, 50) : null
    
    // Use existing values for fields that weren't provided, or use provided values
    const finalTgl = sanitizedTgl || existingActivity.tgl_berangkat
    const finalIdAmbulan = sanitizedIdAmbulan || existingActivity.id_ambulan
    const finalIdDetail = sanitizedIdDetail || existingActivity.id_detail
    const finalJamBerangkat = sanitizedJamBerangkat || existingActivity.jam_berangkat
    const finalArea = sanitizedArea || existingActivity.area
    const finalDari = sanitizedDari || existingActivity.dari
    const finalTujuan = sanitizedTujuan || existingActivity.tujuan
    const finalKmAwal = sanitizedKmAwal !== null ? sanitizedKmAwal : existingActivity.km_awal
    const finalKmAkhir = sanitizedKmAkhir !== null ? sanitizedKmAkhir : existingActivity.km_akhir
    const finalBiayaAntar = sanitizedBiayaAntar !== null ? sanitizedBiayaAntar : existingActivity.biaya_antar
    
    // Additional validation - check if KM akhir is less than KM awal
    const finalSelisihKm = finalKmAkhir - finalKmAwal
    if (finalSelisihKm < 0) {
      return NextResponse.json(
        { error: "KM akhir cannot be less than KM awal" },
        { status: 400 }
      )
    }
    
    // Calculate bulan and tahun from tgl
    const dateObj = new Date(finalTgl)
    const bulan = dateObj.getMonth() + 1
    const tahun = dateObj.getFullYear()
    const jml_hari_luar_kota = finalArea === 'Luar Kota' ? 1 : 0
    const status_layanan = "Selesai"
    const pembatalan = "Tidak"
    const keterbatasan = "Tidak"
    
    // Use sanitized values for database update
    const id_kantor_num = sanitizedIdKantor !== null ? sanitizedIdKantor : existingActivity.id_kantor
    const tglValue = finalTgl
    const tgl_pulangValue = sanitizedTglPulang || existingActivity.tgl_pulang || finalTgl
    const id_ambulan_num = finalIdAmbulan
    const id_detail_num = finalIdDetail
    const jam_berangkatValue = finalJamBerangkat
    const jam_pulangValue = sanitizedJamPulang || existingActivity.jam_pulang || finalJamBerangkat
    const id_driver_num = sanitizedIdDriver !== null ? sanitizedIdDriver : existingActivity.id_driver
    const areaValue = finalArea
    const dariValue = finalDari
    const tujuanValue = finalTujuan
    const km_awal_num = finalKmAwal
    const km_akhir_num = finalKmAkhir
    const selisih_km = finalSelisihKm
    const biaya_antar_num = finalBiayaAntar
    const biaya_dibayar_num = sanitizedBiayaDibayar !== null ? sanitizedBiayaDibayar : existingActivity.biaya_dibayar
    const infaq_num = sanitizedInfaq !== null ? sanitizedInfaq : existingActivity.infaq
    const id_reward_num = sanitizedIdReward !== null ? sanitizedIdReward : existingActivity.id_reward
    const kegiatanValue = sanitizedKegiatan || existingActivity.kegiatan || 'pengantaran'
    const rumpun_programValue = sanitizedRumpunProgram || existingActivity.rumpun_program || 'kesehatan'
    const asisten_luar_kotaValue = sanitizedAsistenLuarKota !== null ? sanitizedAsistenLuarKota : existingActivity.asisten_luar_kota
    
    // Fetch required data from pemesan and penerima_manfaat tables if IDs were provided
    let pemesanData = null
    let pmData = null
    
    if (sanitizedIdPemesan !== null) {
      if (sanitizedIdPemesan > 0) {
        console.log("Fetching pemesan data for id:", sanitizedIdPemesan);
        try {
          const pemesanResult = await sql`
            SELECT nama_pemesan, hp FROM pemesan WHERE id = ${sanitizedIdPemesan}
          `
          console.log("Pemesan result:", pemesanResult);
          if (pemesanResult.length > 0) {
            pemesanData = pemesanResult[0]
          }
        } catch (dbError: any) {
          console.error("Database error fetching pemesan:", dbError);
          return NextResponse.json(
            { error: "Database error fetching pemesan data", details: dbError.message },
            { status: 500 }
          )
        }
      }
      // If sanitizedIdPemesan is 0 or null, we'll clear the pemesan data
    } else {
      // If no new pemesan ID was provided, use existing pemesan data
      pemesanData = {
        nama_pemesan: existingActivity.nama_pemesan,
        hp: existingActivity.hp
      }
    }
    
    if (sanitizedIdPenerimaManfaat !== null) {
      if (sanitizedIdPenerimaManfaat > 0) {
        console.log("Fetching PM data for id:", sanitizedIdPenerimaManfaat);
        try {
          const pmResult = await sql`
            SELECT 
              nama_pm, 
              alamat_pm, 
              jenis_kelamin_pm, 
              usia_pm, 
              nik, 
              no_kk, 
              tempat_lahir, 
              tgl_lahir, 
              id_asnaf, 
              status_marital, 
              agama
            FROM penerima_manfaat 
            WHERE id = ${sanitizedIdPenerimaManfaat}
          `
          console.log("PM result:", pmResult);
          if (pmResult.length > 0) {
            pmData = pmResult[0]
          }
        } catch (dbError: any) {
          console.error("Database error fetching PM:", dbError);
          return NextResponse.json(
            { error: "Database error fetching PM data", details: dbError.message },
            { status: 500 }
          )
        }
      }
      // If sanitizedIdPenerimaManfaat is 0 or null, we'll clear the PM data
    } else {
      // If no new PM ID was provided, use existing PM data
      pmData = {
        nama_pm: existingActivity.nama_pm,
        alamat_pm: existingActivity.alamat_pm,
        jenis_kelamin_pm: existingActivity.jenis_kelamin_pm,
        usia_pm: existingActivity.usia_pm,
        nik: existingActivity.nik,
        no_kk: existingActivity.no_kk,
        tempat_lahir: existingActivity.tempat_lahir,
        tgl_lahir: existingActivity.tgl_lahir,
        id_asnaf: existingActivity.id_asnaf,
        status_marital: existingActivity.status_marital,
        agama: existingActivity.agama
      }
    }
    
    // Update the activity
    try {
      // Sanitize the asisten_luar_kota value to prevent SQL issues
      const sanitizedAsisten = asisten_luar_kotaValue ? 
        asisten_luar_kotaValue.toString().replace(/'/g, "''") : 
        null;

      await sql`
        UPDATE ambulan_activity SET
          "tgl" = ${tglValue},
          "tgl_pulang" = ${tgl_pulangValue ? tgl_pulangValue : tglValue},
          "bulan" = ${bulan},
          "tahun" = ${tahun},
          "id_ambulan" = ${id_ambulan_num},
          "id_detail" = ${id_detail_num},
          "jam_berangkat" = ${jam_berangkatValue},
          "jam_pulang" = ${jam_pulangValue ? jam_pulangValue : jam_berangkatValue},
          "id_driver" = ${id_driver_num},
          "asisten_luar_kota" = ${sanitizedAsisten},
          "area" = ${areaValue},
          "jml_hari_luar_kota" = ${jml_hari_luar_kota},
          "dari" = ${dariValue},
          "tujuan" = ${tujuanValue},
          "km_awal" = ${km_awal_num},
          "km_akhir" = ${km_akhir_num},
          "selisih_km" = ${selisih_km},
          "biaya_antar" = ${biaya_antar_num},
          "biaya_dibayar" = ${biaya_dibayar_num !== null ? biaya_dibayar_num : existingActivity.biaya_dibayar},
          "nama_pemesan" = ${pemesanData ? pemesanData.nama_pemesan : (existingActivity.nama_pemesan || 'Tanpa Pemesan')},
          "hp" = ${pemesanData ? pemesanData.hp : (existingActivity.hp || '000000000000')},
          "nama_pm" = ${pmData ? pmData.nama_pm : (existingActivity.nama_pm || 'Tanpa PM')},
          "alamat_pm" = ${pmData ? pmData.alamat_pm : (existingActivity.alamat_pm || 'Alamat tidak tersedia')},
          "nik" = ${pmData ? pmData.nik : existingActivity.nik},
          "no_kk" = ${pmData ? pmData.no_kk : existingActivity.no_kk},
          "tempat_lahir" = ${pmData ? pmData.tempat_lahir : existingActivity.tempat_lahir},
          "tgl_lahir" = ${pmData && pmData.tgl_lahir ? 
            (new Date(pmData.tgl_lahir).toISOString().split('T')[0]) : 
            existingActivity.tgl_lahir},
          "jenis_kelamin_pm" = ${pmData ? pmData.jenis_kelamin_pm : (existingActivity.jenis_kelamin_pm || 'Tidak Diketahui')},
          "usia_pm" = ${pmData && pmData.usia_pm !== null ? 
            pmData.usia_pm.toString() : 
            (existingActivity.usia_pm || '0')},
          "id_asnaf" = ${pmData && pmData.id_asnaf !== null ? pmData.id_asnaf : (existingActivity.id_asnaf || 1)},
          "status_layanan" = ${status_layanan},
          "pembatalan" = ${pembatalan},
          "keterbatasan" = ${keterbatasan},
          "infaq" = ${infaq_num !== null ? infaq_num : existingActivity.infaq},
          "id_reward" = ${id_reward_num !== null ? id_reward_num : existingActivity.id_reward},
          "agama" = ${pmData ? pmData.agama : (existingActivity.agama || null)},
          "status_marital" = ${pmData ? pmData.status_marital : (existingActivity.status_marital || null)},
          "kegiatan" = ${kegiatanValue || existingActivity.kegiatan || 'pengantaran'},
          "rumpun_program" = ${rumpun_programValue || existingActivity.rumpun_program || 'kesehatan'}
        WHERE id = ${activityId}
      `
    } catch (dbError: any) {
      console.error("Database error updating activity:", dbError);
      console.error("Database error code:", dbError.code);
      console.error("Database error detail:", dbError.detail);
      console.error("Database error hint:", dbError.hint);
      
      return NextResponse.json(
        { 
          error: "Database error updating activity", 
          details: dbError.message,
          code: dbError.code,
          detail: dbError.detail,
          hint: dbError.hint
        },
        { status: 500 }
      )
    }
    
    // Process documentation files if any
    if (documentationFiles && documentationFiles.length > 0) {
      try {
        console.log(`Processing ${documentationFiles.length} documentation files for activity ${activityId}`);
        
        // Process each documentation file
        for (const file of documentationFiles) {
          // Upload to Vercel Blob
          const blob = await put(
            `documentation/${activityId}/${file.name}`, 
            file, 
            { access: 'public' }
          );
          
          // Save the URL to the database
          await sql`
            INSERT INTO dokumentasi_activity (activity_id, file_name, file_url, file_type, file_size)
            VALUES (${activityId}, ${file.name}, ${blob.url}, ${file.type}, ${file.size})
          `;
        }
      } catch (docError: any) {
        console.error("Error processing documentation:", docError);
        // We don't return an error here because the activity was successfully updated
      }
    }
    
    // Remove documentation that was deleted
    if (existingDocumentation && existingDocumentation.length > 0) {
      try {
        const currentDocsResult = await sql`
          SELECT id FROM dokumentasi_activity WHERE activity_id = ${activityId}
        `;
        
        const currentDocIds = currentDocsResult.map((row: any) => row.id.toString());
        const docsToKeep = existingDocumentation.filter((id: string) => currentDocIds.includes(id));
        const docsToDelete = currentDocIds.filter((id: string) => !docsToKeep.includes(id));
        
        // Delete documentation that was removed
        for (const docId of docsToDelete) {
          await sql`
            DELETE FROM dokumentasi_activity WHERE id = ${docId}
          `;
        }
      } catch (docError: any) {
        console.error("Error removing documentation:", docError);
        // We don't return an error here because the activity was successfully updated
      }
    }
    
    return NextResponse.json({ id: activityId, message: "Activity updated successfully" })
  } catch (error: any) {
    console.error("Error updating activity:", error)
    console.error("Error stack:", error.stack)
    console.error("Error code:", error.code)
    console.error("Error detail:", error.detail)
    console.error("Error hint:", error.hint)
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error.message || "Unknown error",
        code: error.code,
        detail: error.detail,
        hint: error.hint
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id)
    
    // Validate activity ID
    if (isNaN(activityId) || activityId <= 0) {
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      )
    }
    
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Fetch the existing activity from the database to check ownership
    const existingActivity = await getActivityByIdWithReferences(activityId);
    if (!existingActivity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Authorization check - both admin and driver can delete
    // For drivers, check if the activity belongs to them
    if (session.user.role === "driver") {
      const userDriverId = session.user.id_driver || session.user.id;
      if (userDriverId === null || existingActivity.user.id !== userDriverId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    // Delete the activity
    await sql`
      DELETE FROM ambulan_activity WHERE id = ${activityId}
    `
    
    return NextResponse.json({ message: "Activity deleted successfully" })
  } catch (error) {
    console.error("Error deleting activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
