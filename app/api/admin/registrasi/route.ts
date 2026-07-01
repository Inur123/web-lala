import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  // Protect: only authenticated admin
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await query(
    `SELECT
       r.id, r.name, r.gender, r.delegation, r.reason, r.shirt_size, r.sleeve_type,
       r.admin_status, r.admin_reviewed_at,
       r.screening_status, r.screening_reviewed_at,
       r.created_at,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'field_key', f.field_key,
             'file_name', f.file_name,
             'r2_key', f.r2_key,
             'r2_url', f.r2_url
           )
         ) FILTER (WHERE f.id IS NOT NULL),
         '[]'
       ) AS files
     FROM registrations r
     LEFT JOIN registration_files f ON f.registration_id = r.id
     GROUP BY r.id
     ORDER BY r.created_at DESC`
  );

  return NextResponse.json({ data: result.rows });
}
