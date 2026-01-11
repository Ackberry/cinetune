"use client";

import { useState } from "react";
import { SpotifyTrack } from "@/types/spotify";
import { createClient } from "@/lib/supabase/client";

export default function MusicSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const supabase = createClient();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data.tracks?.items || []);
    setLoading(false);
  };

  const handleSave = async (track: SpotifyTrack) => {
    setSaving(track.id);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to save music");
      setSaving(null);
      return;
    }

    const { error } = await supabase.from("user_media").insert({
      user_id: user.id,
      media_type: "music",
      external_id: track.id,
      metadata: {
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        image_url: track.album.images[0]?.url || null,
      },
    });

    if (error) {
      if (error.code === "23505") {
        alert("Track already in your library");
      } else {
        console.error("Save error:", error);
        alert("Failed to save track");
      }
    } else {
      alert("Saved to library!");
    }

    setSaving(null);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Music</h1>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search for a song..."
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

        <div className="space-y-2">
          {results.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-4 bg-zinc-900 rounded-lg p-3 hover:bg-zinc-800 transition-colors"
            >
              {track.album.images[0] ? (
                <img
                  src={track.album.images[0].url}
                  alt={track.album.name}
                  className="w-14 h-14 rounded object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                  ♪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{track.name}</h3>
                <p className="text-sm text-zinc-400 truncate">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
              <span className="text-sm text-zinc-500">
                {formatDuration(track.duration_ms)}
              </span>
              <button
                onClick={() => handleSave(track)}
                disabled={saving === track.id}
                className="bg-zinc-800 px-4 py-2 rounded text-sm hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving === track.id ? "..." : "Save"}
              </button>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <p className="text-zinc-500 text-center">Search for music to get started</p>
        )}
      </div>
    </div>
  );
}
