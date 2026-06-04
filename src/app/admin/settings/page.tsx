import { CheckCircle2, XCircle, Flag } from "lucide-react";
import { requireAdmin } from "@/server/session";
import { prisma } from "@/lib/prisma";
import { AdminCard } from "@/components/admin/ui";
import { FeatureFlagsManager, type FlagRow } from "@/components/admin/feature-flags-manager";
import { FLAG_DEFS, FLAG_KEYS } from "@/server/flags";

export const dynamic = "force-dynamic";

function configured(...vals: (string | undefined)[]) {
  return vals.every((v) => v && !v.includes("<") && !v.includes("FILL_ME"));
}

async function loadFlagRows(): Promise<FlagRow[]> {
  const rows = await prisma.featureFlag.findMany().catch(() => []);
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return FLAG_KEYS.map((key) => {
    const def = FLAG_DEFS[key];
    const row = byKey.get(key);
    return {
      key,
      label: def.label,
      description: def.description,
      enabled: row?.enabled ?? def.default,
      updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
    };
  });
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const flagRows = await loadFlagRows();

  const integrations = [
    { name: "Database (PostgreSQL/RDS)", ok: configured(process.env.DATABASE_URL), note: "Catalog, users, enrollments" },
    { name: "Auth.js secret", ok: configured(process.env.AUTH_SECRET), note: "Session signing" },
    { name: "SMTP (Email-OTP)", ok: configured(process.env.SMTP_HOST, process.env.SMTP_USER, process.env.SMTP_PASS), note: "Passwordless email sign-in delivery (dev-code fallback when off)" },
    { name: "Google OAuth", ok: configured(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET), note: "Continue with Google" },
    { name: "reCAPTCHA v3", ok: configured(process.env.RECAPTCHA_SECRET_KEY, process.env.RECAPTCHA_SITE_KEY), note: "Bot protection on register/callback" },
    { name: "AWS S3 / CloudFront", ok: configured(process.env.AWS_ACCESS_KEY_ID, process.env.S3_BUCKET_NAME), note: "Media uploads (add-by-URL when off)" },
    { name: "OpenAI (primary AI)", ok: configured(process.env.OPENAI_API_KEY), note: "Primary provider for tutor, chatbot, explain & review (§8)" },
    { name: "Google Gemini (fallback AI)", ok: configured(process.env.GEMINI_API_KEY), note: "Automatic fallback if OpenAI errors / 429 / times out" },
    { name: "Mux", ok: configured(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET), note: "Video streaming (Session 5)" },
  ];

  const aiOrder = (process.env.AI_PROVIDER_ORDER ?? "openai,gemini").trim();

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[10px] bg-brand/12 text-brand">
            <Flag className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-fg">Feature Flags</h2>
            <p className="text-xs text-fg-muted">
              Toggle features on or off live. Changes take effect within ~30s (faster on next page load).
            </p>
          </div>
        </div>
        <FeatureFlagsManager flags={flagRows} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-fg">Integrations</h2>
        <p className="text-sm text-fg-muted">
          Integration status. Missing keys degrade gracefully — fill them in{" "}
          <code className="text-fg">.env</code> (and re-deploy) to enable each feature.
        </p>
      <p className="text-sm text-fg-muted">
        AI provider fallback order:{" "}
        <code className="text-fg">{aiOrder}</code> — set via{" "}
        <code className="text-fg">AI_PROVIDER_ORDER</code>. Requests transparently fail over to
        the next provider on error, rate-limit, or timeout.
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
      </section>
    </div>
  );
}
