"use client";

import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#1a4d2e]/10 animate-ping opacity-75" />
            <div className="relative flex items-center justify-center size-20 rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e]">
              <HelpCircle className="size-10" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-[#1a4d2e] tracking-tighter">
            404
          </h1>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm text-gray-400 font-semibold leading-relaxed">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain. Silakan periksa kembali URL Anda.
          </p>
        </div>

        {/* Back Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a4d2e] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#153e25] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <MoveLeft className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
