"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  Mail,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthSplitShell } from "@/components/auth/auth-shell";
import { SafeForm } from "@/components/auth/safe-form";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/services/api";
import { registerSchema, type RegisterValues } from "@/lib/validations";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    value: "owner",
    label: "Owner",
    description: "List and manage properties",
    icon: Building2,
  },
  {
    value: "agent",
    label: "Agent",
    description: "Represent listings",
    icon: UserCheck,
  },
  {
    value: "buyer",
    label: "Buyer",
    description: "Browse and purchase",
    icon: Home,
  },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

function CheckEmailState({ email }: { email: string }) {
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.resendVerification(email);
      setResent(true);
      toast.success("Verification email resent — check your inbox.");
    } catch {
      toast.error("Could not resend verification email. Try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-8 w-8 text-primary" />
      </span>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-primary">Check your inbox</h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>.
          Click it to activate your account.
        </p>
      </div>

      <div className="w-full rounded-lg border bg-muted/40 p-4 text-left space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          <span>
            The link is valid for <strong>24 hours</strong>.
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
          <span>Check your spam folder if you don&apos;t see it.</span>
        </div>
      </div>

      {resent ? (
        <p className="text-sm font-medium text-green-600">
          Verification email resent ✓
        </p>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={resending}
          onClick={handleResend}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", resending && "animate-spin")} />
          {resending ? "Sending…" : "Resend verification email"}
        </Button>
      )}

      <p className="text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <React.Suspense
      fallback={
        <AuthSplitShell>
          <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        </AuthSplitShell>
      }
    >
      <RegisterPageContent />
    </React.Suspense>
  );
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registerUser = useAuthStore((s) => s.register);

  const inviteRole = searchParams.get("role");
  const inviteEmail = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role:
        inviteRole === "agent" || inviteRole === "owner" || inviteRole === "buyer"
          ? inviteRole
          : "owner",
      email: inviteEmail,
    },
  });

  React.useEffect(() => {
    if (inviteRole === "agent" || inviteRole === "owner" || inviteRole === "buyer") {
      setValue("role", inviteRole);
    }
    if (inviteEmail) {
      setValue("email", inviteEmail);
    }
  }, [inviteRole, inviteEmail, setValue]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      toast.success("Account created! You can now sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string | string[] } } }).response?.data
          ?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : Array.isArray(
                (err as { response?: { data?: { message?: string[] } } }).response?.data
                  ?.message,
              )
            ? (err as { response: { data: { message: string[] } } }).response.data.message[0]
            : null;

      if (msg?.toLowerCase().includes("already registered")) {
        toast.error("That email is already registered. Try signing in instead.");
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error("Registration failed — check your connection and try again.");
      }
    }
  };

  return (
    <AuthSplitShell>
      <div className="w-full max-w-sm">
        {/* Mobile brand */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
          <span className="font-semibold text-foreground">ChainEstate</span>
        </Link>

        <>
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-primary">Join ChainEstate</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Choose the role that best describes how you&apos;ll use the marketplace.
              </p>
            </div>

            <SafeForm
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e);
              }}
              className="space-y-5"
            >
              {/* Role selector */}
              <div className="space-y-2">
                <Label>Account type</Label>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map((r) => (
                        <button
                          type="button"
                          key={r.value}
                          onClick={() => field.onChange(r.value)}
                          className={cn(
                            "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            field.value === r.value
                              ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                              : "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                          )}
                        >
                          <span
                            className={cn(
                              "mb-1 flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                              field.value === r.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            <r.icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {r.label}
                          </span>
                          <span className="text-xs leading-snug text-muted-foreground">
                            {r.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                />
                <FieldError message={errors.role?.message} />
              </div>

              <Separator />

              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    {...register("name")}
                  />
                  <FieldError message={errors.name?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    autoComplete="tel"
                    placeholder="+1 555 000 0000"
                    {...register("phone")}
                  />
                  <FieldError message={errors.phone?.message} />
                </div>
              </div>

              {/* Email */}
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

              {/* Password + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    {...register("password")}
                  />
                  <FieldError message={errors.password?.message} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    {...register("confirmPassword")}
                  />
                  <FieldError message={errors.confirmPassword?.message} />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Creating account…"
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By creating an account you agree to use ChainEstate for verified
                property discovery and blockchain-backed transaction workflows.
              </p>
            </SafeForm>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
        </>
      </div>
    </AuthSplitShell>
  );
}
