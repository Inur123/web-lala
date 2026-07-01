import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// Singleton S3 client pointing to Cloudflare R2
const globalForR2 = globalThis as unknown as { r2Client: S3Client | undefined };

export const r2Client =
  globalForR2.r2Client ??
  new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForR2.r2Client = r2Client;
}

/**
 * Upload a file buffer to Cloudflare R2
 * @param key - path di R2, misal: registrations/uuid/sertifikatMakesta.pdf
 * @param body - file buffer
 * @param contentType - MIME type file
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Return the R2 key (bisa digunakan untuk construct public URL)
  return key;
}

/**
 * Get public URL for an R2 object
 * Only works if Public Dev URL is enabled on the bucket
 */
export function getR2PublicUrl(key: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return null;
  return `${publicUrl}/${key}`;
}
