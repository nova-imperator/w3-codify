"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Loader2,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Github,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Markdown } from "@/components/shared/markdown";
import { GenderSelect } from "@/components/shared/gender-select";
import type { Gender } from "@/lib/avatar";
import { AvatarUploader } from "./avatar-uploader";
import {
  updateBasicInfo,
  updateProfessional,
  addProject,
  deleteProject,
} from "@/server/profile-actions";

export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  dateOfBirth: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  avatarUrl: string | null;
  gender: Gender;
  jobTitle: string;
  company: string;
  experienceYears: string;
  college: string;
  degree: string;
  gradYear: string;
  skills: string[];
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  enrollments: {
    slug: string;
    title: string;
    type: string;
    status: string;
    isLive: boolean;
  }[];
  projects: {
    id: string;
    title: string;
    repoUrl: string | null;
    liveUrl: string | null;
    status: string;
    aiReview: string | null;
  }[];
};

type Section = "basic" | "professional" | "batches" | "projects";

const NAV: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "basic", label: "Basic Info", icon: User },
  { key: "professional", label: "Professional", icon: Briefcase },
  { key: "batches", label: "Your Batches", icon: GraduationCap },
  { key: "projects", label: "My Projects", icon: FolderGit2 },
];

export function ProfileClient({
  data,
  s3Configured,
}: {
  data: ProfileData;
  s3Configured: boolean;
}) {
  const [section, setSection] = React.useState<Section>("basic");
  // Lifted so the sidebar avatar reflects gender changes from Basic Info instantly.
  const [gender, setGender] = React.useState<Gender>(data.gender);
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Learner";
  const purchased = data.enrollments.filter((e) => e.type === "PAID").length;

  return (
    <div className="container-page grid gap-8 pb-16 pt-28 md:pt-32 lg:grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-border bg-bg-elevated p-6 text-center">
          <AvatarUploader name={fullName} avatarUrl={data.avatarUrl} gender={gender} s3Configured={s3Configured} />
          <div>
            <p className="font-display text-lg font-semibold">{fullName}</p>
            <Badge variant="brand" className="mt-1">STUDENT</Badge>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 pt-2">
            <Stat label="Purchased" value={purchased} />
            <Stat label="Enrolled" value={data.enrollments.length} />
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto rounded-[16px] border border-border bg-bg-elevated p-2 lg:flex-col">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setSection(n.key)}
              className={cn(
                "flex items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-colors",
                section === n.key ? "bg-brand/12 text-brand-glow" : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
              )}
            >
              <n.icon className="size-4.5" /> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        {section === "basic" && <BasicInfo data={data} gender={gender} onGenderChange={setGender} />}
        {section === "professional" && <Professional data={data} />}
        {section === "batches" && <Batches enrollments={data.enrollments} />}
        {section === "projects" && <Projects projects={data.projects} />}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] bg-bg-subtle p-3">
      <p className="font-display text-xl font-bold text-fg">{value}</p>
      <p className="text-xs text-fg-muted">{label}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[18px] border border-border bg-bg-elevated p-6">
      <h2 className="mb-5 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-fg-muted">{label}</label>
      {children}
    </div>
  );
}

