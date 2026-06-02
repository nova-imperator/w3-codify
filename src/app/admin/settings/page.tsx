import { CheckCircle2, XCircle } from "lucide-react";
import { requireAdmin } from "@/server/session";
import { AdminCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function configured(...vals: (string | undefined)[]) {
  return vals.every((v) => v && !v.includes("<") && !v.includes("FILL_ME"));
}

export default async function AdminSettingsPage() {
  await requireAdmin();

  const integrations = [
    { name: "Database (PostgreSQL/RDS)", ok: configured(process.env.DATABASE_URL), note: "Catalog, users, enrollments" },
    { name: "Auth.js secret", ok: configured(process.env.AUTH_SECRET), note: "Session signing" },
    { name: "MSG91 (SMS/OTP)", ok: configured(process.env.MSG91_AUTH_KEY), note: "Real OTP delivery (dev-code fallback when off)" },
    { name: "Google OAuth", ok: configured(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET), note: "Continue with Google" },
    { name: "reCAPTCHA v3", ok: configured(process.env.RECAPTCHA_SECRET_KEY, process.env.RECAPTCHA_SITE_KEY), note: "Bot protection on register/callback" },
    { name: "AWS S3 / CloudFront", ok: configured(process.env.AWS_ACCESS_KEY_ID, process.env.S3_BUCKET_NAME), note: "Media uploads (add-by-URL when off)" },
    { name: "Razorpay", ok: configured(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET), note: "Payments (Session 4)" },
    { name: "Anthropic Claude", ok: configured(process.env.ANTHROPIC_API_KEY), note: "AI tutor (Session 5)" },
    { name: "Mux", ok: configured(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET), note: "Video streaming (Session 5)" },
  ];

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <p className="text-sm text-fg-muted">
        Integration status. Missing keys degrade gracefully — fill them in{" "}
        <code className="text-fg">.env</code> (and re-deploy) to enable each feature.
      </p>
      <AdminCard className="divide-y divide-border">
        {integrations.map((i) => (
          <div key={i.name} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div>
              <p className="text-sm font-medium text-fg">{i.name}</p>
              <p className="text-xs text-fg-faint">{i.note}</p>
            </div>
            {i.ok ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-4" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-faint">
                <XCircle className="size-4" /> Not set
              </span>
            )}
          </div>
        ))}
      </AdminCard>
    </div>
  );
}
