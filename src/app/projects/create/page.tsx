"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreatePitch() {
  const [title, setTitle] = useState("");
  const [premise, setPremise] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "generating" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [finalVideoUrl, setFinalVideoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !premise) return;
    
    try {
      setStatus("creating");
      setErrorMsg("");

      // 0. Trust & Safety: Content Moderation
      const modRes = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: premise }),
      });
      const modData = await modRes.json();
      if (!modData.safe) {
        throw new Error(modData.reason || "Your prompt violates our content guidelines.");
      }
      
      // 1. Create the Project in Postgres
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, premise }),
      });
      
      const projData = await projRes.json();
      if (!projRes.ok) throw new Error(projData.error || "Failed to create project");
      
      // 2. Trigger the Genblaze AI Pipeline
      setStatus("generating");
      const genRes = await fetch("/api/jobs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          projectId: projData.project.id, 
          premise 
        }),
      });
      
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Failed to generate pilot");
      
      setFinalVideoUrl(genData.assets.finalPilot);
      setStatus("success");
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black font-sans">
      
      <div className="w-full max-w-2xl relative">
        {/* Background glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-3xl blur opacity-25"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
              MicroStudio
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Pitch your idea. Let AI generate the pilot.</p>
          </div>

          {status === "idle" || status === "error" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  placeholder="e.g. The Quantum Detective"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">The Premise</label>
                <textarea
                  required
                  rows={4}
                  value={premise}
                  onChange={(e) => setPremise(e.target.value)}
                  className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder="Describe your story idea. What happens? Who are the characters?"
                />
              </div>

              {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/25 text-white"
              >
                Generate Pilot
              </button>
            </form>
          ) : status === "creating" || status === "generating" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
                  {status === "creating" ? "Initializing Project..." : "Genblaze is Cooking..."}
                </h3>
                <p className="text-slate-400">
                  {status === "creating" 
                    ? "Setting up database records." 
                    : "Writing script, synthesizing voice, generating video, and composing score..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Pilot Ready!</h3>
                <p className="text-slate-400">Your vision has been brought to life.</p>
              </div>
              
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                <video 
                  src={finalVideoUrl} 
                  controls 
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                />
              </div>

              <div className="flex gap-4 w-full">
                <Link href="/feed" className="flex-1 text-center py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-all border border-white/5">
                  Go to Feed
                </Link>
                <button 
                  onClick={() => {
                    setStatus("idle");
                    setTitle("");
                    setPremise("");
                  }}
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg text-white"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
