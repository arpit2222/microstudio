"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CrowdfundingPortal() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pledging, setPledging] = useState(false);

  // Mock Funding Data
  const targetGoal = 150000;
  const currentRaised = 84500;
  const percentage = (currentRaised / targetGoal) * 100;
  
  const mockPledges = [
    { name: "Alex V.", amount: 500, time: "2 hours ago" },
    { name: "Sarah J.", amount: 2500, time: "5 hours ago" },
    { name: "Anonymous", amount: 150, time: "1 day ago" },
    { name: "Web3Fund", amount: 10000, time: "2 days ago" },
  ];

  useEffect(() => {
    fetch(`/api/projects/${projectId}/casting`) // We can reuse this API just to get the project basic details
      .then(res => res.json())
      .then(d => { if (d.project) setProject(d.project); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handlePledge = () => {
    setPledging(true);
    setTimeout(() => {
      alert("Pledge successful! You now own a share of this pilot's future royalties. (Mock Transaction)");
      setPledging(false);
    }, 1500);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><div className="animate-spin h-10 w-10 border-t-2 border-emerald-500 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500">
      
      <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900 via-slate-950 to-black pb-20 pt-12">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/feed" className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-2 mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Back to Feed
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Pitch Info */}
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase rounded-full border border-emerald-500/30">
                Active Campaign
              </div>
              <h1 className="text-5xl font-black tracking-tight leading-tight">
                Fund <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{project?.title}</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                {project?.premise}
              </p>
              
              <div className="pt-6 border-t border-white/10">
                <h3 className="font-bold text-lg mb-4 text-slate-200">The Royalty Model</h3>
                <ul className="space-y-3 text-slate-400 text-sm">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Invest capital to fund the full-season AI generation and distribution.
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Receive fractional ownership of the IP via smart contracts.
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Earn automated payouts from platform ad revenue and syndication deals directly proportionate to your stake.
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Funding Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <h2 className="text-4xl font-black">${currentRaised.toLocaleString()}</h2>
                  <span className="text-slate-400 mb-1 font-semibold">raised of ${targetGoal.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8 text-center border-b border-white/10 pb-8">
                  <div>
                    <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Funded</div>
                  </div>
                  <div className="border-l border-r border-white/10">
                    <div className="text-2xl font-bold">142</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Backers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Days Left</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Select Investment Tier</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-emerald-500 transition-colors text-left group">
                      <div className="font-black text-xl group-hover:text-emerald-400 transition-colors">$100</div>
                      <div className="text-xs text-slate-400">0.05% Royalty Share</div>
                    </button>
                    <button className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-bl">POPULAR</div>
                      <div className="font-black text-xl text-emerald-400">$1,000</div>
                      <div className="text-xs text-slate-400">0.5% Royalty Share</div>
                    </button>
                  </div>
                  
                  <button 
                    onClick={handlePledge}
                    disabled={pledging}
                    className="w-full mt-4 py-4 rounded-xl font-black text-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                  >
                    {pledging ? "Processing Smart Contract..." : "Back This Pilot"}
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Recent Pledges Section */}
      <div className="max-w-6xl mx-auto px-6 py-16 border-t border-white/5">
        <h3 className="text-2xl font-bold mb-8">Recent Investments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockPledges.map((pledge, i) => (
            <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-slate-400">
                {pledge.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-emerald-400">${pledge.amount.toLocaleString()}</div>
                <div className="text-sm font-semibold">{pledge.name}</div>
                <div className="text-xs text-slate-500">{pledge.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

// Needed because we use Link from next/link
import Link from "next/link";
