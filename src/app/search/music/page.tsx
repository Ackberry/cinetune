import { Suspense } from "react";
import MusicSearchClient from "./music-search-client";

export default function MusicSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-white p-6">
          <div className="max-w-4xl mx-auto text-zinc-400">Loading search...</div>
        </div>
      }
    >
      <MusicSearchClient />
    </Suspense>
  );
}
