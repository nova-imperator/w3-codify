import { NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getCurrentUser } from "@/server/session";
import { isS3Configured, getS3, publicUrlFor } from "@/lib/s3";

const schema = z.object({ filename: z.string().min(1).max(200), contentType: z.string().min(1).max(120) });

// Presigned S3 PUT for the signed-in user's avatar (§9). {configured:false} when S3 is off.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!isS3Configured()) return NextResponse.json({ configured: false });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const ext = parsed.data.filename.split(".").pop() ?? "jpg";
  const key = `avatars/${user.id}-${Date.now()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    getS3(),
    new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key, ContentType: parsed.data.contentType }),
    { expiresIn: 300 },
  );
  return NextResponse.json({ configured: true, uploadUrl, publicUrl: publicUrlFor(key) });
}
