"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, PhoneCall, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/** Formats raw digits to "98765 43210" for display (§5.6 #7 auto-format). */
function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

type Errors = Partial<Record<"name" | "phone", string>>;

export function RequestCallbackDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [enquiry, setEnquiry] = React.useState("Online Course (Website)");
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState<Errors>({});

  function reset() {
    setName("");
    setPhone("");
    setEnquiry("Online Course (Website)");
    setMessage("");
    setErrors({});
    setDone(false);
  }

  function validate(): boolean {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) next.phone = "Enter a valid 10-digit number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, enquiryFor: enquiry, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      track("callback_submitted", { enquiryFor: enquiry });
      toast.success("Callback requested — our team will reach out shortly.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <DialogHeader className="items-center">
              <DialogTitle>You&apos;re all set!</DialogTitle>
              <DialogDescription>
                Thanks, {name.split(" ")[0] || "there"}. A W3Codify advisor will
                call you on +91 {formatPhone(phone)} soon.
              </DialogDescription>
            </DialogHeader>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <span className="mb-1 inline-flex size-11 items-center justify-center rounded-[12px] bg-brand/12 text-brand">
                <PhoneCall className="size-5" />
              </span>
              <DialogTitle>Request a Callback</DialogTitle>
              <DialogDescription>
                Leave your details and our team will call you to help you pick
                the right track.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <Field label="Name" error={errors.name} htmlFor="cb-name">
                <Input
                  id="cb-name"
                  value={name}
                  autoComplete="name"
                  placeholder="Your full name"
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!errors.name}
                />
              </Field>

              <Field label="Phone no." error={errors.phone} htmlFor="cb-phone">
                <div className="flex gap-2">
                  <span className="inline-flex h-11 select-none items-center rounded-[12px] border border-border bg-bg-subtle px-3 text-sm text-fg-muted">
                    🇮🇳 +91
                  </span>
                  <Input
                    id="cb-phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="98765 43210"
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(e.target.value)}
                    aria-invalid={!!errors.phone}
                  />
                </div>
              </Field>

              <Field label="Enquiry For" htmlFor="cb-enquiry">
                <select
                  id="cb-enquiry"
                  value={enquiry}
                  onChange={(e) => setEnquiry(e.target.value)}
                  className="h-11 w-full rounded-[12px] border border-border bg-bg-subtle px-3.5 text-sm text-fg focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <option>Online Course (Website)</option>
                  <option>Offline Course</option>
                </select>
              </Field>

              <Field label="How can we help you?" htmlFor="cb-msg">
                <textarea
                  id="cb-msg"
                  rows={3}
                  value={message}
                  placeholder="Tell us what you're looking for…"
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-[12px] border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </Field>

              <Button type="submit" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {submitting ? "Booking…" : "Book My Callback"}
              </Button>
              <p className="text-center text-xs text-fg-faint">
                Protected by reCAPTCHA. By submitting you agree to our terms.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-fg-muted"
      >
        {label}
      </label>
      {children}
      {error && (
        <span className={cn("text-xs text-[#ff6b6b]")} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
