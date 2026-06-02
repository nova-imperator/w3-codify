"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, MoreVertical, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { setCourseStatus, deleteCourse } from "@/server/admin/actions";

export function CourseRowActions({
  id,
  slug,
  status,
  title,
}: {
  id: string;
  slug: string;
  status: string;
  title: string;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const published = status === "PUBLISHED";

  function toggle() {
    start(async () => {
      const res = await setCourseStatus(id, published ? "DRAFT" : "PUBLISHED");
      if (res.ok) {
        toast.success(published ? "Unpublished" : "Published");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function remove() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteCourse(id);
      if (res.ok) {
        toast.success("Course deleted");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href={`/admin/courses/${id}`}>
          <Pencil className="size-3.5" /> Edit
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9" disabled={pending} aria-label="More actions">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggle}>
            {published ? <EyeOff /> : <Eye />}
            {published ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          {published && (
            <DropdownMenuItem asChild>
              <Link href={`/courses/${slug}`} target="_blank">
                <ExternalLink /> View live
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={remove} className="text-[#ff6b6b] focus:bg-[#ff3b3b]/10">
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
