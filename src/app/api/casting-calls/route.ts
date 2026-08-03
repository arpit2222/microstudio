import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const castingCalls = await prisma.castingCall.findMany({
      where: { status: "OPEN" },
      include: {
        project: {
          select: { title: true, premise: true, creator: { select: { name: true } } }
        },
        _count: { select: { applications: true } }
      },
      orderBy: { id: "desc" }
    });
    return NextResponse.json({ castingCalls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { projectId, roleName, description, royaltyTerms } = await req.json();

    if (!projectId || !roleName || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const castingCall = await prisma.castingCall.create({
      data: {
        projectId,
        roleName,
        description,
        royaltyTerms,
        status: "OPEN"
      }
    });

    return NextResponse.json({ castingCall });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
