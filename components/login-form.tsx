"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);

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
          <form onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              {/* Email Field with Icon */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-[#1a4d2e]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </Field>

              {/* Password Field with Icon and Eye Toggle */}
              <Field>
                <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-[#1a4d2e]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
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

              {/* Submit Button */}
              <Field>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-[#1a4d2e] hover:bg-[#0f2d1a] text-white font-bold py-5 cursor-pointer border-0 shadow-md transition-all hover:shadow-lg"
                >
                  Masuk
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
