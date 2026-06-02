"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCard, EmptyState } from "@/components/admin/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveInstructor, deleteInstructor } from "@/server/admin/actions";

type Instructor = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
  courses: number;
};

export function InstructorsManager({ instructors }: { instructors: Instructor[] }) {
  const router = useRouter();

  function remove(id: string, name: string, courses: number) {
    if (courses > 0) return toast.error(`${name} is linked to ${courses} course(s). Unassign first.`);
    if (!confirm(`Delete ${name}?`)) return;
    deleteInstructor(id).then((res) => {
      if (res.ok) {
        toast.success("Instructor deleted");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{instructors.length} instructors</p>
        <InstructorDialog onSaved={() => router.refresh()} trigger={<Button><Plus className="size-4" /> Add instructor</Button>} />
      </div>

      {instructors.length === 0 ? (
        <EmptyState icon={Users} title="No instructors yet" description="Add mentors so you can assign them to courses." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {instructors.map((i) => (
            <AdminCard key={i.id} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bg-subtle font-display font-bold text-fg">
                  {i.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-fg">{i.name}</p>
                  {i.role && <p className="truncate text-xs text-brand">{i.role}</p>}
                </div>
              </div>
              {i.bio && <p className="line-clamp-2 text-sm text-fg-muted">{i.bio}</p>}
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-fg-faint">{i.courses} course(s)</span>
                <div className="flex gap-1">
                  <InstructorDialog
                    initial={i}
                    onSaved={() => router.refresh()}
                    trigger={
                      <button aria-label="Edit" className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-fg">
                        <Pencil className="size-4" />
                      </button>
                    }
                  />
                  <button onClick={() => remove(i.id, i.name, i.courses)} aria-label="Delete" className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-[#ff6b6b]">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorDialog({
  initial,
  onSaved,
  trigger,
}: {
  initial?: Instructor;
  onSaved: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(initial?.name ?? "");
  const [role, setRole] = React.useState(initial?.role ?? "");
  const [bio, setBio] = React.useState(initial?.bio ?? "");
  const [photo, setPhoto] = React.useState(initial?.photo ?? "");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (name.trim().length < 2) return toast.error("Enter a name.");
    setSaving(true);
    const res = await saveInstructor(initial?.id ?? null, { name, role, bio, photo });
    setSaving(false);
    if (res.ok) {
      toast.success(initial ? "Instructor updated" : "Instructor added");
      setOpen(false);
      onSaved();
    } else toast.error(res.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit instructor" : "Add instructor"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role (e.g. AI Lead · ex-Google)" />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Short bio"
            className="w-full resize-y rounded-[12px] border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Input value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="Photo URL (optional)" />
          <Button onClick={save} disabled={saving} className="self-end">
            {saving ? <Loader2 className="animate-spin" /> : null}
            {initial ? "Save" : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
