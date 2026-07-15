import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  // Protect: only authenticated admin can update
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { stage, status } = body as {
    stage: "admin" | "screening";
    status: "lolos" | "ditolak";
  };

  if (!stage || !["admin", "screening"].includes(stage)) {
    return NextResponse.json({ error: "Stage tidak valid." }, { status: 400 });
  }
  if (!status || !["lolos", "ditolak"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (stage === "admin") {
    await query(
      `UPDATE registrations
       SET admin_status = $1, admin_reviewed_at = $2, updated_at = $2
       WHERE id = $3`,
      [status, now, id]
    );
    // Jika admin ditolak, otomatis set screening ke ditolak juga
    if (status === "ditolak") {
      await query(
        `UPDATE registrations
         SET screening_status = 'ditolak', screening_reviewed_at = $2
         WHERE id = $1`,
        [id, now]
      );
    }
  } else {
    // screening hanya bisa diupdate jika sudah lolos administrasi
    const result = await query(
      `SELECT admin_status FROM registrations WHERE id = $1`,
      [id]
    );
    if (!result.rows[0] || result.rows[0].admin_status !== "lolos") {
      return NextResponse.json(
        { error: "Peserta belum lolos tahap administrasi." },
        { status: 400 }
      );
    }
    await query(
      `UPDATE registrations
       SET screening_status = $1, screening_reviewed_at = $2, updated_at = $2
       WHERE id = $3`,
      [status, now, id]
    );
  }

  return NextResponse.json({ success: true });
}
