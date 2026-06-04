import { Wrench } from "lucide-react";
import { SITE } from "@/lib/site";

/** Full-page maintenance interstitial shown to non-admins when maintenance_mode is on. */
export function MaintenanceScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 py-16">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <span className="bg-accent-grad grid size-16 place-items-center rounded-2xl text-white shadow-[0_12px_40px_-8px_rgba(109,94,246,0.6)]">
          <Wrench className="size-7" />
        </span>
        <h1 className="font-display text-3xl font-bold text-fg">We&apos;ll be right back</h1>
        <p className="text-fg-muted">
          {SITE.name} is down for a quick spot of maintenance. We&apos;re making things better and
          will be back online shortly — thanks for your patience.
        </p>
        <p className="text-sm text-fg-faint">
          Need help in the meantime? Email{" "}
          <a href="mailto:hello@w3codify.com" className="font-medium text-brand hover:underline">
            hello@w3codify.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
