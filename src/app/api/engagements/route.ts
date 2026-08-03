import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { projectId, type } = await req.json(); // type: "LIKE" | "COMMENT" | "SHARE"

    if (!projectId || !type) {
      return NextResponse.json({ error: "Missing projectId or type" }, { status: 400 });
    }

    // Temporary hack for hackathon: grab a default user to act as the "liker"
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: "Demo User", role: "VIEWER" }
      });
    }

    // Wrap in a transaction to ensure score and engagement are updated atomically
    const [engagement, project] = await prisma.$transaction([
      // 1. Create the engagement record
      prisma.engagement.create({
        data: {
          projectId,
          userId: user.id,
          type,
        }
      }),
      // 2. Increment the engagement score
      prisma.project.update({
        where: { id: projectId },
        data: {
          engagementScore: { increment: 1 }
        }
      })
    ]);

    return NextResponse.json({ success: true, engagementScore: project.engagementScore });
  } catch (error: any) {
    console.error("Error creating engagement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
