import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-magetan-2026";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify JWT
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as {
      id: string;
      email: string;
      name?: string;
    };

    return NextResponse.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    console.error("Auth Me Verification Error:", error);
    // Token is invalid/expired
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
