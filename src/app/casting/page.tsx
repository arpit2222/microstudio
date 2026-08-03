"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CastingCall = {
  id: string;
  roleName: string;
  description: string;
  royaltyTerms: string;
  project: {
    title: string;
    premise: string;
    creator: { name: string };
  };
  _count: { applications: number };
};

export default function CastingBoard() {
  const [calls, setCalls] = useState<CastingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/casting-calls")
      .then(res => res.json())
      .then(data => setCalls(data.castingCalls || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (callId: string) => {
    setApplyingTo(callId);
    try {
      const res = await fetch(`/api/casting-calls/${callId}/apply`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        // Refresh counts
        setCalls(calls.map(c => c.id === callId ? { ...c, _count: { applications: c._count.applications + 1 } } : c));
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (e) {
      alert("An error occurred");
    } finally {
      setApplyingTo(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
              Casting Board
            </h1>
            <p className="text-slate-400">Discover roles. Invest your talent. Earn royalties.</p>
          </div>
          <div className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold border border-purple-500/50">
            Viewing as: Talent
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-t-2 border-cyan-500 rounded-full"></div></div>
        ) : calls.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5">
            <h3 className="text-xl text-slate-300">No open casting calls at the moment.</h3>
          </div>
        ) : (
          <div className="grid gap-6">
            {calls.map(call => (
              <div key={call.id} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {call.project.title}
                    </span>
                    <span className="text-slate-500 text-sm">by {call.project.creator?.name}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{call.roleName}</h2>
                  <p className="text-slate-300 mb-4 text-sm leading-relaxed">{call.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-lg border border-purple-400/20">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {call.royaltyTerms || "Standard Royalty Share"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {call._count.applications} Applicants
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => handleApply(call.id)}
                    disabled={applyingTo === call.id}
                    className="w-full md:w-40 py-3 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  >
                    {applyingTo === call.id ? "Submitting..." : "Apply Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
