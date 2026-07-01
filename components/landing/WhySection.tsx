"use client";

import { WHY_STATS } from "@/constants/landing";
import { Info, BookOpen, UserCheck, Users } from "lucide-react";

export default function WhySection() {
  const getStatIcon = (id: string) => {
    switch (id) {
      case "program":
        return <BookOpen className="h-5 w-5 text-[#1a4d2e]" />;
      case "focus":
        return <UserCheck className="h-5 w-5 text-[#1a4d2e]" />;
      case "organizer":
        return <Users className="h-5 w-5 text-[#1a4d2e]" />;
      default:
        return null;
    }
  };

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
      id="tentang" 
      className="bg-white px-6 py-20 sm:px-8 lg:px-12"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "45px 45px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left card with top accent bar */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a4d2e]" />
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[#1a4d2e] border border-gray-100">
                <Info className="h-4 w-4" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                DASAR PEMIKIRAN
              </p>
              <h3 className="mt-2 text-sm font-black text-gray-900 leading-snug">
                Episentrum Kaderisasi Kabupaten Magetan
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-gray-400 font-medium">
                Menjawab stagnasi jumlah pelatih dan instruktur dibandingkan kuantitas pengkaderan formal tingkat PAC.
              </p>
              <button
                onClick={() => handleScrollTo("alur")}
                className="mt-6 inline-flex items-center text-xs font-semibold text-gray-700 hover:text-[#1a4d2e] cursor-pointer border-0 bg-transparent"
              >
                Selengkapnya →
              </button>
            </div>
          </div>

          {/* Right text and stats */}
          <div className="lg:col-span-8 flex flex-col justify-center lg:pl-10">
            <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">
              TENTANG KEGIATAN
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
              Mengapa <span className="text-[#1a4d2e]">LATIN &amp; LATPEL</span> Sangat Penting?
            </h2>
            <p className="mt-4 text-xs leading-relaxed text-gray-400 font-medium">
              Kaderisasi memegang peran sentral dalam keberlanjutan sebuah organisasi. Mengacu pada kondisi wilayah Kabupaten Magetan yang memiliki 18 PAC, 12 Ranting, dan 5 PKPP, terdapat kesenjangan di mana jumlah pelatih dan instruktur aktif sangat terbatas (hanya terdiri dari 4 pelatih dan 3 instruktur). LATIN-LATPEL ini hadir sebagai program episentrum untuk mencetak instruktur pelatih baru yang terampil, militan, dan berintegritas.
            </p>

            {/* Stats list layout */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {WHY_STATS.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                    {getStatIcon(stat.id)}
                  </div>
                  <p className="mt-4 text-[9px] font-black uppercase tracking-wider text-gray-400">
                    {stat.category}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-gray-800 leading-snug">
                    {stat.title}
                  </p>
                  <p className="mt-4 text-sm font-black text-[#1a4d2e] uppercase tracking-wider">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
