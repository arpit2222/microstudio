import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: projectId } = params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        castingCalls: {
          include: {
            applications: {
              include: {
                talent: {
                  include: { user: true }
                }
              }
            }
          }
        }
      }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ project });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
