"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { Users, Loader2, Check, X, BadgeInfo } from "lucide-react";

interface Registrant {
  id: string;
  name: string;
  gender: string;
  delegation: string;
  adminStatus: string; // 'pending', 'lolos', 'ditolak'
  screeningStatus: string; // 'pending', 'lolos', 'ditolak'
  photoKey: string | null;
}

export default function PendaftarPage() {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/public/registrants");
        if (res.ok) {
          const json = await res.json();
          setRegistrants(json.registrants);
        }
      } catch (err) {
        console.error("Gagal memuat data pendaftar:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8fafc] pt-28 pb-20 px-6 sm:px-8">
        {/* Background Mesh */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1a4d2e]/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#52b788]/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e] mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 md:text-3xl leading-tight">
              DATA CALON PESERTA
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              LATIN &amp; LATPEL PC IPNU IPPNU KABUPATEN MAGETAN 2026
            </p>
            <p className="text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
              Berikut adalah daftar calon peserta yang telah mengirimkan data
              registrasi. Status kelolosan diperbarui secara berkala oleh
              panitia.
            </p>
          </div>

          {/* Table / Grid Container */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#1a4d2e]" />
                <span className="text-xs text-gray-400 font-semibold">
                  Memuat daftar pendaftar...
                </span>
              </div>
            ) : registrants.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-2">
                  <BadgeInfo className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-700">
                  Tidak ada data pendaftar
                </h4>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Belum ada calon peserta yang terdaftar di database saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs text-gray-500">
                  <thead className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-12 text-center">
                        No
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Foto &amp; Nama
                      </th>
                      <th scope="col" className="px-6 py-4">
                        Delegasi (PAC)
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Administrasi
                      </th>
                      <th scope="col" className="px-6 py-4 text-center">
                        Screening
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold">
                    {registrants.map((r, index) => (
                      <tr
                        key={r.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-gray-400 font-bold">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-gray-200">
                            {r.photoKey ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/files/${r.photoKey}`}
                                alt={r.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-gray-400">
                                {r.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="block font-bold text-gray-800 text-xs">
                              {r.name}
                            </span>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">
                              {r.gender === "L" || r.gender === "Laki-laki"
                                ? "Laki-laki"
                                : "Perempuan"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-semibold">
                          {r.delegation}
                        </td>
                        {/* Status Administrasi */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            {r.adminStatus === "lolos" && (
                              <div
                                className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
                                title="Lolos Administrasi"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {r.adminStatus === "ditolak" && (
                              <div
                                className="flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-600 border border-red-100"
                                title="Gagal Administrasi"
                              >
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {r.adminStatus === "pending" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider font-bold">
                                Proses
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Status Screening */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center">
                            {r.screeningStatus === "lolos" && (
                              <div
                                className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
                                title="Lolos Screening"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {r.screeningStatus === "ditolak" && (
                              <div
                                className="flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-600 border border-red-100"
                                title="Gagal Screening"
                              >
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )}
                            {r.screeningStatus === "pending" && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider font-bold">
                                Proses
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
