import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return (
    <div className="min-h-dvh">
      <div className="container-page py-6">
        <Logo />
      </div>
      <ComingSoon
        title="Create your account"
        description="Register with your name, phone, and email — then verify via OTP and start learning for free."
        session="Session 3"
      />
      <p className="pb-12 text-center text-sm text-fg-muted">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-brand hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
