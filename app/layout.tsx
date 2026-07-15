import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LATIN & LATPEL 2026 – Latihan Instruktur & Latihan Pelatih",
  description:
    "Episentrum Kaderisasi: Orkestrasi Ekosistem Inklusif menuju Kader Solutif-Transformatif",
  keywords: [
    "LATIN",
    "LATPEL",
    "Latihan Instruktur",
    "Latihan Pelatih",
    "IPNU",
    "IPPNU",
    "Magetan",
    "2026",
  ],
  openGraph: {
    title: "LATIN & LATPEL 2026 – Latihan Instruktur & Latihan Pelatih",
    description:
      "Episentrum Kaderisasi: Orkestrasi Ekosistem Inklusif menuju Kader Solutif-Transformatif",
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
    <html lang="id" className={inter.className}>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
