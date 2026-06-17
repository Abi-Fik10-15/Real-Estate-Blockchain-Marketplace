"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WalletConnect } from "@/components/wallet/wallet-connect";

import { useAuthStore } from "@/store/auth-store";
import { loginSchema, type LoginValues } from "@/lib/validations";
import { Building2 } from "lucide-react";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginAs = useAuthStore((s) => s.loginAs);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    const user = await login(values.email.trim().toLowerCase(), values.password);

    if (!user) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success(`Welcome back, ${user.name}`);
    router.replace(`/dashboard/${user.role}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">

        {/* Brand header — matches register page */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-medium text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your real estate assets.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
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

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="[&>button]:w-full">
              <WalletConnect />
            </div>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">demo logins</span>
              <Separator className="flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const u = await loginAs("owner");
                  if (u) {
                    toast.success(`Welcome back, ${u.name}`);
                    router.replace(`/dashboard/${u.role}`);
                  } else {
                    toast.error("Demo login failed");
                  }
                }}
              >
                Owner
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const u = await loginAs("buyer");
                  if (u) {
                    toast.success(`Welcome back, ${u.name}`);
                    router.replace(`/dashboard/${u.role}`);
                  } else {
                    toast.error("Demo login failed");
                  }
                }}
              >
                Buyer
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const u = await loginAs("admin");
                  if (u) {
                    toast.success(`Welcome back, ${u.name}`);
                    router.replace(`/dashboard/${u.role}`);
                  } else {
                    toast.error("Demo login failed");
                  }
                }}
              >
                Admin
              </Button>
            </div>
          </CardContent>

          <CardFooter className="justify-center border-t bg-muted/30 py-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
