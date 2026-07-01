"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function ToastContent() {
  const searchParams = useSearchParams();
  const hasFired = useRef(false);

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus === "success" && !hasFired.current) {
      hasFired.current = true;
      toast.success("Login berhasil! Selamat datang kembali.");
      
      // Clean query params from URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  return null;
}

export function DashboardToastHandler() {
  return (
    <Suspense fallback={null}>
      <ToastContent />
    </Suspense>
  );
}
