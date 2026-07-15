"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Check,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    delegation: "",
    reason: "",
    shirtSize: "",
    sleeveType: "",
    whatsapp: "",
    birthDate: "",
    email: "",
  });

  const [date, setDate] = useState<Date | undefined>(undefined);

  // Sync date selection with birthDate string format (YYYY-MM-DD)
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        birthDate: `${year}-${month}-${day}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, birthDate: "" }));
    }
  };

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    sertifikatMakesta: null,
    sertifikatLakmud: null,
    ktpKta: null,
    rekomendasi: null,
    paktaIntegritas: null,
    essay: null,
    formulir: null,
    fotoFormal: null,
    buktiBayar: null,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [isOpenSetting, setIsOpenSetting] = useState<boolean>(true);
  const [checkingSetting, setCheckingSetting] = useState<boolean>(true);

  useEffect(() => {
    async function checkRegStatus() {
      try {
        const res = await fetch("/api/public/settings", {
          cache: "no-store",
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache",
          },
        });
        if (res.ok) {
          const json = await res.json();
          setIsOpenSetting(json.isOpen);
        }
      } catch (err) {
        console.error("Gagal memeriksa status pendaftaran:", err);
      } finally {
        setCheckingSetting(false);
      }
    }
    checkRegStatus();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-resize textarea height
    if (e.target.tagName.toLowerCase() === "textarea" && name === "reason") {
      const textarea = e.target as HTMLTextAreaElement;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileName = file.name.toLowerCase();

      // Validasi khusus PDF saja (Surat Rekomendasi, Essay, Scan Formulir)
      if (["rekomendasi", "essay", "formulir"].includes(key)) {
        if (!fileName.endsWith(".pdf")) {
          toast.error(`Berkas wajib berupa format PDF saja.`);
          e.target.value = "";
          return;
        }
      }

      // Validasi khusus Gambar saja (Foto Formal)
      if (key === "fotoFormal") {
        if (
          !fileName.endsWith(".png") &&
          !fileName.endsWith(".jpg") &&
          !fileName.endsWith(".jpeg")
        ) {
          toast.error(
            `Foto Formal wajib berupa gambar (PNG / JPG / JPEG) saja.`,
          );
          e.target.value = "";
          return;
        }
      }

      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build multipart/form-data
      const fd = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });

      // Append file fields
      for (const [key, file] of Object.entries(files)) {
        if (!file) {
          toast.error(`Berkas ${key} wajib diunggah.`);
          setLoading(false);
          return;
        }
        fd.append(key, file);
      }

      const res = await fetch("/api/register", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan. Silakan coba lagi.");
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetting) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a4d2e]" />
        <span className="text-xs text-gray-400 font-semibold mt-2">
          Memuat...
        </span>
      </div>
    );
  }

  if (!isOpenSetting) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-6">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">
            Pendaftaran Ditutup
          </h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed font-semibold">
            Mohon maaf, portal pendaftaran LATIN &amp; LATPEL PC IPNU IPPNU
            Kabupaten Magetan 2026 saat ini sedang ditutup atau telah berakhir.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 py-3 text-xs font-bold text-white hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-0"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1a4d2e]" />
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-black text-gray-900 mb-2">
            Registrasi Terkirim
          </h2>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed font-semibold">
            Data Anda berhasil disimpan. Panitia akan segera meninjau kesesuaian
            berkas administrasi dan kelayakan berkas Anda. Silakan bergabung ke
            grup WhatsApp koordinasi calon peserta melalui tombol di bawah ini:
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="https://laci.pelajarnumagetan.or.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-0 decoration-none"
            >
              Gabung Grup WhatsApp Koordinasi
            </a>
            <button
              onClick={() => router.push("/pendaftar")}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all hover:shadow-sm cursor-pointer border-0"
            >
              Cek Status Pendaftaran Anda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6 sm:px-8">
      {/* Background Mesh */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1a4d2e]/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#52b788]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Navigation back */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/80 bg-white px-4.5 py-2 text-xs font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-[#1a4d2e] cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-gray-400" /> Kembali
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <ShieldCheck className="h-4 w-4 text-[#1a4d2e]" /> PORTAL REGISTRASI
          </div>
        </div>

        {/* Title Header Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1a4d2e]" />
          <h1 className="text-xl font-black text-gray-900 leading-tight md:text-2xl">
            FORMULIR REGISTRASI PENDAFTARAN
          </h1>
          <p className="text-xs text-[#1a4d2e] font-black uppercase tracking-wider mt-1.5">
            LATIN &amp; LATPEL PC IPNU IPPNU KABUPATEN MAGETAN 2026
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed font-semibold mt-4 border-t border-gray-50 pt-4">
            Silakan lengkapi data profil pribadi, unggah seluruh bukti berkas
            administrasi dan kontribusi, serta tentukan ukuran merchandise kaos
            Anda di bawah ini.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Profil Peserta */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1a4d2e] border-b border-gray-50 pb-2">
              Data Diri &amp; Profil
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white cursor-pointer"
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Asal Delegasi */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Asal Delegasi / Pimpinan Anak Cabang (PAC){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="delegation"
                  required
                  value={formData.delegation}
                  onChange={handleInputChange}
                  placeholder="Contoh: PAC IPNU Magetan"
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold"
                />
              </div>

              {/* No WhatsApp */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  No. WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold"
                />
              </div>

              {/* Tanggal Lahir (Shadcn UI Calendar) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <div className="relative h-[42px] w-full">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <button
                          type="button"
                          className={cn(
                            "w-full text-left text-xs border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all font-semibold bg-white flex items-center justify-between cursor-pointer absolute inset-0 h-full",
                            !date && "text-gray-400",
                          )}
                        >
                          {date ? (
                            format(date, "dd MMMM yyyy", { locale: idLocale })
                          ) : (
                            <span>Pilih Tanggal Lahir</span>
                          )}
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                        </button>
                      }
                    />
                    <PopoverContent
                      className="w-auto p-0 bg-white shadow-xl border border-gray-100 rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        captionLayout="dropdown"
                        startMonth={new Date("1970-01")}
                        endMonth={new Date()}
                        className="rounded-xl border border-gray-100 bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Alamat Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Contoh: pelajar@gmail.com"
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold"
                />
              </div>

              {/* Alasan */}
              <div className="space-y-2 md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Alasan Mengikuti LATIN &amp; LATPEL{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="reason"
                    required
                    rows={3}
                    maxLength={1000}
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Tuliskan motivasi dan komitmen Anda mengikuti pelatihan ini..."
                    className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 pb-8 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold resize-none overflow-hidden min-h-[80px]"
                  />
                  <div className="absolute bottom-2 right-4 text-[10px] font-bold text-gray-400 select-none bg-white px-1">
                    {formData.reason.length}/1000
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Upload Berkas Persyaratan */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1a4d2e] border-b border-gray-50 pb-2">
              Unggah Berkas &amp; Dokumen
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "sertifikatMakesta",
                  label: "Sertifikat MAKESTA",
                  format: "PDF / PNG / JPG (Max. 10MB)",
                  accept: ".pdf,.png,.jpg,.jpeg",
                },
                {
                  id: "sertifikatLakmud",
                  label: "Sertifikat LAKMUD",
                  format: "PDF / PNG / JPG (Max. 10MB)",
                  accept: ".pdf,.png,.jpg,.jpeg",
                },
                {
                  id: "ktpKta",
                  label: "KTP / KTA",
                  format: "PDF / PNG / JPG (Max. 10MB)",
                  accept: ".pdf,.png,.jpg,.jpeg",
                },
                {
                  id: "rekomendasi",
                  label: "Surat Rekomendasi PAC / PC",
                  format: "PDF saja (Max. 10MB)",
                  accept: ".pdf",
                },
                {
                  id: "paktaIntegritas",
                  label: "Pakta Integritas Bermaterai",
                  format: "PDF / PNG / JPG (Max. 10MB)",
                  accept: ".pdf,.png,.jpg,.jpeg",
                  downloadTemplate: "https://laci.pelajarnumagetan.or.id/",
                },
                {
                  id: "essay",
                  label: "Essay Karya Tulis",
                  format: "PDF saja (Max. 10MB)",
                  accept: ".pdf",
                },
                {
                  id: "formulir",
                  label: "Formulir Pendaftaran",
                  format: "PDF saja (Max. 10MB)",
                  accept: ".pdf",
                  downloadTemplate: "https://laci.pelajarnumagetan.or.id/",
                },
                {
                  id: "fotoFormal",
                  label: "Foto Formal Jas (Merah)",
                  format: "PNG / JPG (Max. 10MB)",
                  accept: ".png,.jpg,.jpeg",
                  downloadTemplate: "https://laci.pelajarnumagetan.or.id/",
                },
                {
                  id: "buktiBayar",
                  label: "Bukti Transfer Kontribusi",
                  format: "PDF / PNG / JPG (Max. 10MB)",
                  accept: ".pdf,.png,.jpg,.jpeg",
                },
              ].map((fileField) => (
                <div
                  key={fileField.id}
                  className={`rounded-xl border p-5 space-y-3 relative transition-colors ${
                    files[fileField.id]
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-gray-100 bg-gray-50/50"
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      {fileField.label} <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      {fileField.format}
                    </p>
                    {fileField.downloadTemplate && (
                      <a
                        href={fileField.downloadTemplate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-[#1a4d2e] hover:text-[#0f2d1a] font-bold hover:underline transition-colors mt-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        {fileField.id === "fotoFormal"
                          ? "Lihat Contoh Foto"
                          : "Unduh Template Contoh"}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                      <Upload className="h-3.5 w-3.5" /> Unggah
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, fileField.id)}
                        className="hidden"
                        accept={fileField.accept}
                      />
                    </label>
                    {files[fileField.id] && (
                      <a
                        href={URL.createObjectURL(files[fileField.id]!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Klik untuk preview file"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-900 cursor-pointer transition-all group max-w-[160px]"
                      >
                        <Check className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {files[fileField.id]?.name}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload progress info */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>
                {Object.values(files).filter(Boolean).length} / 9 berkas
                diunggah. Semua berkas wajib diisi sebelum submit.
              </span>
            </div>
          </div>

          {/* Section 3: Ukuran & Detail Kaos */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1a4d2e] border-b border-gray-50 pb-2">
              Merchandise &amp; Detail Kaos
            </h2>

            {/* Size Table */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/20">
              <table className="w-full text-center text-[10px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-2 border-r border-gray-100">Size</th>
                    <th className="p-2 border-r border-gray-100">
                      Lebar Baju (cm)
                    </th>
                    <th className="p-2">Panjang Baju (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-semibold">
                  {[
                    { size: "XS", w: 41, h: 62 },
                    { size: "S", w: 45, h: 65 },
                    { size: "M", w: 48, h: 68 },
                    { size: "L", w: 52, h: 72 },
                    { size: "XL", w: 55, h: 74 },
                    { size: "3L", w: 59, h: 76 },
                    { size: "4L", w: 63, h: 79 },
                    { size: "5L", w: 67, h: 80 },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border-r border-gray-100 font-bold text-gray-800">
                        {row.size}
                      </td>
                      <td className="p-2 border-r border-gray-100">{row.w}</td>
                      <td className="p-2">{row.h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Select size */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Ukuran Kaos <span className="text-red-500">*</span>
                </label>
                <select
                  name="shirtSize"
                  required
                  value={formData.shirtSize}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white cursor-pointer"
                >
                  <option value="">Pilih Ukuran Kaos</option>
                  {["XS", "S", "M", "L", "XL", "3L", "4L", "5L"].map((sz) => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sleeve Type */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Jenis Lengan <span className="text-red-500">*</span>
                </label>
                <select
                  name="sleeveType"
                  required
                  value={formData.sleeveType}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white cursor-pointer"
                >
                  <option value="">Pilih Jenis Lengan</option>
                  <option value="Panjang">Panjang</option>
                  <option value="Pendek">Pendek</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <button
              type="reset"
              disabled={loading}
              onClick={() => {
                setFormData({
                  name: "",
                  gender: "",
                  delegation: "",
                  reason: "",
                  shirtSize: "",
                  sleeveType: "",
                  whatsapp: "",
                  birthDate: "",
                  email: "",
                });
                setDate(undefined);
                setFiles({
                  sertifikatMakesta: null,
                  sertifikatLakmud: null,
                  rekomendasi: null,
                  essay: null,
                  ktpKta: null,
                  formulir: null,
                  paktaIntegritas: null,
                  fotoFormal: null,
                  buktiBayar: null,
                });
              }}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-0 disabled:opacity-40"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a4d2e] px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#0f2d1a] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengunggah Berkas...
                </>
              ) : (
                "Kirim Registrasi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
