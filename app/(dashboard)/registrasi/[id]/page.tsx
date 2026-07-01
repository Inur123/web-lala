"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  ChevronLeft,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RegistrasiDetailSkeleton } from "./skeleton";

type RegFile = {
  field_key: string;
  file_name: string;
  r2_key: string;
  r2_url: string | null;
};

type Registrant = {
  id: string;
  name: string;
  gender: string;
  delegation: string;
  reason: string;
  shirt_size: string;
  sleeve_type: string;
  admin_status: "pending" | "lolos" | "ditolak";
  admin_reviewed_at: string | null;
  screening_status: "pending" | "lolos" | "ditolak";
  screening_reviewed_at: string | null;
  created_at: string;
  files?: RegFile[];
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  lolos: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  ditolak: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  lolos: "Lolos",
  ditolak: "Ditolak",
};

const FILE_FIELD_LABELS: Record<string, string> = {
  sertifikatMakesta: "Sertifikat MAKESTA",
  sertifikatLakmud: "Sertifikat LAKMUD",
  rekomendasi: "Surat Rekomendasi PAC / PC",
  essay: "Essay Karya Tulis",
  ktpKta: "Scan KTP / KTA",
  formulir: "Scan Formulir Pendaftaran",
  paktaIntegritas: "Pakta Integritas Bermaterai",
  fotoFormal: "Foto Formal Jas (Merah)",
  buktiBayar: "Bukti Transfer Kontribusi",
};

