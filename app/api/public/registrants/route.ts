import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await query(`
      SELECT 
        r.id, 
        r.name, 
        r.gender, 
        r.delegation, 
        r.admin_status, 
        r.screening_status,
        f.r2_key,
        f.field_key
      FROM registrations r
      LEFT JOIN registration_files f ON r.id = f.registration_id AND f.field_key = 'fotoFormal'
      ORDER BY r.created_at DESC
    `);
    
    // Transform data ke array pendaftar unik beserta key foto
    const registrants = res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      gender: row.gender,
      delegation: row.delegation,
      adminStatus: row.admin_status,
      screeningStatus: row.screening_status,
      photoKey: row.r2_key || null,
    }));

    return new Response(JSON.stringify({ registrants }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("GET public registrants error:", error);
    return NextResponse.json({ error: "Failed to fetch registrants list" }, { status: 500 });
  }
}
