import { AlertTriangle } from "lucide-react";
import { isFeatureEnabled } from "@/server/flags";
import { getCurrentUser } from "@/server/session";
import { MaintenanceScreen } from "./maintenance-screen";

/**
 * Gate the public/app surface behind `maintenance_mode`. When the flag is off
 * (the common case) it reads only the cached flag, so pages stay statically
 * renderable. When on, non-admins see the maintenance screen; admins get the
 * normal site plus a banner. `/auth/*` and `/admin/*` aren't wrapped, so admins
 * can always sign in and manage the site.
 */
export async function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const on = await isFeatureEnabled("maintenance_mode");
  if (!on) return <>{children}</>;

  // Reading the session opts this render into dynamic mode — fine, the site is
  // intentionally "down" while maintenance is on.
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return <MaintenanceScreen />;

  return (
    <>
      <div className="sticky top-0 z-[60] flex items-center justify-center gap-2 bg-[#f5a623] px-4 py-2 text-center text-xs font-semibold text-black">
        <AlertTriangle className="size-4" />
        Maintenance mode is ON — only admins can see the site. Toggle it off in Settings.
      </div>
      {children}
    </>
  );
}
