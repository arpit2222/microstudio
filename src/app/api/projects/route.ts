import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { title, premise } = await req.json();

    if (!title || !premise) {
      return NextResponse.json({ error: "Missing title or premise" }, { status: 400 });
    }

    // Temporary hack for hackathon: grab any user, or create one if db is empty
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Demo Creator",
          role: "CREATOR",
          bio: "I make awesome pilots."
        }
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        premise,
        creatorId: user.id,
        status: "PILOT",
      }
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
