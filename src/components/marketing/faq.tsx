import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/site";

export function Faq() {
  return (
    <section className="container-page py-20 md:py-28">
      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Still unsure? Request a callback and our team will help you decide."
      />

      <Reveal className="mx-auto mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
