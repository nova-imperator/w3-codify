import { getAdminMedia } from "@/server/admin/queries";
import { MediaManager } from "@/components/admin/media-manager";
import { isS3Configured } from "@/lib/s3";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await getAdminMedia();
  const assets = media.map((m) => ({
    id: m.id,
    url: m.url,
    alt: m.alt,
    kind: m.kind,
    tags: m.tags,
    usage: m._count.blocks,
  }));

  return (
    <div className="flex flex-col gap-4">
      {!isS3Configured() && (
        <div className="rounded-[12px] border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-fg-muted">
          S3 isn&apos;t configured yet — uploads are disabled. You can still{" "}
          <span className="font-medium text-fg">add images by URL</span> (e.g. your
          CloudFront/Whisk renders). Add AWS keys to <code className="text-fg">.env</code> to enable direct uploads.
        </div>
      )}
      <MediaManager assets={assets} />
    </div>
  );
}
