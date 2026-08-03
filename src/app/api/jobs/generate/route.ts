import { NextResponse } from "next/server";
import { uploadAsset } from "@/lib/storage/b2";

export async function POST(req: Request) {
  try {
    const { projectId, premise } = await req.json();

    if (!projectId || !premise) {
      return NextResponse.json({ error: "Missing projectId or premise" }, { status: 400 });
    }

    // 1. Call the internal Python FastAPI service to generate all assets
    // Built-in Retry & Fallback Logic for resilience
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";
    let response;
    let retries = 2;
    let lastError = "";

    while (retries > 0) {
      try {
        response = await fetch(`${pythonServiceUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ premise }),
          signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined
        });

        if (response.ok) break;
        lastError = `HTTP ${response.status}: ${await response.text()}`;
      } catch (err: any) {
        lastError = err.message;
        console.warn(`Generation attempt failed. Retries left: ${retries - 1}. Error:`, err.message);
      }
      
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second backoff
      }
    }

    if (!response || !response.ok) {
      console.error("Python service error after all retries:", lastError);
      return NextResponse.json({ 
        error: "Generation pipeline timed out or failed to connect to Genblaze providers. Please try again." 
      }, { status: 503 });
    }

    const data = await response.json();

    // Helper to upload a base64 string to B2
    const uploadBase64ToB2 = async (base64Str: string, keySuffix: string, contentType: string, type: any, metadata: any) => {
      const buffer = Buffer.from(base64Str, "base64");
      const key = `projects/${projectId}/${keySuffix}`;
      return await uploadAsset(buffer, key, contentType, projectId, type, metadata);
    };

    // Helper to upload a text string to B2
    const uploadTextToB2 = async (text: string, keySuffix: string, type: any, metadata: any) => {
      const buffer = Buffer.from(text, "utf-8");
      const key = `projects/${projectId}/${keySuffix}`;
      return await uploadAsset(buffer, key, "text/plain", projectId, type, metadata);
    };

    console.log("Uploading generated assets to Backblaze B2...");

    // 2. Upload Script
    const scriptAsset = await uploadTextToB2(
      data.script.content,
      `script_${Date.now()}.txt`,
      "SCRIPT",
      data.script.metadata
    );

    // 3. Upload Raw Video
    const videoAsset = await uploadBase64ToB2(
      data.video.content,
      `raw_video_${Date.now()}.mp4`,
      data.video.contentType,
      "VIDEO",
      data.video.metadata
    );

    // 4. Upload Raw Voice
    const voiceAsset = await uploadBase64ToB2(
      data.voice.content,
      `voice_${Date.now()}.wav`,
      data.voice.contentType,
      "AUDIO",
      data.voice.metadata
    );

    // 5. Upload Raw Music
    const musicAsset = await uploadBase64ToB2(
      data.music.content,
      `music_${Date.now()}.wav`,
      data.music.contentType,
      "AUDIO",
      data.music.metadata
    );

    // 6. Upload Final Composited Video (the Pilot)
    const finalAsset = await uploadBase64ToB2(
      data.final.content,
      `pilot_${Date.now()}.mp4`,
      data.final.contentType,
      "VIDEO", // Can also be designated as "TRAILER" or a specific enum value
      data.final.metadata
    );

    console.log("All assets uploaded successfully.");

    return NextResponse.json({
      success: true,
      assets: {
        script: scriptAsset.publicUrl,
        rawVideo: videoAsset.publicUrl,
        rawVoice: voiceAsset.publicUrl,
        rawMusic: musicAsset.publicUrl,
        finalPilot: finalAsset.publicUrl,
      },
      finalAssetRecord: finalAsset.mediaAsset
    });

  } catch (error: any) {
    console.error("Error in generate route:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
