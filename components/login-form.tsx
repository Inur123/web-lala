"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function LoginFormContent({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFired = useRef(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if logout was successful
  useEffect(() => {
    const logoutStatus = searchParams.get("logout");
    if (logoutStatus === "success" && !hasFired.current) {
      hasFired.current = true;
      toast.success("Berhasil keluar dari akun.");
      
      // Clean query params from URL smoothly
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Better Auth Sign In
      await authClient.signIn.email({
        email,
        password,
        callbackURL: "", // dikosongkan agar Better Auth tidak melakukan reload window.location secara default
        fetchOptions: {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
          onSuccess: () => {
            // Lakukan navigasi SPA murni client-side
            router.push("/dashboard?login=success");
            router.refresh();
          },
          onError: (ctx: { error: { message?: string } }) => {
            toast.error(ctx.error.message || "Email atau kata sandi salah.");
            setLoading(false);
          }
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Masuk ke Akun Anda</CardTitle>
          <CardDescription>
            Masukkan email dan kata sandi Anda di bawah untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-gray-400 hover:text-[#1a4d2e] cursor-pointer bg-transparent border-0 p-0 flex items-center justify-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#1a4d2e] hover:bg-[#0f2d1a] text-white font-bold py-5 cursor-pointer border-0 shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Suspense wrapper for Next.js 15 compilation
export function LoginForm(props: React.ComponentProps<"div">) {
  return (
    <Suspense fallback={<div className="text-xs text-gray-400 text-center">Memuat Form...</div>}>
      <LoginFormContent {...props} />
    </Suspense>
  );
}
