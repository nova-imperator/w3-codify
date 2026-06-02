import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="min-h-dvh">
      <div className="container-page py-6">
        <Logo />
      </div>
      <ComingSoon
        title="Sign In"
        description="Phone-OTP and Google sign-in are coming. You'll be able to log in with a 6-digit OTP or your Google account."
        session="Session 3"
      />
      <p className="pb-12 text-center text-sm text-fg-muted">
        New here?{" "}
        <Link href="/auth/signup" className="text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
