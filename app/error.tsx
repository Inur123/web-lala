"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke konsol internal
    console.error("System Error Page:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100 animate-pulse" />
            <div className="relative flex items-center justify-center size-20 rounded-full bg-red-50 text-red-600 border border-red-100">
              <AlertOctagon className="size-10 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-red-600 tracking-tighter">
            Ups, Terjadi Kesalahan!
          </h1>
          <h2 className="text-sm font-semibold text-gray-400 leading-relaxed">
            Sistem mengalami masalah internal saat memuat halaman ini. Silakan coba muat kembali atau hubungi Administrator.
          </h2>
          {error.digest && (
            <p className="text-[10px] font-mono text-gray-300 select-all bg-gray-100/50 rounded py-1 px-2 border border-gray-100 w-fit mx-auto">
              ID Error: {error.digest}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a4d2e] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#153e25] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="size-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
}
