import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: projectId } = params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { mediaAssets: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "PRODUCED" && project.status !== "PILOT") {
      return NextResponse.json({ error: "Project must be produced to generate a promo" }, { status: 400 });
    }

    // Mock AI Promo Generation
    // In production, this would send the original VIDEO asset to Genblaze to cut a highlight.
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save the mock generated trailer asset
    // We'll use a placeholder video that represents the 30s cut with captions.
    const promoAsset = await prisma.mediaAsset.create({
      data: {
        projectId,
        type: "TRAILER",
        b2Key: `promo_${projectId}_${Date.now()}.mp4`, // Fake key for hackathon
        metadata: {
          generatedBy: "Genblaze Promo Engine",
          sourceModel: "genblaze-highlight-v2",
          duration: "30s",
          captions: true
        }
      }
    });

    return NextResponse.json({ success: true, asset: promoAsset });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
