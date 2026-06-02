"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MediaItem = { id: string; url: string; alt: string | null };

export function MediaPicker({
  media,
  selectedId,
  onSelect,
  trigger,
}: {
  media: MediaItem[];
  selectedId?: string | null;
  onSelect: (item: MediaItem) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Choose an image</DialogTitle>
        </DialogHeader>
        {media.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ImageIcon className="size-8 text-fg-faint" />
            <p className="text-sm text-fg-muted">
              No media yet. Add images in the Media library first.
            </p>
            <Button asChild variant="secondary" size="sm">
              <a href="/admin/media" target="_blank">Open Media library</a>
            </Button>
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {media.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m);
                  setOpen(false);
                }}
                className={cn(
                  "group relative aspect-video overflow-hidden rounded-[10px] border bg-bg-subtle",
                  selectedId === m.id ? "border-brand" : "border-border hover:border-border-strong",
                )}
              >
                <Image src={m.url} alt={m.alt ?? ""} fill className="object-cover" unoptimized />
                {selectedId === m.id && (
                  <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-brand text-white">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
