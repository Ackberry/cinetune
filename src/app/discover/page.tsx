"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export default function DiscoverPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("created_at", { ascending: false })
        .limit(20);
      setProfiles(data || []);
      setLoading(false);
    };

    loadInitial();
  }, [supabase]);

  const handleSearch = async () => {
    setLoading(true);

    if (!query.trim()) {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("created_at", { ascending: false })
        .limit(20);
      setProfiles(data || []);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${query.trim()}%`)
      .limit(20);

    setProfiles(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Discover</h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search usernames..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-white text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-100 disabled:opacity-50"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        <div className="space-y-3">
          {profiles.map((profile) => (
            <Link
              key={profile.id}
              href={profile.username ? `/profile/${profile.username}` : "#"}
              className="flex items-center gap-4 bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
            >
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  {(profile.username || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="text-sm text-zinc-300">
                @{profile.username || "unknown"}
              </div>
            </Link>
          ))}

          {!loading && profiles.length === 0 && (
            <p className="text-zinc-500 text-center">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
}
