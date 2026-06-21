"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthSplitShell } from "@/components/auth/auth-shell";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

type VerifyState = "loading" | "success" | "error" | "resend";

/** Inner component — uses useSearchParams, must be inside <Suspense> */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const loginAfterVerify = useAuthStore((s) => s.loginAfterVerify);

  const [state, setState] = React.useState<VerifyState>(
    token ? "loading" : "resend",
  );
  const [errorMsg, setErrorMsg] = React.useState("");
  const [resendEmail, setResendEmail] = React.useState("");
  const [resending, setResending] = React.useState(false);
  const [resent, setResent] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let cancelled = false;
    api
      .verifyEmail(token)
      .then(({ accessToken, user }) => {
        if (cancelled) return;
        loginAfterVerify(accessToken, user);
        setState("success");
        toast.success("Email verified! Welcome to ChainEstate.");
        setTimeout(() => router.replace(`/dashboard/${user.role}`), 2500);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setErrorMsg(msg ?? "The verification link is invalid or has expired.");
        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token, loginAfterVerify, router]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setResending(true);
    try {
      await api.resendVerification(resendEmail.trim().toLowerCase());
      setResent(true);
      toast.success("Verification email sent — check your inbox.");
    } catch {
      toast.error("Could not send verification email. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Mobile brand */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-contain" />
        <span className="font-semibold text-foreground">ChainEstate</span>
      </Link>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Email Verification</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {state === "loading" && "Verifying your email address…"}
          {state === "success" && "Your account is now active."}
          {state === "error" && "We could not verify your email."}
          {state === "resend" && "Request a new verification link."}
        </p>
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Please wait…</p>
        </div>
      )}

      {/* Success */}
      {state === "success" && (
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </span>
          <p className="text-sm text-muted-foreground">
            Your email has been verified and your account is now active.
            <br />
            Redirecting you to your dashboard…
          </p>
        </div>
      )}

      {/* Error — inline resend form */}
      {state === "error" && (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm leading-relaxed text-destructive">{errorMsg}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your email below to receive a fresh link:
          </p>
          {resent ? (
            <p className="text-sm font-medium text-green-600">
              Verification email sent ✓
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleResend();
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={resending}
                  onClick={handleResend}
                  className="shrink-0 gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                  />
                  {resending ? "Sending…" : "Resend"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standalone resend form (no token in URL) */}
      {state === "resend" && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            If your verification link has expired, enter your email and we&apos;ll
            send a fresh one.
          </p>
          {resent ? (
            <p className="text-sm font-medium text-green-600">
              Verification email sent — check your inbox ✓
            </p>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="resend-email">Email address</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="you@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleResend();
                  }}
                />
              </div>
              <Button
                type="button"
                className="w-full gap-2"
                disabled={resending}
                onClick={handleResend}
              >
                <RefreshCw
                  className={`h-4 w-4 ${resending ? "animate-spin" : ""}`}
                />
                {resending ? "Sending…" : "Send verification email"}
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
        {" · "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}

/** Page wrapper — Suspense required for useSearchParams with Next.js 15 */
export default function VerifyEmailPage() {
  return (
    <AuthSplitShell>
      <React.Suspense
        fallback={
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <VerifyEmailContent />
      </React.Suspense>
    </AuthSplitShell>
  );
}
