import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: castingCallId } = params;

    // Temporary hack for hackathon: grab or create a default talent user
    let talentUser = await prisma.user.findFirst({ where: { role: "TALENT" } });
    if (!talentUser) {
      talentUser = await prisma.user.create({
        data: { name: "Demo Talent", role: "TALENT", bio: "Ready to act!" }
      });
    }

    let talentProfile = await prisma.talentProfile.findUnique({ where: { userId: talentUser.id } });
    if (!talentProfile) {
      talentProfile = await prisma.talentProfile.create({
        data: {
          userId: talentUser.id,
          skills: ["Acting", "Voiceover"],
          bio: "Experienced in drama and sci-fi.",
        }
      });
    }

    // Check if application already exists
    const existing = await prisma.castingApplication.findFirst({
      where: { castingCallId, talentId: talentProfile.id }
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const application = await prisma.castingApplication.create({
      data: {
        castingCallId,
        talentId: talentProfile.id,
        status: "PENDING",
      }
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
