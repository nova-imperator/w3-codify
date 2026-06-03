"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, LinkIcon, Trash2, Loader2, Copy, ImageIcon } from "lucide-react";
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
import { createMedia, deleteMedia } from "@/server/admin/actions";

type Asset = {
  id: string;
  url: string;
  alt: string | null;
  kind: string;
  tags: string[];
  usage: number;
};

export function MediaManager({ assets }: { assets: Asset[] }) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const presign = await fetch("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      }).then((r) => r.json());

      if (!presign.configured) {
        toast.error("S3 isn't configured — add images by URL instead.");
        return;
      }
      const put = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("upload failed");
      const res = await createMedia({ url: presign.publicUrl, kind: "image", alt: file.name, tags: [] });
      if (res.ok) {
        toast.success("Uploaded");
        router.refresh();
      } else toast.error(res.error);
    } catch {
      toast.error("Upload failed. Try again or add by URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(id: string, usage: number) {
    if (usage > 0 && !confirm("This image is used in lessons. Delete anyway?")) return;
    if (usage === 0 && !confirm("Delete this media?")) return;
    deleteMedia(id).then((res) => {
      if (res.ok) {
        toast.success("Deleted");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">{assets.length} assets</p>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload className="size-4" />}
            Upload
          </Button>
          <AddByUrl onAdded={() => router.refresh()} />
        </div>
      </div>

      {assets.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media yet" description="Upload to S3 (when configured) or add images by URL — including your Whisk renders.">
          <AddByUrl onAdded={() => router.refresh()} />
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => (
            <AdminCard key={a.id} className="group overflow-hidden">
              <div className="relative aspect-video bg-bg-subtle">
                <Image src={a.url} alt={a.alt ?? ""} fill className="object-cover" unoptimized />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-xs text-fg-muted" title={a.alt ?? a.url}>
                  {a.usage > 0 ? `Used in ${a.usage}` : "Unused"}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(a.url);
                      toast.success("URL copied");
                    }}
                    aria-label="Copy URL"
                    className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-fg"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <button
                    onClick={() => remove(a.id, a.usage)}
                    aria-label="Delete"
                    className="grid size-7 place-items-center rounded-md text-fg-muted hover:bg-bg-subtle hover:text-[#fb7185]"
                  >
                    <Trash2 className="size-3.5" />
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

function AddByUrl({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function save() {
    if (!/^https?:\/\//.test(url) && !url.startsWith("/")) {
      toast.error("Enter a valid URL.");
      return;
    }
    setSaving(true);
    const res = await createMedia({ url, alt, kind: "image", tags: [] });
    setSaving(false);
    if (res.ok) {
      toast.success("Added to library");
      setOpen(false);
      setUrl("");
      setAlt("");
      onAdded();
    } else toast.error(res.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <LinkIcon className="size-4" /> Add by URL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add image by URL</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or /images/…" autoFocus />
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (for accessibility)" />
          <Button onClick={save} disabled={saving} className="self-end">
            {saving ? <Loader2 className="animate-spin" /> : null}
            Add to library
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
