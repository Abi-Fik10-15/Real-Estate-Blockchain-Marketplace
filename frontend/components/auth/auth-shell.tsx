import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-[120px]" />
      </div>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">
            Chain<span className="text-gradient">Estate</span>
          </span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
