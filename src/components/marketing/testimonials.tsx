import { Star, Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Marquee } from "@/components/ui/marquee";
import { TESTIMONIALS } from "@/lib/site";

function TestimonialCard({
  t,
}: {
  t: (typeof TESTIMONIALS)[number];
}) {
  return (
    <figure className="flex w-[340px] shrink-0 flex-col gap-4 rounded-[18px] border border-border bg-bg-elevated p-6 sm:w-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} className="size-4 fill-brand text-brand" />
          ))}
        </div>
        <Quote className="size-6 text-border-strong" />
      </div>
      <blockquote className="text-sm leading-relaxed text-fg">
        “{t.quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-4">
        <span className="grid size-10 place-items-center rounded-full bg-bg-subtle text-sm font-semibold text-fg">
          {t.name[0]}
        </span>
        <div>
          <p className="text-sm font-semibold text-fg">{t.name}</p>
          <p className="text-xs text-fg-muted">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  return (
    <section className="overflow-hidden py-20 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Loved by learners"
          title="1M+ students. Thousands of careers changed."
          subtitle="Don't take our word for it — here's what our community says."
        />
      </div>

      <div className="mt-14 flex flex-col gap-5">
        <Marquee>
          {TESTIMONIALS.slice(0, half).map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee reverse>
          {TESTIMONIALS.slice(half).map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
