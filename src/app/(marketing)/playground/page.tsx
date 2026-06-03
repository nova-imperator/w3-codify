import type { Metadata } from "next";
import { Code2 } from "lucide-react";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Code Playground",
  description: "A free online code playground — write and run Python & JavaScript in your browser, no setup. Share snippets via link.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <main id="main" className="container-page pb-16 pt-28 md:pt-32">
      <div className="mb-6 flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          <Code2 className="size-4" /> Playground
        </span>
        <h1 className="text-[length:var(--text-display-sm)] font-semibold">Write &amp; run code, instantly.</h1>
        <p className="max-w-2xl text-fg-muted">
          A free scratchpad running on a sandboxed engine — pick a language, hit Run, and share your
          snippet with a link. Python &amp; JavaScript today, more soon.
        </p>
      </div>
      <Playground />
    </main>
  );
}
