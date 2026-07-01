"use client";

import { HERO_BADGE, HERO_SUBTITLE } from "@/constants/landing";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const handleScrollTo = (targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      const offsetPosition = element.offsetTop - 70;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-white px-4 pt-24 text-center sm:px-8 lg:px-12"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(82, 183, 136, 0.12) 0%, transparent 60%),
          linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 45px 45px, 45px 45px",
      }}
    >
      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6">
        {/* Badge */}
        <span
          id="hero-badge"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f8fafc] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#1a4d2e]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#1a4d2e] animate-pulse" />
          {HERO_BADGE}
        </span>

        {/* Heading */}
        <h1 className="text-4xl font-black leading-tight tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
          LATIHAN INSTRUKTUR &{" "}
          <span className="text-[#1a4d2e] block sm:inline">LATIHAN PELATIH 2026</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-xs leading-relaxed text-gray-400 sm:text-sm font-medium">
          {HERO_SUBTITLE}
        </p>

        {/* CTAs - Set to flex-row directly with smaller padding on mobile */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mt-2 w-full max-w-md mx-auto">
          <button
            onClick={() => handleScrollTo("daftar")}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-[#1a4d2e] py-3.5 px-3 sm:px-8 text-[10px] sm:text-xs font-bold text-white transition-all duration-200 hover:bg-[#0f2d1a] hover:-translate-y-0.5 cursor-pointer border-0"
          >
            Daftar <span className="hidden xs:inline">Sekarang</span> <ArrowRight className="h-3 w-3 shrink-0" />
          </button>
          <button
            onClick={() => handleScrollTo("alur")}
            className="flex-1 inline-flex items-center justify-center rounded-lg border border-solid border-gray-200 bg-white py-3.5 px-3 sm:px-8 text-[10px] sm:text-xs font-bold text-gray-500 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
          >
            TOR Kegiatan
          </button>
        </div>
      </div>
    </section>
  );
}
