"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  ClipboardList,
  UserCheck,
  Settings,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "./skeleton";

type Registrant = {
  id: string;
  name: string;
  gender: string;
  delegation: string;
  admin_status: "pending" | "lolos" | "ditolak";
  screening_status: "pending" | "lolos" | "ditolak";
  created_at: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/registrasi");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }

        const settingsRes = await fetch("/api/admin/settings");
        if (settingsRes.ok) {
          const json = await settingsRes.json();
          setRegistrationOpen(json.isOpen);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalPendaftar = data.length;
  const adminLolos = data.filter((r) => r.admin_status === "lolos").length;
  const adminDitolak = data.filter((r) => r.admin_status === "ditolak").length;
  const adminPending = data.filter((r) => r.admin_status === "pending").length;

  const screeningLolos = data.filter(
    (r) => r.screening_status === "lolos",
  ).length;
  const screeningDitolak = data.filter(
    (r) => r.screening_status === "ditolak",
  ).length;
  const screeningPending = data.filter(
    (r) => r.admin_status === "lolos" && r.screening_status === "pending",
  ).length;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
            Dashboard Utama
          </h1>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            Selamat datang di Admin Portal LATIN &amp; LATPEL PC IPNU IPPNU
            Magetan 2026.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">
            Status Pendaftaran:
          </span>
          {registrationOpen === true ? (
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 border border-emerald-200 rounded-full font-bold px-3">
              DIBUKA
            </Badge>
          ) : registrationOpen === false ? (
            <Badge
              variant="destructive"
              className="bg-red-50 text-red-700 hover:bg-red-50/80 border border-red-200 rounded-full font-bold px-3"
            >
              DITUTUP
            </Badge>
          ) : (
            <Skeleton className="h-6 w-16 rounded-full" />
          )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Pendaftar
            </CardTitle>
            <Users className="h-4 w-4 text-[#1a4d2e]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-800">
              {totalPendaftar}
            </div>
            <p className="text-[10px] font-bold text-[#1a4d2e] flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>Semua berkas masuk</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Administrasi Lolos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-800">
              {adminLolos}
            </div>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">
              {adminPending} menunggu, {adminDitolak} ditolak
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Screening Lolos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-800">
              {screeningLolos}
            </div>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">
              {screeningPending} menunggu, {screeningDitolak} ditolak
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Belum Direview
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-800">
              {adminPending + screeningPending}
            </div>
            <p className="text-[10px] font-semibold text-gray-400 mt-1">
              Memerlukan review segera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Registrants */}
        <Card className="col-span-4 border border-gray-100 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-black text-gray-800">
              Pendaftar Terbaru
            </CardTitle>
            <CardDescription className="text-[10px] font-semibold text-gray-400">
              Berikut adalah 5 calon peserta yang mendaftar paling baru ke
              sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.length === 0 ? (
                <p className="text-xs font-semibold text-gray-400 text-center py-8">
                  Belum ada peserta terdaftar.
                </p>
              ) : (
                data.slice(0, 5).map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-800 leading-none">
                        {reg.name}
                      </p>
                      <p className="text-[10px] font-semibold text-gray-400">
                        {reg.delegation}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={`text-[9px] font-bold rounded px-2 py-0.5 border ${
                          reg.admin_status === "lolos"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : reg.admin_status === "ditolak"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        Adm: {reg.admin_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shortcuts / Quick Actions */}
        <Card className="col-span-3 border border-gray-100 shadow-sm rounded-2xl flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-sm font-black text-gray-800">
                Aksi Cepat Admin
              </CardTitle>
              <CardDescription className="text-[10px] font-semibold text-gray-400">
                Pintasan navigasi untuk mengelola seleksi peserta dan sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/registrasi" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl font-bold text-xs border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <ClipboardList className="mr-2 h-4 w-4 text-[#1a4d2e]" />
                  Seleksi Administrasi &amp; Screening
                  <ArrowRight className="ml-auto h-3 w-3 text-gray-400" />
                </Button>
              </Link>
              <Link href="/settings" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl font-bold text-xs border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4 text-[#1a4d2e]" />
                  Buka / Tutup Pendaftaran
                  <ArrowRight className="ml-auto h-3 w-3 text-gray-400" />
                </Button>
              </Link>
            </CardContent>
          </div>
          <div className="p-6 pt-0">
            <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50 text-[10px] text-gray-400 font-semibold leading-relaxed">
              Pastikan Anda meninjau berkas administrasi (sertifikat,
              rekomendasi, dll) dengan teliti sebelum meloloskan calon peserta.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