export default function RegistrasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [registrant, setRegistrant] = useState<Registrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/registrasi");
      if (!res.ok) throw new Error("Gagal mengambil data.");
      const json = await res.json();
      const found = json.data.find((item: Registrant) => item.id === id);
      if (!found) throw new Error("Peserta tidak ditemukan.");
      setRegistrant(found);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memuat detail.");
      router.push("/registrasi");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdate = async (
    stage: "admin" | "screening",
    status: "lolos" | "ditolak",
  ) => {
    setUpdating(`${stage}-${status}`);
    try {
      const res = await fetch(`/api/admin/registrasi/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui status.");

      toast.success(
        status === "lolos"
          ? `Peserta diterima di tahap ${stage === "admin" ? "Administrasi" : "Screening"}.`
          : `Peserta ditolak di tahap ${stage === "admin" ? "Administrasi" : "Screening"}.`,
      );
      await fetchDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <RegistrasiDetailSkeleton />;
  }

  if (!registrant) return null;

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Back & Header (Image 2 style) */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/registrasi")}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-700 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:bg-gray-50 hover:text-gray-900 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
          aria-label="Kembali"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">
            Detail Profil &amp; Berkas
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Detail pendaftaran peserta LATIN &amp; LATPEL
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Data Diri & Status */}
        <div className="md:col-span-2 space-y-6">
          {/* Profil */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-[9px] border-b border-gray-50 pb-1">
              Data Diri &amp; Profil
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Nama Lengkap
                </span>
                <span className="font-semibold text-gray-800">
                  {registrant.name}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Jenis Kelamin
                </span>
                <span className="font-semibold text-gray-800">
                  {registrant.gender}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Asal Delegasi
                </span>
                <span className="font-semibold text-gray-800">
                  {registrant.delegation}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">
                  Kaos &amp; Lengan
                </span>
                <span className="font-semibold text-gray-800">
                  {registrant.shirt_size} ({registrant.sleeve_type})
                </span>
              </div>
            </div>
            <div className="pt-2 text-xs">
              <span className="text-gray-400 block mb-0.5 font-medium">
                Alasan Pelatihan
              </span>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed font-medium">
                {registrant.reason}
              </p>
            </div>
          </div>

          {/* Dokumen */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-[9px] border-b border-gray-50 pb-1">
              Unggah Berkas &amp; Dokumen R2
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(FILE_FIELD_LABELS).map(([fieldKey, label]) => {
                const fileObj = registrant.files?.find(
                  (f) => f.field_key === fieldKey,
                );
                const r2DownloadUrl = fileObj?.r2_url || (fileObj?.r2_key ? `/api/files/${fileObj.r2_key}` : "#");

                return (
                  <div
                    key={fieldKey}
                    className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-gray-50/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="block font-semibold text-gray-700 truncate max-w-[140px]">
                          {label}
                        </span>
                        <span className="block text-[9px] text-gray-400 truncate max-w-[140px]">
                          {fileObj ? fileObj.file_name : "Belum diunggah"}
                        </span>
                      </div>
                    </div>
                    {fileObj ? (
                      <a
                        href={r2DownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer border border-emerald-200 bg-emerald-50 rounded-md px-2 py-1 transition-colors"
                      >
                        Buka <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-md px-2 py-1 select-none">
                        Kosong
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Status & Decision Panel */}
        <div className="space-y-6">
          {/* Status Display */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-[9px] border-b border-gray-50 pb-1">
              Status Seleksi
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500 font-medium">Administrasi</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${STATUS_BADGE[registrant.admin_status]}`}
                >
                  {STATUS_LABEL[registrant.admin_status]}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-gray-50 pt-2">
                <span className="text-gray-500 font-medium">Screening</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${STATUS_BADGE[registrant.screening_status]}`}
                >
                  {STATUS_LABEL[registrant.screening_status]}
                </span>
              </div>
            </div>
          </div>

          {/* Decision Panel */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-[9px] border-b border-gray-50 pb-1">
              Panel Keputusan
            </h3>

            {/* Administrasi Decision */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                Keputusan Administrasi
              </span>
              <div className="flex gap-2">
                {/* Terima Administrasi Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        disabled={registrant.admin_status === "lolos" || updating !== null}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white py-2 text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    }
                  >
                    {updating === "admin-lolos" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Terima
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Terima Administrasi Peserta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin meloloskan seleksi administrasi untuk peserta <strong>{registrant.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpdate("admin", "lolos")} className="bg-emerald-700 hover:bg-emerald-800 text-white border-0 cursor-pointer">
                        Ya, Loloskan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Tolak Administrasi Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        disabled={registrant.admin_status === "ditolak" || updating !== null}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    }
                  >
                    {updating === "admin-ditolak" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Tolak
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tolak Administrasi Peserta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menolak berkas administrasi peserta <strong>{registrant.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpdate("admin", "ditolak")} className="bg-red-600 hover:bg-red-700 text-white border-0 cursor-pointer">
                        Ya, Tolak
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Screening Decision */}
            <div className="space-y-2.5 border-t border-gray-50 pt-4">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider">
                Keputusan Screening
              </span>
              <div className="flex gap-2">
                {/* Terima Screening Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        disabled={
                          registrant.admin_status !== "lolos" ||
                          registrant.screening_status === "lolos" ||
                          updating !== null
                        }
                        className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white py-2 text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    }
                  >
                    {updating === "screening-lolos" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Terima
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Loloskan Screening Peserta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin peserta <strong>{registrant.name}</strong> lolos tahap wawancara/screening?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpdate("screening", "lolos")} className="bg-emerald-700 hover:bg-emerald-800 text-white border-0 cursor-pointer">
                        Ya, Loloskan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Tolak Screening Dialog */}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <button
                        disabled={
                          registrant.admin_status !== "lolos" ||
                          registrant.screening_status === "ditolak" ||
                          updating !== null
                        }
                        className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    }
                  >
                    {updating === "screening-ditolak" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Tolak
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tolak Screening Peserta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menolak peserta <strong>{registrant.name}</strong> pada tahap screening?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleUpdate("screening", "ditolak")} className="bg-red-600 hover:bg-red-700 text-white border-0 cursor-pointer">
                        Ya, Tolak
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              {registrant.admin_status !== "lolos" && (
                <p className="text-[9px] text-red-500 font-medium leading-relaxed mt-1">
                  * Screening hanya aktif jika status Administrasi peserta Lolos.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
