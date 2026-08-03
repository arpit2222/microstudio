import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { listAssetsByProject } from "@/lib/storage/b2";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: projectId } = params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: true,
      }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Use our B2 utility to get assets with fresh signed URLs
    const assets = await listAssetsByProject(projectId);
    
    // Attempt to identify the main video (either TRAILER or VIDEO)
    const mainVideo = assets.find(a => a.type === "TRAILER") || assets.find(a => a.type === "VIDEO") || assets[0];

    return NextResponse.json({ 
      project,
      assets,
      mainVideo
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
