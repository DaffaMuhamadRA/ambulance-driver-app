import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/app/api/auth/session/route"
import { put } from '@vercel/blob'
import { sanitizeInput, validateNumericInput, validateDateInput, validateTimeInput, validateStringInput } from "@/lib/validation"

export async function POST(request: Request) {
  try {
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
    
    // Parse form data
    const formData = await request.formData()
    const body = JSON.parse(formData.get("data") as string || "{}")
    const documentationFiles = formData.getAll("documentation") as File[]
    
    console.log("Received body:", body);
    
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
    
    // Validate and sanitize required fields
    const sanitizedTgl = validateDateInput(tgl)
    const sanitizedIdAmbulan = validateNumericInput(id_ambulan)
    const sanitizedIdDetail = validateNumericInput(id_detail)
    // Handle time values that might include seconds (HH:MM:SS format)
    let jamBerangkatValue = jam_berangkat;
    if (jamBerangkatValue && jamBerangkatValue.length === 8 && jamBerangkatValue.split(':').length === 3) {
      // If time is in HH:MM:SS format, extract only HH:MM
      jamBerangkatValue = jamBerangkatValue.substring(0, 5);
    }
    const sanitizedJamBerangkat = validateTimeInput(jamBerangkatValue)
    const sanitizedArea = validateStringInput(area)
    const sanitizedDari = validateStringInput(dari, 100)
    const sanitizedTujuan = validateStringInput(tujuan, 100)
    const sanitizedKmAwal = validateNumericInput(km_awal, 0)
    const sanitizedKmAkhir = validateNumericInput(km_akhir, 0)
    const sanitizedBiayaAntar = validateNumericInput(biaya_antar, 0)
    
    if (!sanitizedTgl || !sanitizedIdAmbulan || !sanitizedIdDetail || !sanitizedJamBerangkat || 
        !sanitizedArea || !sanitizedDari || !sanitizedTujuan || !sanitizedKmAwal || !sanitizedKmAkhir || 
        !sanitizedBiayaAntar) {
      return NextResponse.json(
        { error: "Invalid or missing required fields" },
        { status: 400 }
      )
    }
    
    // Validate and sanitize optional fields
    const sanitizedTglPulang = tgl_pulang ? validateDateInput(tgl_pulang) : sanitizedTgl
    let sanitizedJamPulang: string | null = sanitizedJamBerangkat
    if (jam_pulang) {
      // Handle time values that might include seconds (HH:MM:SS format)
      let jamPulangValue = jam_pulang;
      if (jamPulangValue && jamPulangValue.length === 8 && jamPulangValue.split(':').length === 3) {
        // If time is in HH:MM:SS format, extract only HH:MM
        jamPulangValue = jamPulangValue.substring(0, 5);
      }
      sanitizedJamPulang = validateTimeInput(jamPulangValue)
    }
    const sanitizedIdKantor = id_kantor ? validateNumericInput(id_kantor) : null
    const sanitizedIdDriver = validateNumericInput(id_driver)
    const sanitizedAsistenLuarKota = asisten_luar_kota ? validateStringInput(asisten_luar_kota, 100) : null
    const sanitizedKmAkhirNum = sanitizedKmAkhir
    const sanitizedSelisihKm = sanitizedKmAkhirNum - sanitizedKmAwal
    const sanitizedBiayaDibayar = biaya_dibayar ? validateNumericInput(biaya_dibayar, 0) : null
    const sanitizedIdPemesan = id_pemesan ? validateNumericInput(id_pemesan) : null
    const sanitizedIdPenerimaManfaat = id_penerima_manfaat ? validateNumericInput(id_penerima_manfaat) : null
    const sanitizedInfaq = infaq !== undefined && infaq !== null ? validateNumericInput(infaq, 0) : null
    const sanitizedIdReward = id_reward ? validateNumericInput(id_reward) : null
    const sanitizedKegiatan = validateStringInput(kegiatan, 50) || "pengantaran"
    const sanitizedRumpunProgram = validateStringInput(rumpun_program, 50) || "kesehatan"
    
    // Additional validation
    if (sanitizedSelisihKm < 0) {
      return NextResponse.json(
        { error: "KM akhir cannot be less than KM awal" },
        { status: 400 }
      )
    }
    
    // Calculate bulan and tahun from tgl
    const dateObj = new Date(sanitizedTgl)
    const bulan = dateObj.getMonth() + 1
    const tahun = dateObj.getFullYear()
    const jml_hari_luar_kota = sanitizedArea === 'Luar Kota' ? 1 : 0
    const status_layanan = "Selesai"
    const pembatalan = "Tidak"
    const keterbatasan = "Tidak"
    
    // Use sanitized values for database insertion
    const id_kantor_num = sanitizedIdKantor
    const tglValue = sanitizedTgl
    const tgl_pulangValue = sanitizedTglPulang
    const id_ambulan_num = sanitizedIdAmbulan
    const id_detail_num = sanitizedIdDetail
    const jam_berangkatValue = sanitizedJamBerangkat
    const jam_pulangValue = sanitizedJamPulang
    const id_driver_num = sanitizedIdDriver
    const areaValue = sanitizedArea
    const dariValue = sanitizedDari
    const tujuanValue = sanitizedTujuan
    const km_awal_num = sanitizedKmAwal
    const km_akhir_num = sanitizedKmAkhirNum
    const selisih_km = sanitizedSelisihKm
    const biaya_antar_num = sanitizedBiayaAntar
    const biaya_dibayar_num = sanitizedBiayaDibayar
    const infaq_num = sanitizedInfaq
    const id_reward_num = sanitizedIdReward
    const kegiatanValue = sanitizedKegiatan
    const rumpun_programValue = sanitizedRumpunProgram
    const asisten_luar_kotaValue = sanitizedAsistenLuarKota
    
    // Fetch required data from pemesan and penerima_manfaat tables
    let pemesanData = null
    let pmData = null
    
    if (sanitizedIdPemesan) {
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
    
    if (sanitizedIdPenerimaManfaat) {
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
    
    console.log("Data to insert:", {
      id_kantor: id_kantor_num,
      tgl: tglValue,
      tgl_pulang: tgl_pulangValue,
      bulan,
      tahun,
      id_ambulan: id_ambulan_num,
      id_detail: id_detail_num,
      jam_berangkat: jam_berangkatValue,
      jam_pulang: jam_pulangValue,
      id_driver: id_driver_num,
      asisten_luar_kota: asisten_luar_kotaValue,
      area: areaValue,
      jml_hari_luar_kota,
      dari: dariValue,
      tujuan: tujuanValue,
      km_awal_num: km_awal_num,
      km_akhir_num: km_akhir_num,
      selisih_km: selisih_km,
      biaya_antar: biaya_antar_num,
      biaya_dibayar: biaya_dibayar_num,
      nama_pemesan: pemesanData ? pemesanData.nama_pemesan : 'Tanpa Pemesan',
      hp: pemesanData ? pemesanData.hp : '000000000000',
      nama_pm: pmData ? pmData.nama_pm : 'Tanpa PM',
      alamat_pm: pmData ? pmData.alamat_pm : 'Alamat tidak tersedia',
      nik: pmData ? pmData.nik : null,
      no_kk: pmData ? pmData.no_kk : null,
      tempat_lahir: pmData ? pmData.tempat_lahir : null,
      // Convert date to string since it's VARCHAR in ambulan_activity table
      tgl_lahir: pmData && pmData.tgl_lahir ? 
        (new Date(pmData.tgl_lahir).toISOString().split('T')[0]) : 
        null,
      jenis_kelamin_pm: pmData ? pmData.jenis_kelamin_pm : 'Tidak Diketahui',
      // Convert usia_pm to string since it's VARCHAR in ambulan_activity table
      usia_pm: pmData && pmData.usia_pm !== null ? 
        pmData.usia_pm.toString() : 
        '0',  // Default as string since it's VARCHAR and NOT NULL
      // id_asnaf is INTEGER and NOT NULL
      id_asnaf: pmData && pmData.id_asnaf !== null ? pmData.id_asnaf : 1,
      status_layanan,
      pembatalan,
      keterbatasan,
      id_pemesan: sanitizedIdPemesan,
      id_penerima_manfaat: sanitizedIdPenerimaManfaat,
      infaq: infaq_num,
      id_reward: id_reward_num,
      kegiatan: kegiatanValue,
      rumpun_program: rumpun_programValue
    });
    
    // Insert the activity
    let result;
    try {
      // Log the values being inserted for debugging
      console.log("Values being inserted:", {
        id_kantor_num,
        tglValue,
        tgl_pulangValue: tgl_pulangValue ? tgl_pulangValue : tglValue,
        bulan,
        tahun,
        id_ambulan_num,
        id_detail_num,
        jam_berangkatValue,
        jam_pulangValue: jam_pulangValue ? jam_pulangValue : jam_berangkatValue,
        id_driver_num,
        asisten_luar_kotaValue: asisten_luar_kotaValue || null,
        areaValue,
        jml_hari_luar_kota,
        dariValue,
        tujuanValue,
        km_awal_num,
        km_akhir_num,
        selisih_km,
        biaya_antar_num,
        biaya_dibayar_num,
        nama_pemesan: pemesanData ? pemesanData.nama_pemesan : 'Tanpa Pemesan',
        hp: pemesanData ? pemesanData.hp : '000000000000',
        nama_pm: pmData ? pmData.nama_pm : 'Tanpa PM',
        alamat_pm: pmData ? pmData.alamat_pm : 'Alamat tidak tersedia',
        nik: pmData ? pmData.nik : null,
        no_kk: pmData ? pmData.no_kk : null,
        tempat_lahir: pmData ? pmData.tempat_lahir : null,
        tgl_lahir: pmData && pmData.tgl_lahir ? 
          (new Date(pmData.tgl_lahir).toISOString().split('T')[0]) : 
          null,
        jenis_kelamin_pm: pmData ? pmData.jenis_kelamin_pm : 'Tidak Diketahui',
        usia_pm: pmData && pmData.usia_pm !== null ? 
          pmData.usia_pm.toString() : 
          '0',
        id_asnaf: pmData && pmData.id_asnaf !== null ? pmData.id_asnaf : 1,
        status_layanan,
        pembatalan,
        keterbatasan,
        infaq_num,
        id_reward_num,
        reward_driver: 0,
        reward_asisten: 0,
        agama: pmData ? pmData.agama : null,
        status_marital: pmData ? pmData.status_marital : null,
        kegiatanValue: kegiatanValue || 'pengantaran',
        rumpun_programValue: rumpun_programValue || 'kesehatan'
      });

      // Sanitize the asisten_luar_kota value to prevent SQL issues
      const sanitizedAsisten = asisten_luar_kotaValue ? 
        asisten_luar_kotaValue.toString().replace(/'/g, "''") : 
        null;

      result = await sql`
        INSERT INTO ambulan_activity (
          "id_kantor",
          "tgl",
          "tgl_pulang",
          "bulan",
          "tahun",
          "id_ambulan",
          "id_detail",
          "jam_berangkat",
          "jam_pulang",
          "id_driver",
          "asisten_luar_kota",
          "area",
          "jml_hari_luar_kota",
          "dari",
          "tujuan",
          "km_awal",
          "km_akhir",
          "selisih_km",
          "biaya_antar",
          "biaya_dibayar",
          "nama_pemesan",
          "hp",
          "nama_pm",
          "alamat_pm",
          "nik",
          "no_kk",
          "tempat_lahir",
          "tgl_lahir",
          "jenis_kelamin_pm",
          "usia_pm",
          "id_asnaf",
          "status_layanan",
          "pembatalan",
          "keterbatasan",
          "infaq",
          "id_reward",
          "reward_driver",
          "reward_asisten",
          "agama",
          "status_marital",
          "kegiatan",
          "rumpun_program",
          "tgl_insert"
        )
        VALUES (
          ${id_kantor_num},
          ${tglValue},
          ${tgl_pulangValue ? tgl_pulangValue : tglValue},
          ${bulan},
          ${tahun},
          ${id_ambulan_num},
          ${id_detail_num},
          ${jam_berangkatValue},
          ${jam_pulangValue ? jam_pulangValue : jam_berangkatValue},
          ${id_driver_num},
          ${sanitizedAsisten},
          ${areaValue},
          ${jml_hari_luar_kota},
          ${dariValue},
          ${tujuanValue},
          ${km_awal_num},
          ${km_akhir_num},
          ${selisih_km},
          ${biaya_antar_num},
          ${biaya_dibayar_num},
          ${pemesanData ? pemesanData.nama_pemesan : 'Tanpa Pemesan'},
          ${pemesanData ? pemesanData.hp : '000000000000'},
          ${pmData ? pmData.nama_pm : 'Tanpa PM'},
          ${pmData ? pmData.alamat_pm : 'Alamat tidak tersedia'},
          ${pmData ? pmData.nik : null},
          ${pmData ? pmData.no_kk : null},
          ${pmData ? pmData.tempat_lahir : null},
          ${pmData && pmData.tgl_lahir ? 
            (new Date(pmData.tgl_lahir).toISOString().split('T')[0]) : 
            null},
          ${pmData ? pmData.jenis_kelamin_pm : 'Tidak Diketahui'},
          ${pmData && pmData.usia_pm !== null ? 
            pmData.usia_pm.toString() : 
            '0'},
          ${pmData && pmData.id_asnaf !== null ? pmData.id_asnaf : 1},
          ${status_layanan},
          ${pembatalan},
          ${keterbatasan},
          ${infaq_num},
          ${id_reward_num},
          ${0},
          ${0},
          ${pmData ? pmData.agama : null},
          ${pmData ? pmData.status_marital : null},
          ${kegiatanValue || 'pengantaran'},
          ${rumpun_programValue || 'kesehatan'},
          NOW()
        )
        RETURNING id
      `
    } catch (dbError: any) {
      console.error("Database error inserting activity:", dbError);
      console.error("Database error code:", dbError.code);
      console.error("Database error detail:", dbError.detail);
      console.error("Database error hint:", dbError.hint);
      
      return NextResponse.json(
        { 
          error: "Database error inserting activity", 
          details: dbError.message,
          code: dbError.code,
          detail: dbError.detail,
          hint: dbError.hint
        },
        { status: 500 }
      )
    }
    
    // Get the inserted activity ID
    const activityId = result[0].id;
    console.log("Insert result:", result);
    
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
            INSERT INTO dokumentasi_activity (id_activity, url)
            VALUES (${activityId}, ${blob.url})
          `;
        }
      } catch (docError: any) {
        console.error("Error processing documentation:", docError);
        // We don't return an error here because the activity was successfully created
      }
    }
    
    return NextResponse.json({ id: activityId, message: "Activity created successfully" })
  } catch (error: any) {
    console.error("Error creating activity:", error)
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