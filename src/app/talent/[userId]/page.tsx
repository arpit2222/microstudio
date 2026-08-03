"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TalentProfile() {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/talent/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfileData(data.profile);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><div className="animate-spin h-12 w-12 border-t-2 border-cyan-500 rounded-full"></div></div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-red-500 p-8">Error: {error}</div>;
  if (!profileData) return <div className="min-h-screen bg-slate-950 text-white p-8">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full mb-6 flex items-center justify-center text-3xl font-bold shadow-lg">
                {profileData.user.name?.charAt(0) || "T"}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{profileData.user.name}</h1>
              <p className="text-slate-400 mb-6">{profileData.user.bio || "No bio provided."}</p>
              
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill: string) => (
                  <span key={skill} className="bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Demo Reel */}
          <div className="lg:col-span-2">
            <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
              {profileData.reelUrl ? (
                <video 
                  src={profileData.reelUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full flex-col text-slate-500">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  <p>No demo reel uploaded yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
