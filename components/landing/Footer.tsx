import Link from "next/link";
import { CONTACT_INFO, NAV_LINKS } from "@/constants/landing";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f2d1a] px-6 pt-16 pb-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Kolom 1: Brand / Deskripsi */}
          <div>
            <div className="mb-4 flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wider text-white">
                LATIN &amp; LATPEL 2026
              </span>
              <span className="text-[9px] font-bold text-white/50 tracking-wider">
                PC IPNU IPPNU KABUPATEN MAGETAN
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-white/60 mb-6 font-medium">
              Program Latihan Instruktur dan Latihan Pelatih Departemen Kaderisasi PC IPNU IPPNU Kabupaten Magetan. Mencetak kader pelatih andalan yang militan dan berintegritas.
            </p>
            <div className="space-y-2 text-[10px] text-white/60">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#52b788] shrink-0 mt-0.5" />
                <span>{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#52b788] shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>

          {/* Kolom 2: Navigasi Portal */}
          <div>
            <h3 className="mb-5 text-[10px] font-black uppercase tracking-widest text-white/40">
              NAVIGASI PORTAL
            </h3>
            <ul className="space-y-3 text-xs font-semibold">
              {NAV_LINKS.map((link, i) => (
                <li key={`${link.href}-${i}`}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Hubungi Kami */}
          <div>
            <h3 className="mb-5 text-[10px] font-black uppercase tracking-widest text-white/40">
              HUBUNGI KAMI
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-white/70">
              <li className="flex items-center gap-2.5">
                {/* SVG Instagram */}
                <svg
                  className="h-4 w-4 text-[#52b788] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <a
                  href="https://www.instagram.com/pelajarnumagetan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @pelajarnumagetan
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                {/* SVG TikTok */}
                <svg
                  className="h-4 w-4 text-[#52b788] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @pelajarnumagetan
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Narahubung */}
          <div>
            <h3 className="mb-5 text-[10px] font-black uppercase tracking-widest text-white/40">
              NARAHUBUNG
            </h3>
            <ul className="space-y-3 text-xs font-semibold">
              {CONTACT_INFO.phone.map((cp, idx) => (
                <li key={idx}>
                  <a
                    href={`https://wa.me/${cp.number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#52b788]" />
                    <span>{cp.name} ({cp.number})</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="my-10 h-px bg-white/10" aria-hidden="true" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row text-[9px] text-white/40 font-bold uppercase tracking-wider">
          <p>
            © 2026 PC IPNU IPPNU KABUPATEN MAGETAN. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
