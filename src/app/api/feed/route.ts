import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { listAssetsByProject } from "@/lib/storage/b2";

const prisma = new PrismaClient();

// In Next.js App Router, dynamic routes need to be forced dynamic if they rely on changing DB data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch projects with PILOT or PRODUCED status, ordered by engagement and recency
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ["PILOT", "PRODUCED"],
        },
      },
      include: {
        creator: true,
        _count: {
          select: { engagements: true }
        }
      },
      orderBy: [
        { engagementScore: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20, // Load first 20 for the feed
    });

    // For each project, fetch its signed URLs from B2
    const feedItems = await Promise.all(
      projects.map(async (project) => {
        // Use our existing B2 utility to get assets with fresh signed URLs
        const assets = await listAssetsByProject(project.id);
        
        // Find the final video (we saved the final pilot with "pilot_" in B2 Key)
        const finalAsset = assets.find(a => a.b2Key.includes("pilot_")) || assets.find(a => a.type === "VIDEO");

        return {
          ...project,
          videoUrl: finalAsset?.url || null,
          commentCount: Math.floor(Math.random() * 100), // Mock comment count for demo aesthetics
          likeCount: project.engagementScore
        };
      })
    );

    // Filter out items that couldn't resolve a video URL
    const validFeedItems = feedItems.filter(item => item.videoUrl !== null);

    return NextResponse.json({ feed: validFeedItems });
  } catch (error: any) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
