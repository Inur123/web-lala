import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await query("SELECT value FROM system_settings WHERE key = $1", ["registration_open"]);
    const isOpen = res.rows[0]?.value === "true";
    return new Response(JSON.stringify({ isOpen }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("GET settings error:", error);
    return new Response(JSON.stringify({ isOpen: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
