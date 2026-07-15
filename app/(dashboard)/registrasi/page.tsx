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
  FileDown,
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
    (r) => r.admin_status === "lolos" && r.screening_status === "pending",
  ).length;
  const screeningLolos = data.filter(
    (r) => r.screening_status === "lolos",
  ).length;
  const screeningDitolak = data.filter(
    (r) => r.admin_status === "lolos" && r.screening_status === "ditolak",
  ).length;

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error("Tidak ada data untuk diexport.");
      return;
    }

    try {
      // Helper untuk memetakan baris pendaftar
      const mapRegistrantRow = (item: Registrant, index: number) => ({
        No: index + 1,
        "Nama Peserta": item.name,
        "Jenis Kelamin":
          item.gender === "l" || item.gender === "Laki-laki"
            ? "Laki-laki"
            : "Perempuan",
        "Delegation/Utusan": item.delegation,
        "Ukuran Kaos": item.shirt_size,
        "Tipe Lengan": item.sleeve_type === "panjang" ? "Panjang" : "Pendek",
        "Status Administrasi":
          STATUS_LABEL[item.admin_status] || item.admin_status,
        "Status Screening":
          STATUS_LABEL[item.screening_status] || item.screening_status,
        "Tanggal Mendaftar": new Date(item.created_at).toLocaleDateString(
          "id-ID",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          },
        ),
      });

      // Filter grup data untuk masing-masing worksheet
      const allPendaftar = data;
      const lolosAdministrasi = data.filter((r) => r.admin_status === "lolos");
      const lolosScreening = data.filter((r) => r.screening_status === "lolos");

      // Panggil library xlsx-js-style secara dinamis
      import("xlsx-js-style").then((xlsx) => {
        const workbook = xlsx.utils.book_new();

        // Helper untuk membuat sheet beserta tabel rincian ringkasan (rekapitulasi) di bawahnya
        const createSheetWithSummary = (
          dataset: Registrant[],
          sheetName: string,
        ) => {
          const rows = dataset.map((item, index) =>
            mapRegistrantRow(item, index),
          );

          // Hitung Rincian Ringkasan
          const totalLaki = dataset.filter(
            (r) => r.gender === "l" || r.gender === "Laki-laki",
          ).length;
          const totalPerempuan = dataset.filter(
            (r) => r.gender === "p" || r.gender === "Perempuan",
          ).length;

          // Rincian ukuran kaos dan tipe lengan
          const sizeMap: Record<string, number> = {};
          dataset.forEach((r) => {
            const sizeKey = `${r.shirt_size.toUpperCase()} ${r.sleeve_type === "panjang" ? "Panjang" : "Pendek"}`;
            sizeMap[sizeKey] = (sizeMap[sizeKey] || 0) + 1;
          });

          // Buat baris kosong pemisah yang berjarak longgar (4 baris kosong)
          const finalRows: Record<string, string | number>[] = [...rows];
          finalRows.push({}); // Baris Kosong 1
          finalRows.push({}); // Baris Kosong 2
          finalRows.push({}); // Baris Kosong 3
          finalRows.push({}); // Baris Kosong 4
          finalRows.push({
            "Nama Peserta": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          });
          finalRows.push({ "Nama Peserta": "   RINGKASAN REKAPITULASI DATA" }); // Sub Header Utama
          finalRows.push({
            "Nama Peserta": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          });
          finalRows.push({
            "Nama Peserta": "• Jumlah Laki-laki",
            "Jenis Kelamin": totalLaki,
          });
          finalRows.push({
            "Nama Peserta": "• Jumlah Perempuan",
            "Jenis Kelamin": totalPerempuan,
          });
          finalRows.push({
            "Nama Peserta": "• Total Peserta",
            "Jenis Kelamin": dataset.length,
          });

          // HANYA untuk sheet "Semua Pendaftar", tambahkan rincian status seleksi
          if (sheetName === "Semua Pendaftar") {
            const statusAdminLolos = dataset.filter(
              (r) => r.admin_status === "lolos",
            ).length;
            const statusAdminDitolak = dataset.filter(
              (r) => r.admin_status === "ditolak",
            ).length;
            const statusAdminPending = dataset.filter(
              (r) => r.admin_status === "pending",
            ).length;

            const statusScrLolos = dataset.filter(
              (r) => r.screening_status === "lolos",
            ).length;
            const statusScrDitolak = dataset.filter(
              (r) => r.screening_status === "ditolak",
            ).length;
            const statusScrPending = dataset.filter(
              (r) =>
                r.admin_status === "lolos" && r.screening_status === "pending",
            ).length;

            finalRows.push({}); // Spasi pemisah status
            finalRows.push({}); // Spasi pemisah status 2
            finalRows.push({ "Nama Peserta": "■ STATUS SELEKSI ADMINISTRASI" });
            finalRows.push({
              "Nama Peserta": "  - Lolos Administrasi",
              "Jenis Kelamin": statusAdminLolos,
            });
            finalRows.push({
              "Nama Peserta": "  - Ditolak Administrasi",
              "Jenis Kelamin": statusAdminDitolak,
            });
            finalRows.push({
              "Nama Peserta": "  - Menunggu Review",
              "Jenis Kelamin": statusAdminPending,
            });

            finalRows.push({}); // Spasi pemisah status 3
            finalRows.push({}); // Spasi pemisah status 4
            finalRows.push({ "Nama Peserta": "■ STATUS SELEKSI SCREENING" });
            finalRows.push({
              "Nama Peserta": "  - Lolos Screening",
              "Jenis Kelamin": statusScrLolos,
            });
            finalRows.push({
              "Nama Peserta": "  - Ditolak Screening",
              "Jenis Kelamin": statusScrDitolak,
            });
            finalRows.push({
              "Nama Peserta": "  - Menunggu Screening (Dari Lolos Adm)",
              "Jenis Kelamin": statusScrPending,
            });
          }

          finalRows.push({}); // Baris Kosong Pemisah Kaos 1
          finalRows.push({}); // Baris Kosong Pemisah Kaos 2
          finalRows.push({}); // Baris Kosong Pemisah Kaos 3
          finalRows.push({
            "Nama Peserta": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          });
          finalRows.push({
            "Nama Peserta": "   RINCIAN ATRIBUT KAOS",
            "Jenis Kelamin": "JUMLAH",
          });
          finalRows.push({
            "Nama Peserta": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          });

          // Urutkan rincian kaos agar rapi
          Object.keys(sizeMap)
            .sort()
            .forEach((sizeName) => {
              finalRows.push({
                "Nama Peserta": `  - Kaos ${sizeName}`,
                "Jenis Kelamin": sizeMap[sizeName],
              });
            });

          finalRows.push({
            "Nama Peserta": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          });

          const worksheet = xlsx.utils.json_to_sheet(finalRows);

          // === Hias Desain Excel Menggunakan xlsx-js-style ===
          const range = xlsx.utils.decode_range(worksheet["!ref"] || "A1:A1");
          const totalRowsInDataset = rows.length;

          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cell_ref = xlsx.utils.encode_cell({ r: R, c: C });
              if (!worksheet[cell_ref]) continue;

              // Ambil isi & atur default style
              const cell = worksheet[cell_ref];
              cell.s = {
                font: { name: "Arial", size: 10 },
                alignment: { vertical: "center" },
              };

              // 1. Desain Baris Header (Paling Atas)
              if (R === 0) {
                cell.s = {
                  fill: { fgColor: { rgb: "1A4D2E" } }, // Hijau tua latin-latpel brand
                  font: { name: "Arial", size: 11, bold: true, color: { rgb: "FFFFFF" } },
                  alignment: { horizontal: "center", vertical: "center" },
                  border: {
                    bottom: { style: "medium", color: { rgb: "123620" } },
                  },
                };
              } 
              // 2. Desain Baris Isi Data Tabel
              else if (R <= totalRowsInDataset) {
                // Background belang-belang agar readable (Zebra striping)
                const isEven = R % 2 === 0;
                cell.s.fill = { fgColor: { rgb: isEven ? "F7F9F6" : "FFFFFF" } };

                // Tambahkan border tipis di sekeliling cell data
                cell.s.border = {
                  top: { style: "thin", color: { rgb: "E5E7EB" } },
                  bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                  left: { style: "thin", color: { rgb: "E5E7EB" } },
                  right: { style: "thin", color: { rgb: "E5E7EB" } },
                };

                // Alignment khusus berdasarkan jenis data
                if (C === 0) {
                  // Kolom No
                  cell.s.alignment.horizontal = "center";
                } else if (C === 2 || C === 4 || C === 5 || C === 6 || C === 7) {
                  // Kolom Jenis Kelamin, Ukuran Kaos, Tipe Lengan, Status
                  cell.s.alignment.horizontal = "center";
                } else if (C === 8) {
                  // Kolom Tanggal Mendaftar
                  cell.s.alignment.horizontal = "center";
                }
              }
              // 3. Desain Blok Ringkasan/Rekapitulasi (Di bawah tabel utama)
              else {
                const cellValue = String(cell.v || "");
                
                // Jika itu baris sub-header rekapitulasi (teks tebal/bold)
                if (
                  cellValue.includes("RINGKASAN") || 
                  cellValue.includes("STATUS SELEKSI") || 
                  cellValue.includes("RINCIAN ATRIBUT KAOS")
                ) {
                  cell.s.font.bold = true;
                  cell.s.font.size = 11;
                  cell.s.font.color = { rgb: "1A4D2E" }; // Warna hijau brand
                }
                
                // Judul rekap tebal kiri, angka/value rata tengah
                if (C === 0) {
                  // Merapikan list item
                  if (cellValue.startsWith("•") || cellValue.startsWith("  -") || cellValue.startsWith("■")) {
                    cell.s.font.bold = cellValue.startsWith("■");
                  }
                } else if (C === 2) {
                  // Kolom isi Jumlah rekap
                  cell.s.font.bold = true;
                  cell.s.alignment.horizontal = "center";
                }
              }
            }
          }

          // Auto-fit kolom agar tulisan tidak kepotong (dengan minimum lebar kolom agar lega)
          const maxLen = finalRows.reduce<Record<string, number>>(
            (acc, row) => {
              Object.keys(row).forEach((key) => {
                const val = String(row[key] || "");
                const currentMax = acc[key] || 0;
                acc[key] = Math.max(currentMax, val.length + 4);
              });
              return acc;
            },
            {},
          );

          worksheet["!cols"] = Object.keys(maxLen).map((key) => {
            let width = maxLen[key];
            
            // Berikan minimum lebar agar kolom-kolom ini tidak rapat dan sesak
            if (key === "Ukuran Kaos") width = Math.max(width, 18);
            if (key === "Tipe Lengan") width = Math.max(width, 18);
            if (key === "Status Administrasi") width = Math.max(width, 24);
            if (key === "Status Screening") width = Math.max(width, 22);
            if (key === "Tanggal Mendaftar") width = Math.max(width, 24);
            if (key === "Jenis Kelamin") width = Math.max(width, 18);

            return { wch: Math.min(width, 50) };
          });

          return worksheet;
        };

        // Buat dan masukkan ketiga sheet ke dalam 1 file Excel
        const sheetAll = createSheetWithSummary(
          allPendaftar,
          "Semua Pendaftar",
        );
        const sheetAdmin = createSheetWithSummary(
          lolosAdministrasi,
          "Lolos Administrasi",
        );
        const sheetScreening = createSheetWithSummary(
          lolosScreening,
          "Lolos Screening",
        );

        xlsx.utils.book_append_sheet(workbook, sheetAll, "Semua Pendaftar");
        xlsx.utils.book_append_sheet(
          workbook,
          sheetAdmin,
          "Lolos Administrasi",
        );
        xlsx.utils.book_append_sheet(
          workbook,
          sheetScreening,
          "Lolos Screening",
        );

        xlsx.writeFile(
          workbook,
          `Data_Seleksi_Latin_Latpel_${new Date().getFullYear()}.xlsx`,
        );
        toast.success("Berhasil mengexport data Excel.");
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengexport data ke Excel.");
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#1a4d2e] bg-[#1a4d2e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1a4d2e]/90 transition-colors shadow-sm cursor-pointer"
          >
            <FileDown className="h-3.5 w-3.5" />
            Export Excel
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
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
          Menampilkan peserta yang lolos{" "}
          <strong className="mx-0.5">Seleksi Administrasi</strong>. Total:{" "}
          <strong className="ml-0.5">{filteredData.length} peserta</strong>.
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
                  {[
                    "#",
                    "Nama Peserta",
                    "Jenis Kelamin",
                    "Delegasi",
                    "Kaos",
                    "Tgl. Daftar",
                    activeTab === "administrasi"
                      ? "Status Adm."
                      : "Status Scr.",
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
                    <tr
                      key={reg.id}
                      className="hover:bg-gray-50/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const fotoObj = reg.files?.find((f) => f.field_key === "fotoFormal");
                            const fotoUrl = fotoObj?.r2_url || (fotoObj?.r2_key ? `/api/files/${fotoObj.r2_key}` : null);
                            return fotoUrl ? (
                              <img 
                                src={fotoUrl} 
                                alt="" 
                                className="h-8 w-8 rounded-full aspect-square object-cover border border-gray-100 shrink-0 bg-gray-50 animate-fade-in"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0 uppercase select-none">
                                {reg.name.substring(0, 2)}
                              </div>
                            );
                          })()}
                          <span>{reg.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {reg.gender}
                      </td>
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
