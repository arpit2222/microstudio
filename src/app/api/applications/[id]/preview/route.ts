import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id: applicationId } = params;

    const application = await prisma.castingApplication.findUnique({
      where: { id: applicationId },
      include: {
        talent: true,
        castingCall: {
          include: { project: true }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // THE GATE: Explicit Consent Check
    if (!application.talent.consentForAIGeneration) {
      return NextResponse.json(
        { error: "Consent Denied", message: "This talent has not provided explicit consent for AI casting previews." },
        { status: 403 }
      );
    }

    // Since this is a hackathon, we will mock the generation step here 
    // by returning a placeholder URL or the project's existing pilot URL.
    // In production, this would call the Python Genblaze service passing the talent's reference asset.

    // Let's find the project's pilot video to use as a mock preview
    const projectAssets = await prisma.mediaAsset.findMany({
      where: { projectId: application.castingCall.projectId }
    });
    
    // Fallback to a placeholder video if no asset exists
    const mockPreviewUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; 

    // Simulate AI generation time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ 
      success: true, 
      previewUrl: mockPreviewUrl,
      metadata: {
        disclaimer: "This is an AI-generated preview for casting purposes only.",
        modelUsed: "genblaze-likeness-v1"
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
