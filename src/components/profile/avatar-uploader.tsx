"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Camera, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { setAvatar } from "@/server/profile-actions";

export function AvatarUploader({
  name,
  avatarUrl,
  s3Configured,
}: {
  name: string;
  avatarUrl: string | null;
  s3Configured: boolean;
}) {
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const presign = await fetch("/api/profile/avatar/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }).then((r) => r.json());
      if (!presign.configured) {
        toast.error("S3 isn't configured — set your photo by URL instead.");
        return;
      }
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("upload failed");
      const res = await setAvatar(presign.publicUrl);
      if (res.ok) {
        toast.success("Photo updated");
        router.refresh();
      } else toast.error(res.error);
    } catch {
      toast.error("Upload failed. Try again or set by URL.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="size-24 overflow-hidden rounded-full border-2 border-brand/30 bg-bg-subtle">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} width={96} height={96} className="size-full object-cover" unoptimized />
          ) : (
            <div className="grid size-full place-items-center font-display text-2xl font-bold text-fg-muted">
              {initials}
            </div>
          )}
        </div>
        {s3Configured ? (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Change photo"
            className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-bg bg-brand text-white transition-colors hover:bg-brand-600"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          </button>
        ) : (
          <UrlDialog onSaved={() => router.refresh()} />
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
    </div>
  );
}

function UrlDialog({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function save() {
    setBusy(true);
    const res = await setAvatar(url);
    setBusy(false);
    if (res.ok) {
      toast.success("Photo updated");
      setOpen(false);
      onSaved();
    } else toast.error(res.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Set photo by URL"
          className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-bg bg-brand text-white hover:bg-brand-600"
        >
          <LinkIcon className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Set profile photo</DialogTitle>
        </DialogHeader>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… image URL" autoFocus />
        <Button onClick={save} disabled={busy} className="self-end">
          {busy ? <Loader2 className="size-4 animate-spin" /> : null} Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
