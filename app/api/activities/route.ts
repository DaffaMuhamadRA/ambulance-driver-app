import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/app/api/auth/session/route"

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
    
    const body = await request.json()
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
    
    // Log the raw asisten_luar_kota value for debugging
    console.log("Raw asisten_luar_kota value:", asisten_luar_kota);
    console.log("Type of asisten_luar_kota:", typeof asisten_luar_kota);
    
    console.log("Extracted fields:", {
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
      kegiatan,
      rumpun_program
    });
    
    // Validate required fields
    if (!id_kantor || !tgl || !id_ambulan || !id_detail || !jam_berangkat || 
        !id_driver || !area || !dari || !tujuan || !km_awal || !km_akhir || 
        !biaya_antar) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Calculate derived fields with error handling
    let tglDate: Date;
    let tglPulangDate: Date | null = null;
    let bulan: number;
    let tahun: number;
    
    try {
      tglDate = new Date(tgl);
      // Validate that the date is valid
      if (isNaN(tglDate.getTime())) {
        throw new Error("Invalid date value");
      }
      bulan = tglDate.getMonth() + 1;
      tahun = tglDate.getFullYear();
      
      // Validate tgl_pulang if provided
      if (tgl_pulang) {
        tglPulangDate = new Date(tgl_pulang);
        if (isNaN(tglPulangDate.getTime())) {
          throw new Error("Invalid tgl_pulang value");
        }
      }
    } catch (dateError) {
      console.error("Date parsing error:", dateError);
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }
    
    // Parse numeric fields with error handling
    let km_awal_num: number;
    let km_akhir_num: number;
    let selisih_km: number;
    
    try {
      km_awal_num = parseInt(km_awal);
      km_akhir_num = parseInt(km_akhir);
      selisih_km = km_akhir_num - km_awal_num;
      
      if (isNaN(km_awal_num) || isNaN(km_akhir_num)) {
        throw new Error("Invalid KM values");
      }
    } catch (numError) {
      console.error("Numeric parsing error:", numError);
      return NextResponse.json(
        { error: "Invalid numeric values for KM fields" },
        { status: 400 }
      )
    }
    
    // Parse other numeric fields
    let biaya_antar_num: number;
    try {
      biaya_antar_num = parseInt(biaya_antar);
      if (isNaN(biaya_antar_num)) {
        throw new Error("Invalid biaya_antar value");
      }
    } catch (numError) {
      console.error("Biaya antar parsing error:", numError);
      return NextResponse.json(
        { error: "Invalid numeric value for biaya_antar" },
        { status: 400 }
      )
    }
    
    // Set default values for some fields
    const jml_hari_luar_kota = area === 'Luar Kota' ? 1 : 0;
    const status_layanan = "Selesai";
    const pembatalan = "Tidak";
    const keterbatasan = "Tidak";
    
    // Parse optional numeric fields
    let biaya_dibayar_num: number | null = null;
    if (biaya_dibayar) {
      try {
        biaya_dibayar_num = parseInt(biaya_dibayar);
        if (isNaN(biaya_dibayar_num)) {
          biaya_dibayar_num = null;
        }
      } catch (e) {
        biaya_dibayar_num = null;
      }
    }
    
    let infaq_num: number | null = null;
    if (infaq) {
      try {
        infaq_num = parseInt(infaq);
        if (isNaN(infaq_num)) {
          infaq_num = null;
        }
      } catch (e) {
        infaq_num = null;
      }
    }
    
    let id_reward_num: number | null = null;
    if (id_reward) {
      try {
        id_reward_num = parseInt(id_reward);
        if (isNaN(id_reward_num)) {
          id_reward_num = null;
        }
      } catch (e) {
        id_reward_num = null;
      }
    }
    
    let id_kantor_num: number | null = null;
    if (id_kantor) {
      try {
        id_kantor_num = parseInt(id_kantor);
        if (isNaN(id_kantor_num)) {
          id_kantor_num = null;
        }
      } catch (e) {
        id_kantor_num = null;
      }
    }
    
    let id_ambulan_num: number | null = null;
    if (id_ambulan) {
      try {
        id_ambulan_num = parseInt(id_ambulan);
        if (isNaN(id_ambulan_num)) {
          id_ambulan_num = null;
        }
      } catch (e) {
        id_ambulan_num = null;
      }
    }
    
    let id_detail_num: number | null = null;
    if (id_detail) {
      try {
        id_detail_num = parseInt(id_detail);
        if (isNaN(id_detail_num)) {
          id_detail_num = null;
        }
      } catch (e) {
        id_detail_num = null;
      }
    }
    
    let id_pemesan_num: number | null = null;
    if (id_pemesan) {
      try {
        id_pemesan_num = parseInt(id_pemesan);
        if (isNaN(id_pemesan_num)) {
          id_pemesan_num = null;
        }
      } catch (e) {
        id_pemesan_num = null;
      }
    }
    
    let id_penerima_manfaat_num: number | null = null;
    if (id_penerima_manfaat) {
      try {
        id_penerima_manfaat_num = parseInt(id_penerima_manfaat);
        if (isNaN(id_penerima_manfaat_num)) {
          id_penerima_manfaat_num = null;
        }
      } catch (e) {
        id_penerima_manfaat_num = null;
      }
    }
    
    let id_driver_num: number | null = null;
    if (id_driver) {
      try {
        id_driver_num = parseInt(id_driver);
        if (isNaN(id_driver_num)) {
          id_driver_num = null;
        }
      } catch (e) {
        id_driver_num = null;
      }
    }
    
    // Fetch required data from pemesan and penerima_manfaat tables
    let pemesanData = null
    let pmData = null
    
    if (id_pemesan_num) {
      console.log("Fetching pemesan data for id:", id_pemesan_num);
      try {
        const pemesanResult = await sql`
          SELECT nama_pemesan, hp FROM pemesan WHERE id = ${id_pemesan_num}
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
    
    if (id_penerima_manfaat_num) {
      console.log("Fetching PM data for id:", id_penerima_manfaat_num);
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
          WHERE id = ${id_penerima_manfaat_num}
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
      tgl,
      tgl_pulang: tgl_pulang || tgl,
      bulan,
      tahun,
      id_ambulan: id_ambulan_num,
      id_detail: id_detail_num,
      jam_berangkat,
      jam_pulang: jam_pulang || jam_berangkat,
      id_driver: id_driver_num,
      asisten_luar_kota: asisten_luar_kota || null,
      area,
      jml_hari_luar_kota,
      dari,
      tujuan,
      km_awal_num,
      km_akhir_num,
      selisih_km,
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
      id_pemesan: id_pemesan_num,
      id_penerima_manfaat: id_penerima_manfaat_num,
      infaq: infaq_num,
      id_reward: id_reward_num,
      kegiatan,
      rumpun_program
    });
    
    // Insert the activity
    let result;
    try {
      // Log the values being inserted for debugging
      console.log("Values being inserted:", {
        id_kantor_num,
        tgl,
        tgl_pulang: tgl_pulang ? tgl_pulang : tgl,
        bulan,
        tahun,
        id_ambulan_num,
        id_detail_num,
        jam_berangkat,
        jam_pulang: jam_pulang ? jam_pulang : jam_berangkat,
        id_driver_num,
        asisten_luar_kota: asisten_luar_kota || null,
        area,
        jml_hari_luar_kota,
        dari,
        tujuan,
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
        kegiatan: kegiatan || 'pengantaran',
        rumpun_program: rumpun_program || 'kesehatan'
      });

      // Sanitize the asisten_luar_kota value to prevent SQL issues
      const sanitizedAsisten = asisten_luar_kota ? 
        asisten_luar_kota.toString().replace(/'/g, "''") : 
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
          ${tgl},
          ${tgl_pulang ? tgl_pulang : tgl},
          ${bulan},
          ${tahun},
          ${id_ambulan_num},
          ${id_detail_num},
          ${jam_berangkat},
          ${jam_pulang ? jam_pulang : jam_berangkat},
          ${id_driver_num},
          ${sanitizedAsisten},
          ${area},
          ${jml_hari_luar_kota},
          ${dari},
          ${tujuan},
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
          ${kegiatan || 'pengantaran'},
          ${rumpun_program || 'kesehatan'},
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
    
    console.log("Insert result:", result);
    return NextResponse.json({ id: result[0].id, message: "Activity created successfully" })
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