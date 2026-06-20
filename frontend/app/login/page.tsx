"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LazyWalletConnect } from "@/components/wallet/lazy-wallet-connect";
import { AuthSplitShell } from "@/components/auth/auth-shell";

import { useAuthStore } from "@/store/auth-store";
import { loginSchema, type LoginValues } from "@/lib/validations";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function extractApiMessage(err: unknown): string | null {
  if (typeof err !== "object" || !err) return null;
  const e = err as { response?: { data?: { message?: string | string[] } } };
  const msg = e.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg[0] ?? null;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setUnverifiedEmail(null);
    try {
      const user = await login(values.email.trim().toLowerCase(), values.password);
      toast.success(`Welcome back, ${user.name}`);
      router.replace(`/dashboard/${user.role}`);
    } catch (err) {
      const msg = extractApiMessage(err) ?? "";
      if (msg.toLowerCase().includes("verify your email")) {
        setUnverifiedEmail(values.email.trim().toLowerCase());
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <AuthSplitShell>
      <div className="w-full max-w-sm">
        {/* Mobile brand — only visible below lg */}
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 lg:hidden"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-semibold text-foreground">ChainEstate</span>
        </Link>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Welcome back!</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to manage your real estate portfolio.
          </p>
        </div>

        {/* Unverified email banner */}
        {unverifiedEmail && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Email not verified
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                Please check your inbox for the verification link.
              </p>
              <Link
                href="/verify-email"
                className="inline-flex items-center gap-1 font-medium text-amber-800 underline hover:text-amber-900 dark:text-amber-300"
              >
                <Mail className="h-3.5 w-3.5" />
                Resend verification email
              </Link>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
            />
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              "Signing in…"
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <Separator className="flex-1" />
        </div>

        <div className="[&>button]:w-full">
          <LazyWalletConnect />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthSplitShell>
  );
}
