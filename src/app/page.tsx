"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black flex flex-col overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background ambient gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-4 pt-32 pb-20">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              MicroStudio v1.0
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-zinc-500 drop-shadow-sm">
            The Future of Hollywood <br className="hidden sm:block" />
            is <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">Generative.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 font-light leading-relaxed">
            Create, cast, and crowdfund AI-generated pilots. MicroStudio leverages the Genblaze SDK and Backblaze B2 to ensure cryptographic provenance for every frame generated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/feed"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start Watching
            </Link>
            <Link 
              href="/projects/create"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105"
            >
              Create a Pilot
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 px-4 w-full">
          <FeatureCard 
            title="Genblaze Pipelines"
            description="Seamlessly chain language, image, and video generation models into production-ready content pipelines."
            icon="🎬"
          />
          <FeatureCard 
            title="Cryptographic Provenance"
            description="Every asset is hashed and stored immutably on Backblaze B2, proving exactly which AI models were used."
            icon="🔒"
          />
          <FeatureCard 
            title="Community Crowdfunding"
            description="Viewers pledge directly to pilots they love. Creators earn funding, and fans earn royalty shares."
            icon="💎"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500 ease-out">{icon}</div>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-zinc-400 leading-relaxed font-light">{description}</p>
    </div>
  );
}
