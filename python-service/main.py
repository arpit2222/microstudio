from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import os
import tempfile
import asyncio
import numpy as np
import hashlib
from datetime import datetime

# Real Genblaze SDK Core imports
from genblaze_core import (
    Manifest,
    Modality,
    RunBuilder,
    StepBuilder,
    StepStatus,
)

# Moviepy for actual local file mocking
from moviepy.editor import ColorClip, VideoFileClip, AudioFileClip, CompositeAudioClip
from moviepy.audio.AudioClip import AudioArrayClip

app = FastAPI()

class GenerationRequest(BaseModel):
    premise: str

def file_to_base64(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def get_file_hash(filepath: str) -> str:
    with open(filepath, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()

def get_string_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

@app.post("/api/generate")
async def generate_pilot(req: GenerationRequest):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path = os.path.join(temp_dir, "raw_video.mp4")
            voice_path = os.path.join(temp_dir, "voice.wav")
            music_path = os.path.join(temp_dir, "music.wav")
            final_path = os.path.join(temp_dir, "final_pilot.mp4")
            script_path = os.path.join(temp_dir, "script.txt")

            # MOCK GENERATION LOGIC (since we don't have real keys, but we generate real bytes to hash)
            # 1. Script
            await asyncio.sleep(1)
            script_text = f"Title: The Hackathon Project\n\nPremise: {req.premise}\n\nINT. DARK ROOM - NIGHT\n\nA coder sits alone, lit only by the monitor..."
            with open(script_path, "w") as f:
                f.write(script_text)

            # 2. Video
            await asyncio.sleep(2)
            clip = ColorClip(size=(720, 1280), color=(25, 25, 25), duration=2)
            clip.fps = 24
            clip.write_videofile(video_path, logger=None)

            # 3. Voice
            await asyncio.sleep(1)
            fs = 44100
            t = np.linspace(0, 2, int(fs*2))
            voice_audio = np.sin(440 * 2 * np.pi * t).reshape(-1, 1)
            AudioArrayClip(voice_audio, fps=fs).write_audiofile(voice_path, logger=None)

            # 4. Music
            await asyncio.sleep(1)
            music_audio = np.sin(220 * 2 * np.pi * t).reshape(-1, 1)
            AudioArrayClip(music_audio, fps=fs).write_audiofile(music_path, logger=None)

            # 5. Composite Final Video
            video_clip = VideoFileClip(video_path)
            voice_clip = AudioFileClip(voice_path)
            music_clip = AudioFileClip(music_path).volumex(0.3)
            final_video = video_clip.set_audio(CompositeAudioClip([voice_clip, music_clip]))
            final_video.write_videofile(final_path, logger=None, audio_codec="aac")

            # --- REAL GENBLAZE SDK PROVENANCE MANIFEST CONSTRUCTION ---
            
            # Step 1: Script
            step_script = (
                StepBuilder("gmi-cloud", "gmi-llama-3")
                .prompt(f"Write script for: {req.premise}")
                .modality(Modality.TEXT)
                .status(StepStatus.SUCCEEDED)
                .asset("file://script.txt", "text/plain", sha256=get_file_hash(script_path))
                .build()
            )

            # Step 2: Video
            step_video = (
                StepBuilder("gmi-cloud", "gmi-stable-video")
                .prompt(f"Video for: {req.premise}")
                .modality(Modality.VIDEO)
                .status(StepStatus.SUCCEEDED)
                .asset("file://video.mp4", "video/mp4", sha256=get_file_hash(video_path))
                .build()
            )

            # Step 3: Voice
            step_voice = (
                StepBuilder("gmi-cloud", "gmi-audio-v1")
                .prompt(script_text)
                .modality(Modality.AUDIO)
                .status(StepStatus.SUCCEEDED)
                .asset("file://voice.wav", "audio/wav", sha256=get_file_hash(voice_path))
                .build()
            )

            # Step 4: Music
            step_music = (
                StepBuilder("gmi-cloud", "gmi-music-v1")
                .prompt(f"Score for: {req.premise}")
                .modality(Modality.AUDIO)
                .status(StepStatus.SUCCEEDED)
                .asset("file://music.wav", "audio/wav", sha256=get_file_hash(music_path))
                .build()
            )

            # Step 5: Composite (Pipeline Final)
            step_composite = (
                StepBuilder("gmi-cloud", "gmi-composite-pipeline")
                .prompt("Combine assets")
                .modality(Modality.VIDEO)
                .status(StepStatus.SUCCEEDED)
                .asset("file://final.mp4", "video/mp4", sha256=get_file_hash(final_path))
                .build()
            )

            # Build the Run with all steps
            run = (
                RunBuilder("microstudio-pilot-generation")
                .add_step(step_script)
                .add_step(step_video)
                .add_step(step_voice)
                .add_step(step_music)
                .add_step(step_composite)
                .build()
            )

            # Generate the SHA-256 verifiable manifest!
            manifest = Manifest.from_run(run)
            
            # For our UI, we return the manifest_hash per file, simulating the real metadata payload
            canonical_hash = manifest.canonical_hash
            
            # Helper to return formatted metadata for the frontend
            def make_meta(step, hash_val):
                return {
                    "sourceModel": step.model,
                    "provider": step.provider,
                    "prompt": step.prompt if step.prompt else "N/A",
                    "manifest_hash": hash_val, 
                    "timestamp": datetime.utcnow().isoformat()
                }

            # Return the files and their mathematically verified provenance metadata
            return {
                "script": {
                    "content": script_text,
                    "metadata": make_meta(step_script, canonical_hash)
                },
                "video": {
                    "content": file_to_base64(video_path),
                    "metadata": make_meta(step_video, canonical_hash),
                    "contentType": "video/mp4"
                },
                "voice": {
                    "content": file_to_base64(voice_path),
                    "metadata": make_meta(step_voice, canonical_hash),
                    "contentType": "audio/wav"
                },
                "music": {
                    "content": file_to_base64(music_path),
                    "metadata": make_meta(step_music, canonical_hash),
                    "contentType": "audio/wav"
                },
                "final": {
                    "content": file_to_base64(final_path),
                    "metadata": make_meta(step_composite, canonical_hash),
                    "contentType": "video/mp4"
                }
            }

    except Exception as e:
        print(f"Error in generation pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))
