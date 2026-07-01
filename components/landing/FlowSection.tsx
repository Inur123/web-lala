import { TIMELINE_STEPS } from "@/constants/landing";

export default function FlowSection() {
  return (
    <section 
      id="alur" 
      className="bg-white px-6 py-20"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "45px 45px",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#f8fafc] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#1a4d2e]">
            TAHAPAN ALUR
          </span>
          <h2 className="mt-4 text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
            Alur Pelaksanaan Kegiatan 2026
          </h2>
          <p className="mt-2 text-xs text-gray-400 font-medium">
            Status tahapan aktif disesuaikan otomatis dengan kalender berjalan
          </p>
        </div>

        {/* Steps Horizontal */}
        <div className="relative mt-12">
          {/* Connector line (desktop) */}
          <div className="absolute left-10 right-10 top-6 hidden h-0.5 bg-gray-100 lg:block" aria-hidden="true" />

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-9">
            {TIMELINE_STEPS.map((step, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-4 font-black text-xs transition-all duration-200 ${
                    index === 7
                      ? "border-[#1a4d2e]/20 bg-[#1a4d2e] text-white shadow-md"
                      : "border-gray-50 bg-white text-gray-700 hover:border-gray-200"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="mt-1 text-[8px] font-bold text-gray-400">
                  {step.date}
                </p>
                <p className="mt-1.5 text-[10px] font-bold text-gray-800 leading-tight">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
