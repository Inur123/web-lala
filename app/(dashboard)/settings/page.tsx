"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings, Power, Loader2, Calendar } from "lucide-react";

export default function SettingsPage() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch current setting status
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Gagal mengambil pengaturan");
        const json = await res.json();
        setIsOpen(json.isOpen);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Gagal memuat pengaturan pendaftaran.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const targetState = !isOpen;
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: targetState }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      setIsOpen(targetState);
      toast.success(
        targetState
          ? "Pendaftaran berhasil dibuka untuk umum."
          : "Pendaftaran berhasil ditutup untuk umum.",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-xl animate-pulse">
        <div className="h-5 w-1/3 bg-gray-200/60 rounded" />
        <div className="h-32 w-full bg-gray-200/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 leading-tight flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#1a4d2e]" /> Pengaturan Portal
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Atur status aktif formulir pendaftaran LATIN &amp; LATPEL Magetan
          2026.
        </p>
      </div>

      {/* Settings Card */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" /> Status Pendaftaran
              Umum
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Jika ditutup, calon peserta tidak dapat mengakses formulir
              registrasi dan akan diarahkan ke halaman pengumuman penutupan.
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
              isOpen ? "bg-emerald-700" : "bg-gray-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isOpen ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Live Status indicator */}
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold border ${
            isOpen
              ? "bg-emerald-50/50 border-emerald-100 text-emerald-700"
              : "bg-red-50/50 border-red-100 text-red-600"
          }`}
        >
          <Power className="h-4 w-4 shrink-0" />
          <span>
            {isOpen
              ? "Pendaftaran Sedang Dibuka. Calon peserta dapat mengirimkan data pendaftaran."
              : "Pendaftaran Sedang Ditutup. Pengunjung umum tidak bisa mengakses form registrasi."}
          </span>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin ml-auto" />}
        </div>
      </div>
    </div>
  );
}
