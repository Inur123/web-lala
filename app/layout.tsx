import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "LATIN & LATPEL 2026 – Latihan Instruktur & Latihan Pelatih",
  description:
    "Akselerasi Kaderisasi, Ekspansi Pelatinan, Wujudkan Instruktur–Pelatih yang Militan. Program peningkatan instruktur anggota PK IPNU/IPPNU Kabupaten Magelang.",
  keywords: [
    "LATIN",
    "LATPEL",
    "Latihan Instruktur",
    "Latihan Pelatih",
    "IPNU",
    "IPPNU",
    "Magelang",
    "2026",
  ],
  openGraph: {
    title: "LATIN & LATPEL 2026 – Latihan Instruktur & Latihan Pelatih",
    description:
      "Akselerasi Kaderisasi, Ekspansi Pelatinan, Wujudkan Instruktur–Pelatih yang Militan.",
    type: "website",
    locale: "id_ID",
  },
};

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
