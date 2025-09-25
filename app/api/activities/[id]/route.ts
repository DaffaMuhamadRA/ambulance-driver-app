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
    
    console.log("GET request for activity ID:", activityId);
    
    if (isNaN(activityId)) {
      console.log("Invalid activity ID provided:", params.id);
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
      console.log("No session cookie found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    const session = await getSession(sessionToken)
    
    if (!session) {
      console.log("Invalid session token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.log("Fetching activity with ID:", activityId);
    
    // Add specific logging for debugging
    console.log("About to call getActivityByIdWithReferences");
    const activity = await getActivityByIdWithReferences(activityId)
    console.log("Returned from getActivityByIdWithReferences, activity:", activity);
    
    if (!activity) {
      console.log("Activity not found with ID:", activityId);
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
      console.log("Driver role check - userDriverId:", userDriverId, "activity.user.id:", activity.user.id);
      if (userDriverId === null || activity.user.id !== userDriverId) {
        console.log("Forbidden access - driver ID mismatch");
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

    // Authorization check - both admin and driver can update
    // For drivers, check if the activity belongs to them
    if (session.user.role === "driver") {
      const userDriverId = session.user.id_driver || session.user.id;
      if (userDriverId === null || existingActivity.user.id !== userDriverId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    const formData = await request.formData()
    
    // Extract form fields
    const tglValue = formData.get("tgl_berangkat") as string
    const tgl_pulangValue = formData.get("tgl_pulang") as string
    const id_ambulanValue = formData.get("id_ambulan") as string
    const id_detailValue = formData.get("id_detail") as string
    const jam_berangkatValue = formData.get("jam_berangkat") as string
    const jam_pulangValue = formData.get("jam_pulang") as string
    const id_driverValue = formData.get("id_driver") as string
    const id_kantorValue = formData.get("id_kantor") as string
    const asisten_luar_kotaValue = formData.get("asisten_luar_kota") as string
    const areaValue = formData.get("area") as string
    const dariValue = formData.get("dari") as string
    const tujuanValue = formData.get("tujuan") as string
    const km_awalValue = formData.get("km_awal") as string
    const km_akhirValue = formData.get("km_akhir") as string
    const biaya_antarValue = formData.get("biaya_antar") as string
    const biaya_dibayarValue = formData.get("biaya_dibayar") as string
    const id_pemesanValue = formData.get("id_pemesan") as string
    const id_penerima_manfaatValue = formData.get("id_penerima_manfaat") as string
    const infaqValue = formData.get("infaq") as string
    const id_rewardValue = formData.get("id_reward") as string
    const kegiatanValue = formData.get("kegiatan") as string
    const rumpun_programValue = formData.get("rumpun_program") as string
    
    // Parse documentation to delete
    let documentationToDelete: number[] = []
    const documentationToDeleteValue = formData.get("documentationToDelete") as string
    if (documentationToDeleteValue) {
      try {
        documentationToDelete = JSON.parse(documentationToDeleteValue)
      } catch (e) {
        console.error("Error parsing documentationToDelete:", e)
      }
    }
    
    const documentationFiles = formData.getAll("documentation") as File[]
    
    console.log("Documentation files count:", documentationFiles.length);
    console.log("Documentation to delete count:", documentationToDelete.length);
    console.log("Activity ID for documentation:", activityId);
    
    // Log details about each documentation file
    documentationFiles.forEach((file, index) => {
      console.log(`Documentation file ${index}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    });
    
    // Log existing documentation IDs
    console.log("Existing documentation IDs:", documentationToDelete);
    
    // Extract fields from form data with proper type handling
    const id_kantor = id_kantorValue ? parseInt(id_kantorValue) : undefined
    const tgl_berangkat = tglValue
    const tgl_pulang = tgl_pulangValue
    const id_ambulan = id_ambulanValue ? parseInt(id_ambulanValue) : undefined
    const id_detail = id_detailValue ? parseInt(id_detailValue) : undefined
    const jam_berangkat = jam_berangkatValue
    const jam_pulang = jam_pulangValue
    const id_driver = id_driverValue ? parseInt(id_driverValue) : undefined
    const asisten_luar_kota = asisten_luar_kotaValue
    const area = areaValue
    const dari = dariValue
    const tujuan = tujuanValue
    const km_awal = km_awalValue ? parseInt(km_awalValue) : undefined
    const km_akhir = km_akhirValue ? parseInt(km_akhirValue) : undefined
    const biaya_antar = biaya_antarValue ? parseInt(biaya_antarValue) : undefined
    const biaya_dibayar = biaya_dibayarValue !== "" ? biaya_dibayarValue : undefined
    const id_pemesan = id_pemesanValue ? parseInt(id_pemesanValue) : undefined
    const id_penerima_manfaat = id_penerima_manfaatValue ? parseInt(id_penerima_manfaatValue) : undefined
    const infaq = infaqValue !== "" ? infaqValue : undefined
    const id_reward = id_rewardValue ? parseInt(id_rewardValue) : undefined
    const kegiatan = kegiatanValue || "pengantaran"
    const rumpun_program = rumpun_programValue || "kesehatan"
    
    // For server-side reconciliation, we only validate fields that are provided
    // If a field is not provided, we'll use the existing value from the database
    const validationErrors = []
    
    // Validate date if provided
    let sanitizedTgl = null
    if (tgl_berangkat !== undefined) {
      sanitizedTgl = validateDateInput(tgl_berangkat)
      if (!sanitizedTgl) validationErrors.push("Tanggal Berangkat")
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
    const tglValueFinal = finalTgl
    const tgl_pulangValueFinal = sanitizedTglPulang || existingActivity.tgl_pulang || finalTgl
    const id_ambulan_num = finalIdAmbulan
    const id_detail_num = finalIdDetail
    const jam_berangkatValueFinal = finalJamBerangkat
    const jam_pulangValueFinal = sanitizedJamPulang || existingActivity.jam_pulang || finalJamBerangkat
    const id_driver_num = sanitizedIdDriver !== null ? sanitizedIdDriver : existingActivity.id_driver
    const areaValueFinal = finalArea
    const dariValueFinal = finalDari
    const tujuanValueFinal = finalTujuan
    const km_awal_num = finalKmAwal
    const km_akhir_num = finalKmAkhir
    const selisih_km = finalSelisihKm
    const biaya_antar_num = finalBiayaAntar
    const biaya_dibayar_num = sanitizedBiayaDibayar !== null ? sanitizedBiayaDibayar : existingActivity.biaya_dibayar
    const infaq_num = sanitizedInfaq !== null ? sanitizedInfaq : existingActivity.infaq
    const id_reward_num = sanitizedIdReward !== null ? sanitizedIdReward : existingActivity.id_reward
    const kegiatanValueFinal = sanitizedKegiatan || existingActivity.kegiatan || 'pengantaran'
    const rumpun_programValueFinal = sanitizedRumpunProgram || existingActivity.rumpun_program || 'kesehatan'
    const asisten_luar_kotaValueFinal = sanitizedAsistenLuarKota !== null ? sanitizedAsistenLuarKota : existingActivity.asisten_luar_kota
    
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
          "tgl" = ${tglValueFinal},
          "tgl_pulang" = ${tgl_pulangValueFinal ? tgl_pulangValueFinal : tglValueFinal},
          "bulan" = ${bulan},
          "tahun" = ${tahun},
          "id_ambulan" = ${id_ambulan_num},
          "id_detail" = ${id_detail_num},
          "jam_berangkat" = ${jam_berangkatValueFinal},
          "jam_pulang" = ${jam_pulangValueFinal ? jam_pulangValueFinal : jam_berangkatValueFinal},
          "id_driver" = ${id_driver_num},
          "asisten_luar_kota" = ${sanitizedAsisten},
          "area" = ${areaValueFinal},
          "jml_hari_luar_kota" = ${jml_hari_luar_kota},
          "dari" = ${dariValueFinal},
          "tujuan" = ${tujuanValueFinal},
          "km_awal" = ${km_awal_num},
          "km_akhir" = ${km_akhir_num},
          "selisih_km" = ${selisih_km},
          "biaya_antar" = ${biaya_antar_num},
          "biaya_dibayar" = ${biaya_dibayar_num !== null ? biaya_dibayar_num : existingActivity.biaya_dibayar},
          "id_pemesan" = ${sanitizedIdPemesan !== null ? sanitizedIdPemesan : existingActivity.id_pemesan},
          "id_penerima_manfaat" = ${sanitizedIdPenerimaManfaat !== null ? sanitizedIdPenerimaManfaat : existingActivity.id_penerima_manfaat},
          "status_layanan" = ${status_layanan},
          "pembatalan" = ${pembatalan},
          "keterbatasan" = ${keterbatasan},
          "infaq" = ${infaq_num !== null ? infaq_num : existingActivity.infaq},
          "id_reward" = ${id_reward_num !== null ? id_reward_num : existingActivity.id_reward},
          "kegiatan" = ${kegiatanValueFinal || existingActivity.kegiatan || 'pengantaran'},
          "rumpun_program" = ${rumpun_programValueFinal || existingActivity.rumpun_program || 'kesehatan'}
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
    
    // Handle existing documentation - remove those that were deleted
    if (documentationToDelete && Array.isArray(documentationToDelete)) {
      try {
        // Delete documentation that was marked for removal
        for (const docId of documentationToDelete) {
          await sql`
            DELETE FROM dokumentasi_activity WHERE id = ${docId}
          `;
        }
        console.log(`Deleted ${documentationToDelete.length} documentation records`);
      } catch (docError: any) {
        console.error("Error deleting documentation:", docError);
        // We don't return an error here because the activity was successfully updated
      }
    }

    // Process new documentation files if any - ONLY CREATE NEW FILES
    if (documentationFiles && documentationFiles.length > 0) {
      try {
        console.log(`Processing ${documentationFiles.length} new documentation files for activity ${activityId}`);
        
        // Step 1: Upload all files to Vercel Blob first and collect URLs
        const blobUrls: string[] = [];
        
        for (const file of documentationFiles) {
          // Log file details for debugging
          console.log("Processing file:", {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          // Upload to Vercel Blob with proper error handling
          try {
            const blob = await put(
              `documentation/${activityId}/${file.name}`, 
              file, 
              { access: 'public', allowOverwrite: true }
            );
            console.log("Blob uploaded successfully:", blob.url);
            blobUrls.push(blob.url);
          } catch (uploadError: any) {
            console.error("Error uploading to Vercel Blob:", uploadError);
            throw new Error(`Failed to upload file ${file.name} to storage: ${uploadError.message}`);
          }
        }
        
        console.log("All new files uploaded. Blob URLs:", blobUrls);
        
        // Add a small delay to ensure blob is fully available
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: Insert all URLs into database
        console.log("Inserting new documentation records into database...");
        
        // First, verify that the activity exists and get its details
        let activityDetails;
        try {
          const activityCheck = await sql`
            SELECT id, tgl_pulang FROM ambulan_activity WHERE id = ${activityId}
          `;
          
          if (activityCheck.length === 0) {
            throw new Error(`Activity with ID ${activityId} does not exist`);
          }
          activityDetails = activityCheck[0];
          console.log("Verified activity exists:", activityDetails);
        } catch (activityCheckError: any) {
          console.error("Error verifying activity existence:", activityCheckError);
          throw new Error(`Failed to verify activity: ${activityCheckError.message}`);
        }
        
        // Insert all documentation records using a transaction-like approach
        const insertedRecords = [];
        let hasError = false;
        let errorMessage = "";
        
        for (const url of blobUrls) {
          try {
            console.log("Inserting documentation with values:", {
              activityId: activityId,
              url: url
            });
            
            // Log the exact query we're about to execute
            console.log("Executing query with parameters:", activityId, url);
            
            // Make sure the parameters are of the correct type
            const typedActivityId = parseInt(activityId.toString());
            const typedUrl = url.toString();
            
            console.log("Typed parameters:", typedActivityId, typedUrl);
            
            const insertResult = await sql`
              INSERT INTO dokumentasi_activity (id_activity, url)
              VALUES (${typedActivityId}, ${typedUrl})
              RETURNING id, id_activity, url, created_at
            `;
            console.log("Database insert successful:", insertResult);
            insertedRecords.push(insertResult[0]);
          } catch (dbError: any) {
            console.error("Database insertion error:", dbError);
            console.error("Error code:", dbError.code);
            console.error("Error detail:", dbError.detail);
            console.error("Error hint:", dbError.hint);
            
            // Log the exact query that failed
            console.error("Failed query values:", {
              activityId: activityId,
              url: url
            });
            
            hasError = true;
            errorMessage = `Failed to save file record to database: ${dbError.message}`;
            break; // Stop processing if any insert fails
          }
        }
        
        // If any insert failed, we should handle this appropriately
        if (hasError) {
          console.error("One or more database insertions failed:", errorMessage);
          // We don't throw an error here because the activity was successfully updated
          // The client will just see that documentation wasn't added, but the activity update succeeded
        }
        
        console.log("All new documentation records inserted successfully:", insertedRecords);
      } catch (docError: any) {
        console.error("Error processing new documentation:", docError);
        // We don't return an error here because the activity was successfully updated
        // The client will just see that documentation wasn't added, but the activity update succeeded
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
    console.log("DELETE request received for activity ID:", params.id);
    const activityId = parseInt(params.id)
    
    // Validate activity ID
    if (isNaN(activityId) || activityId <= 0) {
      console.log("Invalid activity ID:", params.id);
      return NextResponse.json(
        { error: "Invalid activity ID" },
        { status: 400 }
      )
    }
    
    console.log("Valid activity ID:", activityId);
    
    // Get session from cookies
    const cookieHeader = request.headers.get("cookie") || ""
    const sessionCookie = cookieHeader
      .split("; ")
      .find((cookie) => cookie.startsWith("session="))
    
    if (!sessionCookie) {
      console.log("No session cookie found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const sessionToken = sessionCookie.split("=")[1]
    console.log("Session token extracted");
    
    const session = await getSession(sessionToken)
    console.log("Session retrieved:", session ? "exists" : "null");
    
    if (!session) {
      console.log("Invalid session");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.log("User role:", session.user.role);
    
    // Fetch the existing activity from the database to check ownership
    console.log("Fetching activity with ID:", activityId);
    const existingActivity = await getActivityByIdWithReferences(activityId);
    console.log("Existing activity:", existingActivity ? "found" : "not found");
    
    if (!existingActivity) {
      console.log("Activity not found with ID:", activityId);
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // Authorization check - both admin and driver can delete
    // For drivers, check if the activity belongs to them
    if (session.user.role === "driver") {
      const userDriverId = session.user.id_driver || session.user.id;
      console.log("Driver role check - userDriverId:", userDriverId, "activity.user.id:", existingActivity.user.id);
      if (userDriverId === null || existingActivity.user.id !== userDriverId) {
        console.log("Forbidden access - driver ID mismatch");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    console.log("About to delete activity with ID:", activityId);
    
    // First delete all documentation associated with this activity due to foreign key constraint
    console.log("Deleting documentation for activity ID:", activityId);
    const docDeleteResult = await sql`
      DELETE FROM dokumentasi_activity WHERE id_activity = ${activityId}
    `;
    console.log("Documentation deletion result:", docDeleteResult);
    
    // Then delete the activity itself
    console.log("Deleting activity with ID:", activityId);
    const activityDeleteResult = await sql`
      DELETE FROM ambulan_activity WHERE id = ${activityId}
    `;
    
    console.log("Activity deletion result:", activityDeleteResult);
    return NextResponse.json({ message: "Activity deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting activity:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "Unknown error",
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
