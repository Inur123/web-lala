"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Check, ChevronLeft, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    delegation: "",
    reason: "",
    shirtSize: "",
    sleeveType: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
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

  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            berkas administrasi dan kelayakan berkas Anda.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1a4d2e] py-3 text-xs font-bold text-white hover:bg-[#0f2d1a] transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer border-0"
          >
            Kembali ke Beranda
          </button>
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
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white"
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

              {/* Alasan */}
              <div className="space-y-2 md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Alasan Mengikuti LATIN &amp; LATPEL{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Tuliskan motivasi dan komitmen Anda mengikuti pelatihan ini..."
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload Berkas Persyaratan */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#1a4d2e] border-b border-gray-50 pb-2">
              Unggah Berkas &amp; Dokumen
            </h2>

            {/* Grid 3 Kolom di Desktop agar Full Page */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "sertifikatMakesta", label: "Sertifikat MAKESTA" },
                { id: "sertifikatLakmud", label: "Sertifikat LAKMUD" },
                { id: "rekomendasi", label: "Surat Rekomendasi PAC / PC" },
                { id: "essay", label: "Essay Karya Tulis" },
                { id: "ktpKta", label: "Scan KTP / KTA" },
                { id: "formulir", label: "Scan Formulir Pendaftaran" },
                { id: "paktaIntegritas", label: "Pakta Integritas Bermaterai" },
                { id: "fotoFormal", label: "Foto Formal Jas (Merah)" },
                { id: "buktiBayar", label: "Bukti Transfer Kontribusi" },
              ].map((fileField) => (
                <div
                  key={fileField.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 space-y-3 relative"
                >
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                      {fileField.label} <span className="text-red-500">*</span>
                    </h4>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">
                      PDF / PNG / JPG (Max. 10MB)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                      <Upload className="h-3.5 w-3.5" /> Unggah
                      <input
                        type="file"
                        required
                        onChange={(e) => handleFileChange(e, fileField.id)}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                    </label>
                    {files[fileField.id] && (
                      <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 truncate max-w-[140px]">
                        <Check className="h-3 w-3 shrink-0" />{" "}
                        {files[fileField.id]?.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white"
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
                  className="w-full text-xs border border-gray-200 rounded-xl px-4 py-3 focus:border-[#1a4d2e] focus:ring-1 focus:ring-[#1a4d2e] outline-none transition-all font-semibold bg-white"
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
              onClick={() => {
                setFormData({
                  name: "",
                  gender: "",
                  delegation: "",
                  reason: "",
                  shirtSize: "",
                  sleeveType: "",
                });
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
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-0"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#1a4d2e] px-8 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#0f2d1a] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 cursor-pointer border-0"
            >
              Kirim Registrasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
