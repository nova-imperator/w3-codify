import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { requireAdmin } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY (FEATURE_observability) — admin-only Sentry smoke test. Captures a
 * test exception and returns its event id so you can confirm it lands in the
 * Sentry dashboard. Remove this route before the final ship.
 *
 * GET /api/debug/sentry-test
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  if (!process.env.SENTRY_DSN) {
    return NextResponse.json(
      { ok: false, error: "SENTRY_DSN not set — Sentry is dormant." },
      { status: 503 },
    );
  }

  const eventId = Sentry.captureException(
    new Error("Sentry server test — /api/debug/sentry-test"),
  );
  // Make sure the event is flushed before the serverless invocation ends.
  await Sentry.flush(2000);

  return NextResponse.json({ ok: true, eventId });
}
