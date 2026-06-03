"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpInput } from "./otp-input";
import { OrDivider } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { DevCodeNotice } from "./dev-code-notice";
import { track } from "@/lib/analytics";

function fmt(d: string) {
  const x = d.replace(/\D/g, "").slice(0, 10);
  return x.length <= 5 ? x : `${x.slice(0, 5)} ${x.slice(5)}`;
}

export function SignUpForm({
  googleEnabled,
  callbackUrl,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState<"form" | "otp">("form");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(true);
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devCode, setDevCode] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function register(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (firstName.trim().length < 1) return setError("Please enter your first name.");
    if (phone.replace(/\D/g, "").length !== 10) return setError("Enter a valid 10-digit number.");
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Enter a valid email.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, email, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your account.");
        return;
      }
      setStep("otp");
      setCooldown(30);
      setDevCode(data.devCode ?? null);
      toast.success(data.delivered ? "Code sent to your phone" : "Code generated");
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
      const res = await signIn("phone-otp", { phone, code: otp, redirect: false });
      if (res?.error) {
        setError("Incorrect or expired code. Try again.");
        setCode("");
      } else {
        track("signup_completed");
        toast.success("Account created — welcome to W3Codify!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => { setStep("form"); setCode(""); setError(null); }}
          className="inline-flex items-center gap-1.5 self-start text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Edit details
        </button>
        <p className="text-sm text-fg-muted">
          Verify the 6-digit code sent to{" "}
          <span className="font-medium text-fg">+91 {fmt(phone)}</span>
        </p>
        {devCode && <DevCodeNotice code={devCode} onUse={(c) => { setCode(c); verify(c); }} />}
        <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={loading} />
        {error && <p className="text-sm text-[#ff6b6b]" role="alert">{error}</p>}
        <Button size="lg" disabled={loading || code.length !== 6} onClick={() => verify()}>
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify & create account
        </Button>
        <button
          onClick={() => register()}
          disabled={cooldown > 0 || loading}
          className="text-sm text-fg-muted hover:text-fg disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={register} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" htmlFor="fn">
            <Input id="fn" autoComplete="given-name" placeholder="Brad" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
          <Field label="Last name" htmlFor="ln">
            <Input id="ln" autoComplete="family-name" placeholder="Forbes" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
        </div>
        <Field label="Phone number" htmlFor="ph">
          <div className="flex gap-2">
            <span className="inline-flex h-11 select-none items-center rounded-[12px] border border-border bg-bg-subtle px-3 text-sm text-fg-muted">
              🇮🇳 +91
            </span>
            <Input id="ph" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" value={fmt(phone)} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </Field>
        <Field label="Email" htmlFor="em">
          <Input id="em" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-fg-muted">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
          I agree to receive communications from W3Codify via WhatsApp, SMS, email, and phone calls, even if registered under DND/NDNC.
        </label>

        {error && <p className="text-sm text-[#ff6b6b]" role="alert">{error}</p>}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="size-4" />}
          Register Now
        </Button>
        <p className="text-center text-xs text-fg-faint">Protected by reCAPTCHA.</p>
      </form>

      {googleEnabled && (
        <>
          <OrDivider />
          <GoogleButton callbackUrl={callbackUrl} />
        </>
      )}
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg-muted">{label}</label>
      {children}
    </div>
  );
}