function BasicInfo({
  data,
  gender,
  onGenderChange,
}: {
  data: ProfileData;
  gender: Gender;
  onGenderChange: (g: Gender) => void;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [busy, setBusy] = React.useState(false);
  const [f, setF] = React.useState(data);
  const set = (k: keyof ProfileData, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (f.firstName.trim().length < 1) return toast.error("First name is required.");
    setBusy(true);
    const res = await updateBasicInfo({
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      bio: f.bio,
      dateOfBirth: f.dateOfBirth,
      city: f.city,
      state: f.state,
      pincode: f.pincode,
      country: f.country,
      gender,
    });
    setBusy(false);
    if (res.ok) {
      // Keep the navbar avatar in sync without a re-login.
      await update({ gender });
      toast.success("Profile saved");
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Personal Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name"><Input value={f.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field label="Last Name"><Input value={f.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></Field>
          <Field label="Contact">
            <Input value={`+91 ${f.phone}`} disabled className="opacity-70" />
          </Field>
          <Field label="Date of Birth"><Input type="date" value={f.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Gender">
            <GenderSelect value={gender} onChange={onGenderChange} disabled={busy} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Bio">
            <textarea
              value={f.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={3}
              placeholder="Tell us about yourself…"
              className="w-full resize-y rounded-[12px] border border-border bg-bg-subtle px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-faint focus-visible:border-brand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </Field>
        </div>
      </Card>

      <Card title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City"><Input value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><Input value={f.state} onChange={(e) => set("state", e.target.value)} /></Field>
          <Field label="Pincode"><Input value={f.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
          <Field label="Country"><Input value={f.country} onChange={(e) => set("country", e.target.value)} /></Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
        </Button>
      </div>
    </div>
  );
}

function Professional({ data }: { data: ProfileData }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [f, setF] = React.useState(data);
  const [skills, setSkills] = React.useState(data.skills.join(", "));
  const set = (k: keyof ProfileData, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    setBusy(true);
    const res = await updateProfessional({
      jobTitle: f.jobTitle,
      company: f.company,
      experienceYears: f.experienceYears ? Number(f.experienceYears) : undefined,
      college: f.college,
      degree: f.degree,
      gradYear: f.gradYear ? Number(f.gradYear) : undefined,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      githubUrl: f.githubUrl,
      linkedinUrl: f.linkedinUrl,
      websiteUrl: f.websiteUrl,
    });
    setBusy(false);
    if (res.ok) {
      toast.success("Professional details saved");
      router.refresh();
    } else toast.error(res.error);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Work">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job Title"><Input value={f.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Frontend Developer" /></Field>
          <Field label="Company"><Input value={f.company} onChange={(e) => set("company", e.target.value)} /></Field>
          <Field label="Years of Experience"><Input type="number" min={0} value={f.experienceYears} onChange={(e) => set("experienceYears", e.target.value)} /></Field>
        </div>
      </Card>
      <Card title="Education">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="College / University"><Input value={f.college} onChange={(e) => set("college", e.target.value)} /></Field>
          <Field label="Degree"><Input value={f.degree} onChange={(e) => set("degree", e.target.value)} placeholder="e.g. B.Tech CSE" /></Field>
          <Field label="Graduation Year"><Input type="number" value={f.gradYear} onChange={(e) => set("gradYear", e.target.value)} placeholder="2025" /></Field>
        </div>
      </Card>
      <Card title="Skills & Links">
        <Field label="Skills (comma-separated)">
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Python, AWS" />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="GitHub"><Input value={f.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/…" /></Field>
          <Field label="LinkedIn"><Input value={f.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/…" /></Field>
          <Field label="Website"><Input value={f.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://…" /></Field>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={save} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
        </Button>
      </div>
    </div>
  );
}

function Batches({ enrollments }: { enrollments: ProfileData["enrollments"] }) {
  return (
    <Card title="Your Batches">
      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <GraduationCap className="size-8 text-fg-faint" />
          <p className="text-sm text-fg-muted">You haven&apos;t enrolled in any courses yet.</p>
          <Button asChild variant="secondary" size="sm"><Link href="/courses">Browse courses</Link></Button>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {enrollments.map((e) => (
            <li key={e.slug} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <Link href={`/courses/${e.slug}`} className="font-medium text-fg hover:text-brand-glow">{e.title}</Link>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={e.type === "PAID" ? "brand" : "default"}>{e.type === "PAID" ? "Purchased" : "Free"}</Badge>
                  {e.isLive && <LiveBadge />}
                </div>
              </div>
              <Button asChild size="sm" variant="secondary"><Link href="/classroom">Continue</Link></Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Projects({ projects }: { projects: ProfileData["projects"] }) {
  const router = useRouter();
  const [list, setList] = React.useState(projects);
  const [title, setTitle] = React.useState("");
  const [repoUrl, setRepoUrl] = React.useState("");
  const [liveUrl, setLiveUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function add() {
    if (title.trim().length < 2) return toast.error("Enter a project title.");
    setBusy(true);
    const res = await addProject({ title, repoUrl, liveUrl });
    setBusy(false);
    if (res.ok) {
      toast.success("Project added");
      setTitle(""); setRepoUrl(""); setLiveUrl("");
      router.refresh();
    } else toast.error(res.error);
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    setList((l) => l.filter((p) => p.id !== id));
    const res = await deleteProject(id);
    if (res.ok) router.refresh();
    else toast.error(res.error);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card title="Submit a Project">
        <div className="flex flex-col gap-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="Repo URL (https://github.com/…)" />
            <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="Live URL (optional)" />
          </div>
          <Button onClick={add} disabled={busy} className="self-start">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add project
          </Button>
        </div>
      </Card>

      <Card title="My Projects">
        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-fg-muted">No projects yet — submit your first above.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {list.map((p) => (
              <ProjectItem key={p.id} project={p} onRemove={() => remove(p.id)} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ProjectItem({
  project,
  onRemove,
}: {
  project: ProfileData["projects"][number];
  onRemove: () => void;
}) {
  const [review, setReview] = React.useState<string | null>(project.aiReview);
  const [reviewing, setReviewing] = React.useState(false);

  async function getReview() {
    setReviewing(true);
    setReview("");
    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "Could not review.");
        setReview(project.aiReview);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setReview(acc);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setReviewing(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-fg">{project.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
            <Badge variant="default">{project.status}</Badge>
            {project.repoUrl && <a href={project.repoUrl} target="_blank" className="inline-flex items-center gap-1 text-fg-muted hover:text-fg"><Github className="size-3.5" /> Repo</a>}
            {project.liveUrl && <a href={project.liveUrl} target="_blank" className="inline-flex items-center gap-1 text-fg-muted hover:text-fg"><ExternalLink className="size-3.5" /> Live</a>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm" onClick={getReview} disabled={reviewing}>
            {reviewing ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
            {review ? "Re-review" : "AI review"}
          </Button>
          <button onClick={onRemove} aria-label="Delete project" className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-[#fb7185]">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {review && (
        <div className="rounded-[12px] border border-brand/20 bg-brand/[0.04] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" /> AI Review
          </p>
          <Markdown text={review} />
        </div>
      )}
    </li>
  );
}
