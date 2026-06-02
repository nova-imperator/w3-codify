import { S3Client } from "@aws-sdk/client-s3";

/** True only when real (non-placeholder) AWS creds + bucket are present. */
export function isS3Configured(): boolean {
  const key = process.env.AWS_ACCESS_KEY_ID ?? "";
  const secret = process.env.AWS_SECRET_ACCESS_KEY ?? "";
  const bucket = process.env.S3_BUCKET_NAME ?? "";
  const filled = (v: string) => !!v && !v.includes("<") && !v.includes("FILL_ME");
  return filled(key) && filled(secret) && filled(bucket);
}

let client: S3Client | null = null;
export function getS3(): S3Client {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION ?? process.env.AWS_REGION ?? "ap-south-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return client;
}

/** Public URL for an S3 object key (CloudFront if set, else S3 path). */
export function publicUrlFor(key: string): string {
  const cdn = process.env.CLOUDFRONT_URL;
  if (cdn) return `${cdn.replace(/\/$/, "")}/${key}`;
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION ?? process.env.AWS_REGION ?? "ap-south-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
