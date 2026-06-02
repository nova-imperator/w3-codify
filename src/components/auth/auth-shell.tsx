import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/** Centered card shell for auth pages, on the dark cinematic backdrop. */
export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000_10%,transparent_70%)]" />
      <div
        aria-hidden
        className="animate-aurora absolute -top-1/4 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.18),transparent_60%)] blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[20px] border border-border bg-bg-elevated/80 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex flex-col gap-1.5 text-center">
            <h1 className="font-display text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-fg-muted">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-fg-muted">{footer}</p>
        <p className="mt-4 text-center text-xs text-fg-faint">
          <Link href="/" className="hover:text-fg">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

/** "Or" divider between OTP and Google. */
export function OrDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wider text-fg-faint">
        Or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
