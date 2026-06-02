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
      title="Sign In"
      subtitle="Welcome back. Sign in with your phone number."
      footer={
        <>
          New user?{" "}
          <Link href="/auth/signup" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm googleEnabled={googleEnabled} callbackUrl={dest} />
    </AuthShell>
  );
}
