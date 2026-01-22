"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TMDBMovie } from "@/types/tmdb";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function MovieSearchClient() {
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get("query")?.trim() || "";

  const supabase = createClient();

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const response = await fetch(
        `/api/movies/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!active) return;
      setResults(data.results || []);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [query]);

  const handleSave = async (movie: TMDBMovie) => {
    setSaving(movie.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in to save movies");
      setSaving(null);
      return;
    }

    const { error } = await supabase.from("user_media").insert({
      user_id: user.id,
      media_type: "movie",
      external_id: String(movie.id),
      metadata: {
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        overview: movie.overview,
      },
    });

    if (error) {
      if (error.code === "23505") {
        alert("Movie already in your library");
      } else {
        console.error("Save error:", error);
        alert("Failed to save movie");
      }
    } else {
      alert("Saved to library!");
    }

    setSaving(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {query ? `Results for "${query}"` : "Search Movies"}
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {results.map((movie) => (
            <div key={movie.id} className="bg-zinc-900 rounded-lg overflow-hidden">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  width={300}
                  height={450}
                  className="w-full aspect-[2/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-500">
                  No Image
                </div>
              )}
              <div className="p-3">
                <h3 className="font-medium truncate">{movie.title}</h3>
                <p className="text-sm text-zinc-400">
                  {movie.release_date?.split("-")[0] || "Unknown"}
                </p>
                <button
                  onClick={() => handleSave(movie)}
                  disabled={saving === movie.id}
                  className="mt-2 w-full bg-zinc-800 py-2 rounded text-sm hover:bg-zinc-700 disabled:opacity-50"
                >
                  {saving === movie.id ? "Saving..." : "Save to Library"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !loading && (
          <p className="text-zinc-500 text-center">
            {query
              ? "No results found. Try another search."
              : "Use the search icon in the navbar to search movies."}
          </p>
        )}
      </div>
    </div>
  );
}
