import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: applicationId } = params;

    const application = await prisma.castingApplication.findUnique({
      where: { id: applicationId },
      include: { castingCall: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Atomic transaction to accept the application, reject others, and close the call
    const [updatedApp, updatedCall] = await prisma.$transaction([
      prisma.castingApplication.update({
        where: { id: applicationId },
        data: { status: "ACCEPTED" }
      }),
      prisma.castingCall.update({
        where: { id: application.castingCallId },
        data: { status: "CLOSED" }
      }),
      // Reject all other pending applications for this call
      prisma.castingApplication.updateMany({
        where: { 
          castingCallId: application.castingCallId,
          id: { not: applicationId }
        },
        data: { status: "REJECTED" }
      })
    ]);

    return NextResponse.json({ success: true, application: updatedApp, castingCall: updatedCall });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
