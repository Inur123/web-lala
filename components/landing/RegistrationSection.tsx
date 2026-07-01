import {
  ADMIN_REQUIREMENTS,
  TICKET_PRICES,
  FACILITIES,
} from "@/constants/landing";
import {
  FileText,
  Check,
  Gift,
  Landmark,
  CreditCard,
  Wallet,
} from "lucide-react";

export default function RegistrationSection() {
  return (
    <section
      id="daftar"
      className="bg-[#f8fafc] px-6 py-20 sm:px-8"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "45px 45px",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f8fafc] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#1a4d2e]">
            PANDUAN LENGKAP
          </span>
          <h2 className="mt-4 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
            Syarat Pendaftaran &amp; Biaya
          </h2>
          <p className="mt-2 text-xs text-gray-400 font-medium">
            Informasi kelengkapan berkas administrasi, biaya kontribusi, dan
            fasilitas peserta
          </p>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-stretch">
          {/* Col 1: Berkas Administrasi */}
          <div
            id="persyaratan"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-[#1a4d2e]">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
              Berkas Administrasi
            </h3>
            <div className="space-y-4 flex-1">
              {ADMIN_REQUIREMENTS.map((req, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#1a4d2e]/10 text-[#1a4d2e]">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-800 leading-tight">
                      {req.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-relaxed">
                      {req.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Tiket Hijau */}
          <div className="relative overflow-hidden rounded-2xl bg-[#1a4d2e] p-8 text-white shadow-lg flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#52b788]" />
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-[#52b788] mb-1">
                REGISTRATION PRICE
              </p>
              <h3 className="text-sm font-black text-white mb-6">
                LATIN &amp; LATPEL HTM
              </h3>

              <div className="space-y-3.5">
                {TICKET_PRICES.map((ticket, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs"
                  >
                    <p className="text-[11px] font-bold text-white/90">
                      {ticket.label}
                    </p>
                    <p className="text-[11px] font-black text-white">
                      {ticket.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[8px] font-bold uppercase tracking-widest text-white/50 mb-3">
                METODE PEMBAYARAN:
              </p>
              <div className="space-y-3 text-[10px]">
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Landmark className="h-3.5 w-3.5 text-[#52b788]" /> BRI
                  </span>
                  <span className="font-mono font-bold">
                    3641 0102 9315 530
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Wallet className="h-3.5 w-3.5 text-[#52b788]" />{" "}
                    Dana/OVO/GoPay
                  </span>
                  <span className="font-mono font-bold">0857 9086 5350</span>
                </div>
                <div className="flex items-center justify-between text-white/80">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CreditCard className="h-3.5 w-3.5 text-[#52b788]" />{" "}
                    ShopeePay
                  </span>
                  <span className="font-mono font-bold">0857 0663 7146</span>
                </div>
                <p className="text-[9px] text-white/40 text-center mt-4 font-semibold italic">
                  A.n. Anis Dawim Musa&apos;adah
                </p>
              </div>
            </div>
          </div>

          {/* Col 3: Fasilitas Peserta */}
          <div
            id="fasilitas"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-[#1a4d2e]">
              <Gift className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
              Fasilitas Peserta
            </h3>
            <div className="space-y-2 flex-1">
              {FACILITIES.map((facility, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-50 bg-[#f8fafc] px-4 py-3 hover:border-gray-200 transition-colors"
                >
                  <Check className="h-3.5 w-3.5 text-[#1a4d2e] shrink-0" />
                  <p className="text-[11px] font-bold text-gray-600 leading-none">
                    {facility}
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
