"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  ClipboardList,
  RefreshCw,
  ChevronRight,
  Eye,
} from "lucide-react";
import { RegistrasiListSkeleton } from "./skeleton";

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
  shirt_size: string;
  sleeve_type: string;
  admin_status: "pending" | "lolos" | "ditolak";
  admin_reviewed_at: string | null;
  screening_status: "pending" | "lolos" | "ditolak";
  screening_reviewed_at: string | null;
  created_at: string;
  files?: RegFile[];
};

type Stage = "administrasi" | "screening";

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

export default function RegistrasiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Stage>("administrasi");
  const [data, setData] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/registrasi");
      if (!res.ok) throw new Error("Gagal memuat data.");
      const json = await res.json();
      setData(json.data);
    } catch {
      toast.error("Gagal memuat data peserta.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sekali saat halaman pertama dibuka
  useEffect(() => {
    const initFetch = async () => {
      await fetchData();
    };
    initFetch();
  }, [fetchData]);

  const filteredData =
    activeTab === "administrasi"
      ? data
      : data.filter((r) => r.admin_status === "lolos");

  const adminPending = data.filter((r) => r.admin_status === "pending").length;
  const adminLolos = data.filter((r) => r.admin_status === "lolos").length;
  const adminDitolak = data.filter((r) => r.admin_status === "ditolak").length;
  const screeningPending = data.filter(
    (r) => r.admin_status === "lolos" && r.screening_status === "pending"
  ).length;
  const screeningLolos = data.filter((r) => r.screening_status === "lolos").length;
  const screeningDitolak = data.filter(
    (r) => r.admin_status === "lolos" && r.screening_status === "ditolak"
  ).length;

  if (loading) {
    return <RegistrasiListSkeleton />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Seleksi Peserta
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            LATIN &amp; LATPEL PC IPNU IPPNU Kabupaten Magetan 2026
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Total Daftar
          </span>
          <span className="block text-lg font-bold text-gray-800 mt-1 leading-none">
            {data.length}
          </span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Adm. Pending
          </span>
          <span className="block text-lg font-bold text-amber-600 mt-1 leading-none">
            {adminPending}
          </span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Adm. Lolos
          </span>
          <span className="block text-lg font-bold text-emerald-600 mt-1 leading-none">
            {adminLolos}
          </span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Adm. Ditolak
          </span>
          <span className="block text-lg font-bold text-red-600 mt-1 leading-none">
            {adminDitolak}
          </span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Scr. Lolos
          </span>
          <span className="block text-lg font-bold text-emerald-600 mt-1 leading-none">
            {screeningLolos}
          </span>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">
            Scr. Ditolak
          </span>
          <span className="block text-lg font-bold text-red-600 mt-1 leading-none">
            {screeningDitolak}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex rounded-lg bg-gray-100 p-0.5 w-fit">
        <button
          onClick={() => setActiveTab("administrasi")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "administrasi"
              ? "bg-white text-gray-800 shadow-xs"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Seleksi Administrasi
          {adminPending > 0 && (
            <span className="inline-flex h-4 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700">
              {adminPending}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("screening")}
          className={`inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "screening"
              ? "bg-white text-gray-800 shadow-xs"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Seleksi Screening
          {screeningPending > 0 && (
            <span className="inline-flex h-4 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[9px] font-bold text-blue-700">
              {screeningPending}
            </span>
          )}
        </button>
      </div>

      {activeTab === "screening" && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-xs text-blue-700">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          Menampilkan peserta yang lolos <strong className="mx-0.5">Seleksi Administrasi</strong>. Total: <strong className="ml-0.5">{filteredData.length} peserta</strong>.
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Users className="h-8 w-8 mb-2" />
            <p className="text-xs">Belum ada data peserta.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {["#", "Nama Peserta", "Gender", "Delegasi", "Kaos", "Tgl. Daftar",
                    activeTab === "administrasi" ? "Status Adm." : "Status Scr.",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap last:text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((reg, idx) => {
                  const currentStatus =
                    activeTab === "administrasi"
                      ? reg.admin_status
                      : reg.screening_status;

                  return (
                    <tr key={reg.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {reg.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{reg.gender}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                        {reg.delegation}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {reg.shirt_size} / {reg.sleeve_type}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(reg.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_BADGE[currentStatus]}`}
                        >
                          {STATUS_LABEL[currentStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => router.push(`/registrasi/${reg.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
