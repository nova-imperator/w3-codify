"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ArrowRight, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "./otp-input";
import { OrDivider } from "./auth-shell";
import { GoogleButton } from "./google-button";
import { DevCodeNotice } from "./dev-code-notice";

function fmt(d: string) {
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
  const [step, setStep] = React.useState<"phone" | "otp">("phone");
  const [phone, setPhone] = React.useState("");
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

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        if (data.retryAfterMs) setCooldown(Math.ceil(data.retryAfterMs / 1000));
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
      const res = await signIn("phone-otp", {
        phone,
        code: otp,
        redirect: false,
      });
      if (res?.error) {
        setError("Incorrect or expired code. Try again.");
        setCode("");
      } else {
        toast.success("Welcome back!");
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
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(null);
          }}
          className="inline-flex items-center gap-1.5 self-start text-sm text-fg-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" /> Change number
        </button>
        <p className="text-sm text-fg-muted">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-fg">+91 {fmt(phone)}</span>
        </p>
        {devCode && <DevCodeNotice code={devCode} onUse={(c) => { setCode(c); verify(c); }} />}
        <OtpInput value={code} onChange={setCode} onComplete={verify} disabled={loading} />
        {error && <p className="text-sm text-[#fb7185]" role="alert">{error}</p>}
        <Button size="lg" disabled={loading || code.length !== 6} onClick={() => verify()}>
          {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify & sign in
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

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={sendCode} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-fg-muted">
            Phone number
          </label>
          <div className="flex gap-2">
            <span className="inline-flex h-11 select-none items-center rounded-[12px] border border-border bg-bg-subtle px-3 text-sm text-fg-muted">
              🇮🇳 +91
            </span>
            <Input
              id="phone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={fmt(phone)}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!error}
            />
          </div>
          {error && <p className="text-sm text-[#fb7185]" role="alert">{error}</p>}
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight className="size-4" />}
          Send OTP
        </Button>
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
