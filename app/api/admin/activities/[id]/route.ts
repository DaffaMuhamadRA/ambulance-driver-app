import { NextResponse } from "next/server"
import { getSession } from "@/app/api/auth/session/route"
import { getActivityById, getActivityByIdWithReferences } from "@/lib/activities"
import { sql } from "@/lib/db"
import { put } from '@vercel/blob'

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
    
    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }
    
    console.log("Admin fetching activity with ID:", activityId);
    
    const activity = await getActivityByIdWithReferences(activityId)
    
    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }
    
    console.log("Admin successfully fetched activity:", activity.id);
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
    
    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
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
    
    // Validate required fields
    if (!id_kantor || !tgl || !id_ambulan || !id_detail || !jam_berangkat || 
        !id_driver || !area || !dari || !tujuan || !km_awal || !km_akhir || 
        !biaya_antar) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
    
    // Update the activity
    try {
      // Sanitize the asisten_luar_kota value to prevent SQL issues
      const sanitizedAsisten = asisten_luar_kota ? 
        asisten_luar_kota.toString().replace(/'/g, "''") : 
        null;

      await sql`
        UPDATE ambulan_activity SET
          "id_kantor" = ${id_kantor_num},
          "tgl" = ${tgl},
          "tgl_pulang" = ${tgl_pulang ? tgl_pulang : tgl},
          "bulan" = ${new Date(tgl).getMonth() + 1},
          "tahun" = ${new Date(tgl).getFullYear()},
          "id_ambulan" = ${id_ambulan_num},
          "id_detail" = ${id_detail_num},
          "jam_berangkat" = ${jam_berangkat},
          "jam_pulang" = ${jam_pulang ? jam_pulang : jam_berangkat},
          "id_driver" = ${id_driver_num},
          "asisten_luar_kota" = ${sanitizedAsisten},
          "area" = ${area},
          "jml_hari_luar_kota" = ${jml_hari_luar_kota},
          "dari" = ${dari},
          "tujuan" = ${tujuan},
          "km_awal" = ${km_awal_num},
          "km_akhir" = ${km_akhir_num},
          "selisih_km" = ${selisih_km},
          "biaya_antar" = ${biaya_antar_num},
          "biaya_dibayar" = ${biaya_dibayar_num},
          "nama_pemesan" = ${pemesanData ? pemesanData.nama_pemesan : 'Tanpa Pemesan'},
          "hp" = ${pemesanData ? pemesanData.hp : '000000000000'},
          "nama_pm" = ${pmData ? pmData.nama_pm : 'Tanpa PM'},
          "alamat_pm" = ${pmData ? pmData.alamat_pm : 'Alamat tidak tersedia'},
          "nik" = ${pmData ? pmData.nik : null},
          "no_kk" = ${pmData ? pmData.no_kk : null},
          "tempat_lahir" = ${pmData ? pmData.tempat_lahir : null},
          "tgl_lahir" = ${pmData && pmData.tgl_lahir ? 
            (new Date(pmData.tgl_lahir).toISOString().split('T')[0]) : 
            null},
          "jenis_kelamin_pm" = ${pmData ? pmData.jenis_kelamin_pm : 'Tidak Diketahui'},
          "usia_pm" = ${pmData && pmData.usia_pm !== null ? 
            pmData.usia_pm.toString() : 
            '0'},
          "id_asnaf" = ${pmData && pmData.id_asnaf !== null ? pmData.id_asnaf : 1},
          "status_layanan" = ${status_layanan},
          "pembatalan" = ${pembatalan},
          "keterbatasan" = ${keterbatasan},
          "infaq" = ${infaq_num},
          "id_reward" = ${id_reward_num},
          "agama" = ${pmData ? pmData.agama : null},
          "status_marital" = ${pmData ? pmData.status_marital : null},
          "kegiatan" = ${kegiatan || 'pengantaran'},
          "rumpun_program" = ${rumpun_program || 'kesehatan'}
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
            INSERT INTO dokumentasi_activity (id_activity, url)
            VALUES (${activityId}, ${blob.url})
          `;
        }
      } catch (docError: any) {
        console.error("Error processing documentation:", docError);
        // We don't return an error here because the activity was successfully updated
      }
    }
    
    // Remove documentation that was marked for deletion
    if (existingDocumentation && existingDocumentation.length > 0) {
      try {
        // Get current documentation IDs for this activity
        const currentDocsResult = await sql`
          SELECT id FROM dokumentasi_activity WHERE id_activity = ${activityId}
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
    
    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
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
