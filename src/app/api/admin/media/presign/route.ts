import { NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/server/session";
import { isS3Configured, getS3, publicUrlFor } from "@/lib/s3";

const schema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
});

// Returns a presigned S3 PUT URL (BUILD_SPEC §11) — or {configured:false}
// so the UI falls back to add-by-URL when AWS isn't set up.
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  if (!isS3Configured()) {
    return NextResponse.json({ configured: false });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ext = parsed.data.filename.split(".").pop() ?? "bin";
  const key = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: parsed.data.contentType,
  });
  const uploadUrl = await getSignedUrl(getS3(), command, { expiresIn: 300 });

  return NextResponse.json({
    configured: true,
    uploadUrl,
    publicUrl: publicUrlFor(key),
  });
}
