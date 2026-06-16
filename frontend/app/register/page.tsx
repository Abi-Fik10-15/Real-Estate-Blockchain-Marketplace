"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, Home, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";
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
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "owner" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerUser(values);
      toast.success("Account created. Please sign in to continue.");
      router.push("/login");
    } catch {
      toast.error("Registration failed — email may already be in use.");
    }
  };

  return (
   <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl font-bold text-primary-500">Join ChainEstate</CardTitle>
          <CardDescription>
            Choose the role that best describes how you'll use the marketplace.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Separator className="mb-4" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                          "flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          field.value === r.value
                            ? "border-primary bg-primary/5 ring-2 ring-primary/10"
                            : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <span
                          className={cn(
                            "mb-1 flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
                            field.value === r.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-muted text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
                          )}
                        >
                          <r.icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-foreground">{r.label}</span>
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

            {/* Name + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register("name")} />
                <FieldError message={errors.name?.message} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" autoComplete="tel" placeholder="+1 555 000 0000" {...register("phone")} />
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
                <Label htmlFor="confirmPassword">Confirm password</Label>
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
              By creating an account you agree to use ChainEstate for verified property
              discovery and blockchain-backed transaction workflows.
            </p>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t bg-muted/30 py-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
  );
}