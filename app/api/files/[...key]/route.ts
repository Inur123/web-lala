import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  // 1. Protect: Only authenticated Admin can view uploaded files
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { key } = await params;
    const r2Key = key.join("/");

    // 2. Fetch the object from Cloudflare R2
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
    });

    const response = await s3.send(command);
    if (!response.Body) {
      return new Response("File Body Empty", { status: 404 });
    }

    // Convert readable stream to Blob
    const fileData = await response.Body.transformToByteArray();
    const fileBlob = new Blob([fileData.buffer as ArrayBuffer], { type: response.ContentType || "application/octet-stream" });

    // 3. Return the file as response with correct headers
    return new Response(fileBlob, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${r2Key.split("/").pop()}"`,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error reading file from R2:", error);
    return new Response("File Not Found", { status: 404 });
  }
}
