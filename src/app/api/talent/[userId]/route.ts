import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT_URL,
  region: process.env.B2_REGION || "us-west-004",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;

export async function GET(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const { userId } = params;
    const profile = await prisma.talentProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        reelAsset: true,
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Talent profile not found" }, { status: 404 });
    }

    let reelUrl = null;
    if (profile.reelAsset) {
      const command = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: profile.reelAsset.b2Key,
      });
      reelUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }

    return NextResponse.json({
      profile: {
        ...profile,
        reelUrl,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  try {
    const { userId } = params;
    const { consentForAIGeneration } = await req.json();

    const updated = await prisma.talentProfile.update({
      where: { userId },
      data: { consentForAIGeneration }
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
