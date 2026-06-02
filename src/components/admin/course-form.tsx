"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminCard } from "@/components/admin/ui";
import { createCourse, updateCourse } from "@/server/admin/actions";

type Instructor = { id: string; name: string };
type Initial = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  previewVideo: string;
  priceInr: number;
  mrpInr: number;
  isLive: boolean;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
  outcomes: string[];
  requirements: string[];
  instructorIds: string[];
};

const EMPTY: Initial = {
  title: "",
  subtitle: "",
  description: "",
  thumbnail: "",
  previewVideo: "",
  priceInr: 0,
  mrpInr: 0,
  isLive: false,
  level: "ADVANCED",
  tags: [],
  outcomes: [],
  requirements: [],
  instructorIds: [],
};

export function CourseForm({
  instructors,
  initial,
}: {
  instructors: Instructor[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [f, setF] = React.useState<Initial>(initial ?? EMPTY);
  const isEdit = !!initial?.id;

  const set = <K extends keyof Initial>(k: K, v: Initial[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.title.trim().length < 3) return toast.error("Title is too short.");
    if (f.description.trim().length < 10) return toast.error("Add a longer description.");

    const payload = {
      ...f,
      tags: f.tags.map((t) => t.trim()).filter(Boolean),
      outcomes: f.outcomes.map((t) => t.trim()).filter(Boolean),
      requirements: f.requirements.map((t) => t.trim()).filter(Boolean),
    };

    start(async () => {
      if (isEdit && initial?.id) {
        const res = await updateCourse(initial.id, payload);
        if (res.ok) {
          toast.success("Course saved");
          router.refresh();
        } else toast.error(res.error);
      } else {
        const res = await createCourse(payload);
        if (res.ok && res.data) {
          toast.success("Course created");
          router.push(`/admin/courses/${res.data.id}`);
        } else if (!res.ok) toast.error(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <AdminCard className="flex flex-col gap-4 p-5">
        <h3 className="font-semibold text-fg">Basics</h3>
        <Field label="Title" required>
          <Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Machine Learning & Deep Learning" />
        </Field>
        <Field label="Subtitle">
          <Input value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="One-line hook shown on cards" />
        </Field>
        <Field label="Description" required>
          <textarea
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            placeholder="Full course description…"
            className="w-full resize-y rounded-[12px] border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Level">
            <Select value={f.level} onChange={(v) => set("level", v as Initial["level"])} options={["BEGINNER", "INTERMEDIATE", "ADVANCED"]} />
          </Field>
          <Field label="Price (₹)">
            <Input type="number" min={0} value={f.priceInr} onChange={(e) => set("priceInr", Number(e.target.value))} />
          </Field>
          <Field label="MRP (₹)">
            <Input type="number" min={0} value={f.mrpInr} onChange={(e) => set("mrpInr", Number(e.target.value))} />
          </Field>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-fg-muted">
          <Checkbox checked={f.isLive} onCheckedChange={(v) => set("isLive", !!v)} />
          This is a live cohort
        </label>
      </AdminCard>

      <AdminCard className="flex flex-col gap-4 p-5">
        <h3 className="font-semibold text-fg">Content & media</h3>
        <Field label="Tags (comma-separated)">
          <Input
            value={f.tags.join(", ")}
            onChange={(e) => set("tags", e.target.value.split(","))}
            placeholder="GenAI, Python, Deep Learning"
          />
        </Field>
        <Field label="What you'll learn (one per line)">
          <Lines value={f.outcomes} onChange={(v) => set("outcomes", v)} placeholder={"Build deep neural networks\nFine-tune LLMs"} />
        </Field>
        <Field label="Requirements (one per line)">
          <Lines value={f.requirements} onChange={(v) => set("requirements", v)} placeholder={"Comfortable with Python\nBasic math"} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Thumbnail URL">
            <Input value={f.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} placeholder="/images/courses/…png or https://…" />
          </Field>
          <Field label="Preview video URL">
            <Input value={f.previewVideo} onChange={(e) => set("previewVideo", e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </AdminCard>

      <AdminCard className="flex flex-col gap-3 p-5">
        <h3 className="font-semibold text-fg">Instructors</h3>
        {instructors.length === 0 ? (
          <p className="text-sm text-fg-muted">No instructors yet — add some in the Instructors tab.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {instructors.map((i) => {
              const checked = f.instructorIds.includes(i.id);
              return (
                <label key={i.id} className="flex items-center gap-2.5 rounded-[10px] border border-border bg-bg-subtle px-3 py-2 text-sm text-fg-muted">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      set(
                        "instructorIds",
                        v
                          ? [...f.instructorIds, i.id]
                          : f.instructorIds.filter((x) => x !== i.id),
                      )
                    }
                  />
                  {i.name}
                </label>
              );
            })}
          </div>
        )}
      </AdminCard>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
          {isEdit ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg-muted">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-[12px] border border-border bg-bg-subtle px-3.5 text-sm text-fg focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.charAt(0) + o.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}

function Lines({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <textarea
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      rows={4}
      placeholder={placeholder}
      className="w-full resize-y rounded-[12px] border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    />
  );
}
