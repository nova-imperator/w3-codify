"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "./otp-input";
import { OrDivider } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { DevCodeNotice } from "./dev-code-notice";
import { getOnboardingStatus, completeOnboarding } from "@/server/onboarding";

function fmtPhone(d: string) {
  const x = d.replace(/\D/g, "").slice(0, 10);
  return x.length <= 5 ? x : `${x.slice(0, 5)} ${x.slice(5)}`;
}

export function SignInForm({
  googleEnabled,
  callbackUrl,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "otp" | "onboarding">("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  // onboarding fields
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function finish() {
    router.push(callbackUrl);
    router.refresh();
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send the code.");
        if (data.retryAfterMs) setCooldown(Math.ceil(data.retryAfterMs / 1000));
        return;
      }
      setStep("otp");
      setCooldown(30);
      setDevCode(data.devCode ?? null);
      toast.success(data.delivered ? "Code sent — check your email" : "Code generated");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(value?: string) {
    const otp = value ?? code;
    if (otp.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("email-otp", { email: email.trim(), code: otp, redirect: false });
      if (res?.error) {
        setError("Incorrect or expired code. Try again.");
        setCode("");
        return;
      }
      // First login only: show the welcome step; returning users go straight in.
      const { needsOnboarding } = await getOnboardingStatus();
      if (needsOnboarding) {
        setStep("onboarding");
      } else {
        toast.success("Welcome back!");
        finish();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function saveOnboarding(skip: boolean) {
    setLoading(true);
    setError(null);
    try {
      const res = await completeOnboarding(skip ? { skip: true } : { name, phone });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("You're all set! 🎉");
      finish();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: first-login welcome (skippable) ──
  if (step === "onboarding") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="bg-accent-grad grid size-11 place-items-center rounded-2xl text-white">
            <Sparkles className="size-5" />
          </span>
          <p className="text-sm text-fg-muted">
            Welcome to W3Codify! Add your details (optional — you can do this later in your profile).
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveOnboarding(false);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-fg-muted">Your name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact" className="text-sm font-medium text-fg-muted">Contact number</label>
            <div className="flex gap-2">
              <span className="inline-flex h-11 select-none items-center rounded-[12px] border border-border bg-bg-subtle px-3 text-sm text-fg-muted">🇮🇳 +91</span>
              <Input id="contact" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" value={fmtPhone(phone)} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-[#fb7185]" role="alert">{error}</p>}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="size-4" />}
            Save &amp; continue
          </Button>
        </form>
        <button
          onClick={() => saveOnboarding(true)}
          disabled={loading}
          className="text-sm font-medium text-fg-muted underline-offset-2 hover:text-fg hover:underline disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    );
  }

  // ── Step 2: OTP ──
  if (step === "otp") {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => { setStep("email"); setCode(""); setError(null); }}
          className="inline-flex items-center gap-1.5 self-start text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Change email
        </button>
        <p className="text-sm text-fg-muted">
          Enter the 6-digit code sent to <span className="font-medium text-fg">{email.trim()}</span>
        </p>
        {devCode && <DevCodeNotice code={devCode} onUse={(c) => { setCode(c); verify(c); }} />}
        <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={loading} />
        {error && <p className="text-sm text-[#fb7185]" role="alert">{error}</p>}
        <Button size="lg" disabled={loading || code.length !== 6} onClick={() => verify()}>
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify &amp; continue
        </Button>
        <button
          onClick={() => sendCode()}
          disabled={cooldown > 0 || loading}
          className="text-sm text-fg-muted hover:text-fg disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    );
  }

  // ── Step 1: email ──
  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={sendCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-fg-muted">Email</label>
          <div className="flex items-center gap-2 rounded-[12px] border border-border bg-bg-subtle px-3 focus-within:border-brand/50">
            <Mail className="size-4 shrink-0 text-fg-faint" />
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
              className="h-11 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
            />
          </div>
          {error && <p className="text-sm text-[#fb7185]" role="alert">{error}</p>}
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="size-4" />}
          Continue
        </Button>
      </form>

      {googleEnabled && (
        <>
          <OrDivider />
          <GoogleButton callbackUrl={callbackUrl} />
        </>
      )}

      <p className="text-center text-xs text-fg-faint">
        No password needed — we&apos;ll email you a one-time code. New here? An account is created
        automatically.
      </p>
    </div>
  );
}
