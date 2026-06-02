import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  robots: { index: false, follow: false },
};

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const dest = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/classroom";

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Create your free account and start learning today."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-brand hover:underline">
            Sign In
          </Link>
        </>
      }
    >
      <SignUpForm googleEnabled={googleEnabled} callbackUrl={dest} />
    </AuthShell>
  );
}
