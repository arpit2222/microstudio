import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient, MediaAssetType } from "@prisma/client";

const prisma = new PrismaClient();

// Backblaze B2 S3-compatible API uses the standard S3 SDK
const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT_URL, // e.g. https://s3.us-west-004.backblazeb2.com
  region: process.env.B2_REGION || "us-west-004", // Standard B2 region format
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;

export interface ProvenanceMetadata {
  sourceModel: string;
  provider: string; // e.g., "Genblaze"
  prompt: string;
  timestamp: string;
}

/**
 * Uploads a generated asset to B2 and stores the metadata (and provenance) in our database.
 */
export async function uploadAsset(
  buffer: Buffer,
  key: string,
  contentType: string,
  projectId: string,
  type: MediaAssetType,
  provenance: ProvenanceMetadata
) {
  // 1. Upload to Backblaze B2 Object Storage
  const putCommand = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // Store provenance directly on the object metadata as well (for durability outside the DB)
    Metadata: {
      provenance: JSON.stringify(provenance),
    },
  });

  await s3Client.send(putCommand);

  // 2. Generate a public/signed URL
  const getCommand = new GetObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });
  
  // Signed URL valid for 1 hour (useful if bucket is private)
  const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
  
  // Public URL (if the bucket is configured as public)
  const publicUrl = `${process.env.B2_ENDPOINT_URL}/${B2_BUCKET_NAME}/${key}`;

  // 3. Save the asset record and provenance to our Database
  const mediaAsset = await prisma.mediaAsset.create({
    data: {
      projectId,
      type,
      b2Key: key,
      metadata: provenance as any, // Cast to any to satisfy Prisma Json input
    },
  });

  return {
    mediaAsset,
    signedUrl,
    publicUrl,
  };
}

/**
 * Retrieves the object metadata and provenance directly from B2 (without hitting our DB).
 */
export async function getAssetMetadata(key: string) {
  const headCommand = new HeadObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(headCommand);
    let provenance: ProvenanceMetadata | null = null;
    
    if (response.Metadata && response.Metadata.provenance) {
      provenance = JSON.parse(response.Metadata.provenance);
    }
    
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      provenance,
    };
  } catch (error) {
    console.error("Error fetching metadata from B2:", error);
    throw error;
  }
}

/**
 * Retrieves all MediaAssets for a specific project, merging DB records with fresh B2 Signed URLs.
 */
export async function listAssetsByProject(projectId: string) {
  const assets = await prisma.mediaAsset.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  });

  const assetsWithUrls = await Promise.all(
    assets.map(async (asset) => {
      const getCommand = new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: asset.b2Key,
      });
      // Generate fresh signed URL for each asset for frontend consumption
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
      
      return {
        ...asset,
        url: signedUrl
      };
    })
  );

  return assetsWithUrls;
}
