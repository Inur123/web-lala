"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global Error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animated Warning Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-75" />
              <div className="relative flex items-center justify-center size-20 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                <AlertTriangle className="size-10" />
              </div>
            </div>
          </div>

          {/* Text Details */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter">
              Kesalahan Fatal Aplikasi
            </h1>
            <p className="text-sm text-gray-400 font-semibold leading-relaxed">
              Terjadi kegagalan kritis pada struktur utama aplikasi. Kami sedang mendeteksi dan mencoba memulihkan kondisi ini.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-gray-300 select-all bg-gray-100/50 rounded py-1 px-2 border border-gray-100 w-fit mx-auto">
                ID Kasus: {error.digest}
              </p>
            )}
          </div>

          {/* Refresh/Retry action */}
          <div className="flex justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="size-4 animate-spin" style={{ animationDuration: "3s" }} />
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
