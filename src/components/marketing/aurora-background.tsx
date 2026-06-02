import { cn } from "@/lib/utils";

/**
 * Pure-CSS animated aurora + grid backdrop (§6.1.2). GPU-only transforms,
 * non-blocking (no JS, no images), and frozen under reduced-motion via the
 * global media query. Sits behind hero content.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* molten blobs */}
      <div className="animate-aurora absolute -left-[10%] top-[-20%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(255,90,31,0.35),transparent_60%)] blur-3xl" />
      <div className="animate-aurora absolute right-[-5%] top-[10%] h-[45vh] w-[45vh] rounded-full bg-[radial-gradient(circle,rgba(255,122,60,0.22),transparent_60%)] blur-3xl [animation-delay:-6s]" />
      <div className="animate-aurora absolute bottom-[-15%] left-[30%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(224,54,10,0.18),transparent_60%)] blur-3xl [animation-delay:-12s]" />
      {/* grid */}
      <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
      {/* vignette to keep text legible */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg)_92%)]" />
    </div>
  );
}
