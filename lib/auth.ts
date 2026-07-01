import { betterAuth } from "better-auth";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true, // aktifkan rate limiter di backend
    window: 60,    // durasi jendela waktu (60 detik)
    max: 50,       // maksimal 50 request secara global per IP per menit
    customRules: {
      "/sign-in/email": {
        window: 10, // dalam 10 detik
        max: 3,     // maksimal 3 kali percobaan login email per IP
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // session expired dalam 7 hari
    updateAge: 60 * 60 * 24,     // refresh session setiap 1 hari sekali
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // simpan cache session di cookie bertandatangan selama 5 menit (menghemat pembacaan query DB)
    }
  },
});
