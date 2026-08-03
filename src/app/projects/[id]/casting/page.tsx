"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectCastingDashboard() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New call form state
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [royaltyTerms, setRoyaltyTerms] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // AI Preview State
  const [previewAppId, setPreviewAppId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  // Promo State
  const [promoGenerating, setPromoGenerating] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/casting`);
      const data = await res.json();
      if (data.project) setProject(data.project);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await fetch("/api/casting-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, roleName, description, royaltyTerms }),
      });
      setRoleName(""); setDescription(""); setRoyaltyTerms("");
      fetchProject(); // Refresh the list
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    if (!confirm("Are you sure you want to approve this talent? This will close the casting call and reject others.")) return;
    try {
      await fetch(`/api/applications/${applicationId}/approve`, { method: "POST" });
      fetchProject(); // Refresh the data
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePreview = async (applicationId: string) => {
    setPreviewLoading(true);
    setPreviewAppId(applicationId);
    setPreviewError("");
    setPreviewVideoUrl(null);
    try {
      const res = await fetch(`/api/applications/${applicationId}/preview`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPreviewError(data.message || data.error || "Failed to generate preview");
      } else {
        setPreviewVideoUrl(data.previewUrl);
      }
    } catch (err: any) {
      setPreviewError(err.message || "Network error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGeneratePromo = async () => {
    setPromoGenerating(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/promo`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("Promo generated and saved to B2 successfully! It will now appear in the Discovery Feed.");
      } else {
        alert(data.error || "Failed to generate promo");
      }
    } catch (err) {
      alert("Error generating promo");
    } finally {
      setPromoGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><div className="animate-spin h-10 w-10 border-t-2 border-cyan-500 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Project Dashboard</h1>
            <p className="text-slate-400">Manage casting calls, promos, and applications for <span className="text-cyan-400 font-bold">{project?.title}</span></p>
          </div>
          <div className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-semibold border border-cyan-500/50">
            Viewing as: Creator
          </div>
        </header>

        {/* Project Actions */}
        {(project?.status === "PRODUCED" || project?.status === "PILOT") && (
          <div className="mb-8 p-6 bg-gradient-to-r from-fuchsia-900/40 to-pink-900/40 border border-fuchsia-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-fuchsia-100 mb-1">AI Promo Engine</h2>
              <p className="text-sm text-fuchsia-300">Generate a 30s highlight cut of this episode for the discovery feed.</p>
            </div>
            <button 
              onClick={handleGeneratePromo}
              disabled={promoGenerating}
              className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(192,38,211,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              {promoGenerating ? (
                <><div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"></div> Cutting...</>
              ) : (
                <>Generate Promo Cut</>
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Form */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Open New Role</h2>
              <form onSubmit={handleCreateCall} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Role Name</label>
                  <input required value={roleName} onChange={e => setRoleName(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. Lead Detective" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Describe the character and requirements..." />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Royalty Terms</label>
                  <input required value={royaltyTerms} onChange={e => setRoyaltyTerms(e.target.value)} className="w-full bg-black/50 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="e.g. 5% Net Revenue Share" />
                </div>
                <button disabled={isCreating} type="submit" className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all text-white disabled:opacity-50">
                  {isCreating ? "Publishing..." : "Publish Casting Call"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Existing Calls & Applicants */}
          <div className="lg:col-span-2 space-y-6">
            {project?.castingCalls.length === 0 ? (
              <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-8 text-center text-slate-400">
                No casting calls created yet.
              </div>
            ) : (
              project?.castingCalls.map((call: any) => (
                <div key={call.id} className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-white">{call.roleName}</h2>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${call.status === "OPEN" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}>
                          {call.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{call.description}</p>
                      <p className="text-purple-400 text-xs mt-2 font-mono">{call.royaltyTerms}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Applicants ({call.applications.length})</h3>
                    {call.applications.length === 0 ? (
                      <p className="text-slate-500 text-sm">No applications yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {call.applications.map((app: any) => (
                          <div key={app.id} className={`flex justify-between items-center p-3 rounded-xl border ${app.status === "ACCEPTED" ? "bg-green-500/10 border-green-500/30" : app.status === "REJECTED" ? "bg-red-500/5 border-red-500/10 opacity-50" : "bg-black/30 border-white/5"}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white">
                                {app.talent.user.name.charAt(0)}
                              </div>
                              <div>
                                <Link href={`/talent/${app.talent.user.id}`} className="font-bold text-white hover:text-cyan-400 transition-colors">
                                  {app.talent.user.name}
                                </Link>
                                <p className="text-xs text-slate-400">Status: <span className={app.status === "ACCEPTED" ? "text-green-400" : ""}>{app.status}</span></p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {call.status === "OPEN" && app.status === "PENDING" && (
                                <>
                                  <button 
                                    onClick={() => handleGeneratePreview(app.id)}
                                    className="px-3 py-2 bg-indigo-500/20 text-indigo-300 text-sm font-bold rounded-lg hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    AI Preview
                                  </button>
                                  <button 
                                    onClick={() => handleApprove(app.id)}
                                    className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                                  >
                                    Approve
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Preview Modal */}
        {previewAppId && (previewLoading || previewVideoUrl || previewError) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-2xl relative shadow-2xl">
              <button 
                onClick={() => { setPreviewAppId(null); setPreviewVideoUrl(null); setPreviewError(""); }}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Casting Preview
              </h2>
              
              {previewLoading && (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="animate-spin h-12 w-12 border-t-2 border-indigo-500 rounded-full mb-6"></div>
                  <p className="text-indigo-300 font-semibold animate-pulse">Generating likeness preview via Genblaze...</p>
                </div>
              )}
              
              {previewError && (
                <div className="py-12 text-center bg-red-500/5 rounded-2xl border border-red-500/10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Consent Required</h3>
                  <p className="text-slate-300 max-w-sm mx-auto">{previewError}</p>
                </div>
              )}
              
              {previewVideoUrl && (
                <div className="space-y-4">
                  <video src={previewVideoUrl} controls autoPlay className="w-full rounded-2xl border border-white/10 aspect-video bg-black shadow-lg"></video>
                  <p className="text-xs text-slate-500 text-center font-mono uppercase tracking-widest opacity-60">This is an AI-generated preview for casting evaluation purposes only.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
