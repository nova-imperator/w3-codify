import { Linkedin, Twitter } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup } from "@/components/ui/reveal";
import { SmartImage } from "@/components/shared/smart-image";
import { INSTRUCTORS } from "@/lib/site";

export function Instructors() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="Mentors"
        title="Learn from engineers who've built at scale"
        subtitle="Not just teachers — practitioners who've shipped to millions and now coach you through it."
      />

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {INSTRUCTORS.map((person, i) => (
          <Reveal key={person.name} delayIndex={i}>
            <article className="group overflow-hidden rounded-[20px] border border-border bg-bg-elevated transition-colors hover:border-border-strong">
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={person.image}
                  alt={person.name}
                  sizes="(max-width: 768px) 90vw, 380px"
                  className="grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                >
                  <span className="absolute bottom-4 left-5 font-display text-4xl font-bold text-white/90">
                    {person.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </SmartImage>
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{person.name}</h3>
                    <p className="text-sm text-brand">{person.role}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <a
                      href="#"
                      aria-label={`${person.name} on LinkedIn`}
                      className="grid size-8 place-items-center rounded-lg border border-border text-fg-muted transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      <Linkedin className="size-4" />
                    </a>
                    <a
                      href="#"
                      aria-label={`${person.name} on X`}
                      className="grid size-8 place-items-center rounded-lg border border-border text-fg-muted transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      <Twitter className="size-4" />
                    </a>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-fg-muted">
                  {person.bio}
                </p>
              </div>
            </article>
          </Reveal>
        ))}
      </RevealGroup>
    </section>
  );
}
