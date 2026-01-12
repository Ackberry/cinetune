"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setDisplayName(profile.display_name || "");
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
      })
      .eq("id", user.id);

    if (error) {
      if (error.code === "23505") {
        setMessage("Username already taken");
      } else {
        setMessage("Failed to save");
      }
    } else {
      setMessage("Saved!");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Your profile: cinetune.com/profile/{username || "yourname"}
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-white text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-100 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {message && (
            <p className={`text-center ${message === "Saved!" ? "text-green-500" : "text-red-500"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
