import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { query } from "@/lib/db";
import { uploadToR2, getR2PublicUrl } from "@/lib/r2";

export const dynamic = "force-dynamic";

// File fields yang wajib diupload
const REQUIRED_FILE_FIELDS = [
  "sertifikatMakesta",
  "sertifikatLakmud",
  "rekomendasi",
  "essay",
  "ktpKta",
  "formulir",
  "paktaIntegritas",
  "fotoFormal",
  "buktiBayar",
] as const;

// Text fields yang wajib diisi
const REQUIRED_TEXT_FIELDS = [
  "name",
  "gender",
  "delegation",
  "reason",
  "shirtSize",
  "sleeveType",
  "whatsapp",
  "birthDate",
  "email",
] as const;

export async function POST(request: Request) {
  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    // --- Validasi text fields ---
    const textData: Record<string, string> = {};
    for (const field of REQUIRED_TEXT_FIELDS) {
      const value = formData.get(field);
      if (!value || typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { error: `Field "${field}" wajib diisi.` },
          { status: 400 }
        );
      }
      textData[field] = value.trim();
    }

    // --- Validasi Batas Panjang Karakter (Anti-Spam/Exploit) ---
    if (textData.name.length > 100) {
      return NextResponse.json(
        { error: "Nama Lengkap terlalu panjang (Maksimal 100 karakter)." },
        { status: 400 }
      );
    }
    if (textData.delegation.length > 100) {
      return NextResponse.json(
        { error: "Asal Delegasi PAC terlalu panjang (Maksimal 100 karakter)." },
        { status: 400 }
      );
    }
    if (textData.reason.length > 1000) {
      return NextResponse.json(
        { error: "Alasan Pendaftaran terlalu panjang (Maksimal 1000 karakter)." },
        { status: 400 }
      );
    }
    if (textData.whatsapp.length > 30) {
      return NextResponse.json(
        { error: "No. WhatsApp terlalu panjang." },
        { status: 400 }
      );
    }
    if (textData.email.length > 150) {
      return NextResponse.json(
        { error: "Email terlalu panjang." },
        { status: 400 }
      );
    }

    // --- Cek Duplikasi Email ---
    const emailCheck = await query(
      `SELECT id FROM registrations WHERE email = $1`,
      [textData.email.toLowerCase()]
    );
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan gunakan email lain." },
        { status: 400 }
      );
    }

    // --- Validasi file fields ---
    const fileEntries: Record<string, File> = {};
    for (const field of REQUIRED_FILE_FIELDS) {
      const file = formData.get(field);

      if (!file || !(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: `Berkas "${field}" wajib diunggah.` },
          { status: 400 }
        );
      }
      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Berkas "${field}" melebihi batas ukuran 10MB.` },
          { status: 400 }
        );
      }

      // Validasi Ekstensi File di Sisi Server (Backend)
      const fileName = file.name.toLowerCase();
      
      // 1. Wajib PDF saja (rekomendasi, essay, formulir)
      if (["rekomendasi", "essay", "formulir"].includes(field)) {
        if (!fileName.endsWith(".pdf")) {
          return NextResponse.json(
            { error: `Berkas "${field}" wajib memiliki format PDF saja.` },
            { status: 400 }
          );
        }
      }

      // 2. Wajib Gambar saja (fotoFormal)
      if (field === "fotoFormal") {
        if (!fileName.endsWith(".png") && !fileName.endsWith(".jpg") && !fileName.endsWith(".jpeg")) {
          return NextResponse.json(
            { error: `Berkas Foto Formal wajib memiliki format gambar (PNG / JPG) saja.` },
            { status: 400 }
          );
        }
      }

      fileEntries[field] = file;
    }

    // --- Generate ID registrasi unik ---
    const registrationId = uuidv4();

    // --- Simpan data registrasi ke database ---
    await query(
      `INSERT INTO registrations (id, name, gender, delegation, reason, shirt_size, sleeve_type, whatsapp, birth_date, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        registrationId,
        textData.name,
        textData.gender,
        textData.delegation,
        textData.reason,
        textData.shirtSize,
        textData.sleeveType,
        textData.whatsapp,
        textData.birthDate,
        textData.email.toLowerCase(),
      ]
    );

    // --- Sanitize nama peserta untuk nama folder R2 ---
    // Contoh: "Ahmad Dimas" → "Ahmad-Dimas"
    let sanitizedName = textData.name
      .trim()
      .replace(/\s+/g, "-")          // spasi → dash (-)
      .replace(/[^a-zA-Z0-9_-]/g, ""); // hapus karakter non-alphanumeric

    if (!sanitizedName) {
      sanitizedName = registrationId;
    } else {
      // Cek apakah sudah ada peserta dengan nama yang sama di database
      const nameCheck = await query(
        `SELECT COUNT(*) FROM registrations WHERE name = $1`,
        [textData.name]
      );
      const count = parseInt(nameCheck.rows[0].count, 10);
      
      // Jika data duplicate (karena user baru ini sudah masuk DB di baris 95, 
      // jadi jika count > 1 berarti ada orang lain dengan nama yang sama)
      if (count > 1) {
        sanitizedName = `${sanitizedName}-${count - 1}`;
      }
    }

    // --- Upload semua file ke R2 secara paralel ---
    const uploadResults = await Promise.all(
      Object.entries(fileEntries).map(async ([fieldKey, file]) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Ambil ekstensi file dari nama asli
        const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
        const r2Key = `registrations/${sanitizedName}/${fieldKey}.${ext}`;

        await uploadToR2(r2Key, buffer, file.type || "application/octet-stream");

        const publicUrl = getR2PublicUrl(r2Key);

        return {
          fieldKey,
          fileName: file.name,
          r2Key,
          r2Url: publicUrl,
          fileSize: file.size,
          mimeType: file.type,
        };
      })
    );

    // --- Simpan metadata file ke database ---
    for (const result of uploadResults) {
      await query(
        `INSERT INTO registration_files (id, registration_id, field_key, file_name, r2_key, r2_url, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          registrationId,
          result.fieldKey,
          result.fileName,
          result.r2Key,
          result.r2Url,
          result.fileSize,
          result.mimeType,
        ]
      );
    }

    return NextResponse.json(
      {
        success: true,
        registrationId,
        message: "Registrasi berhasil dikirim.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register API] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
