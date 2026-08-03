"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OTTPlayer() {
  const { id: projectId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/watch`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.mainVideo) setCurrentVideo(d.mainVideo);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="min-h-screen bg-black flex justify-center items-center"><div className="animate-spin h-12 w-12 border-t-2 border-red-600 rounded-full"></div></div>;
  if (!data?.project) return <div className="min-h-screen bg-black text-white p-8">Project not found.</div>;

  const { project, assets } = data;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600">
      {/* Top Nav Mock */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
        <h1 className="text-2xl font-black tracking-tighter text-red-600 uppercase">MicroStudio</h1>
        <div className="text-sm font-semibold text-slate-300 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
          {project.creator?.name || "Creator"}
        </div>
      </header>

      {/* Main Video Player */}
      <div className="w-full h-[70vh] lg:h-[80vh] bg-zinc-950 relative border-b border-white/5">
        {currentVideo?.url ? (
          <video 
            src={currentVideo.url} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <p>No playable media found for this project.</p>
          </div>
        )}
      </div>

      {/* Details & Asset Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Project Info */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-4xl font-extrabold">{project.title}</h2>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-wider">
            <span className="text-red-500">{project.status}</span>
            <span>•</span>
            <span>2026</span>
            <span>•</span>
            <span className="border border-slate-600 px-2 py-0.5 rounded">TV-MA</span>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            {project.premise}
          </p>
          
          <div className="pt-6 border-t border-white/10 flex gap-4">
            <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Play
            </button>
            <button className="flex items-center gap-2 bg-zinc-800 text-white px-8 py-3 rounded-md font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              My List
            </button>
          </div>

          {/* Tech & Provenance Panel */}
          {currentVideo?.metadata && (
            <div className="mt-12 p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                Provenance & Architecture
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Storage Layer</div>
                  <div className="font-mono text-cyan-400">Backblaze B2</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">B2 Object Key</div>
                  <div className="font-mono text-slate-300 break-all">{currentVideo.b2Key}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">AI Generation Engine</div>
                  <div className="font-mono text-purple-400">Genblaze SDK</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Source Model</div>
                  <div className="font-mono text-slate-300">
                    {typeof currentVideo.metadata === 'object' && currentVideo.metadata?.sourceModel ? currentVideo.metadata.sourceModel : "Multiple (Composited Pipeline)"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Media Assets / Episodes Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
            Related Media
            <span className="text-xs font-normal text-slate-500 bg-white/10 px-2 py-1 rounded">From B2</span>
          </h3>
          <div className="flex flex-col gap-3">
            {assets.map((asset: any) => (
              <button 
                key={asset.id}
                onClick={() => setCurrentVideo(asset)}
                className={`flex items-center gap-4 p-3 rounded-lg text-left transition-all ${
                  currentVideo?.id === asset.id 
                    ? "bg-zinc-800 border-l-4 border-red-600" 
                    : "hover:bg-zinc-900 border-l-4 border-transparent"
                }`}
              >
                <div className="w-24 h-16 bg-zinc-950 rounded flex items-center justify-center shrink-0 border border-white/5 relative">
                  {asset.type === "TRAILER" || asset.type === "VIDEO" ? (
                     <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  ) : (
                     <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>
                  )}
                  {currentVideo?.id === asset.id && (
                    <div className="absolute inset-0 bg-red-600/20 rounded"></div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200 line-clamp-1">{asset.type} Cut</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1 break-all line-clamp-1" title={asset.b2Key}>
                    {asset.b2Key}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
