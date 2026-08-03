"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TalentSettings() {
  const { userId } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/talent/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setProfile(data.profile);
          setConsent(data.profile.consentForAIGeneration);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/talent/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentForAIGeneration: consent }),
      });
      alert("Settings saved successfully!");
      router.push(`/talent/${userId}`);
    } catch (e) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center"><div className="animate-spin h-10 w-10 border-t-2 border-cyan-500 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-black font-sans flex justify-center items-center">
      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          Account Settings
        </h1>

        <div className="space-y-8">
          {/* Mock File Upload for Reference Media */}
          <div className="border border-white/10 rounded-2xl p-6 bg-black/40">
            <h3 className="text-lg font-bold mb-2">Upload AI Reference Asset</h3>
            <p className="text-sm text-slate-400 mb-4">Upload a high-quality video or voice sample. This will be used by our Genblaze models to synthesize your likeness for casting previews.</p>
            <div className="w-full h-32 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:border-cyan-500 transition-colors cursor-pointer">
              <span className="font-semibold">+ Select File</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">(Mocked for hackathon)</p>
          </div>

          {/* Consent Toggle */}
          <div className="border border-white/10 rounded-2xl p-6 bg-black/40 flex items-start gap-4">
            <div className="pt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-white">Enable AI Casting Previews</h3>
              <p className="text-sm text-slate-400">
                By enabling this, you grant explicitly authorized Creators the right to generate a short, non-commercial AI preview of your likeness performing their script for casting evaluation purposes only. You retain all underlying rights to your likeness.
              </p>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 transition-all text-white shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
