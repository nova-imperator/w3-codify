import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const dest = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/classroom";

  return (
    <AuthShell
      title="Sign in or sign up"
      subtitle="Enter your email and we'll send you a one-time code. No password."
      footer={
        <>
          By continuing you agree to our{" "}
          <Link href="/legal/terms" className="font-medium text-brand hover:underline">Terms</Link> and{" "}
          <Link href="/legal/privacy" className="font-medium text-brand hover:underline">Privacy Policy</Link>.
        </>
      }
    >
      <SignInForm googleEnabled={googleEnabled} callbackUrl={dest} />
    </AuthShell>
  );
}
