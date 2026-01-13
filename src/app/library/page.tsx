import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserMedia } from "@/types/database";
import DeleteButton from "./delete-button";
import Image from "next/image";


export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: media } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const movies = (media || []).filter((m: UserMedia) => m.media_type === "movie");
  const music = (media || []).filter((m: UserMedia) => m.media_type === "music");

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Library</h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Movies ({movies.length})</h2>
          {movies.length === 0 ? (
            <p className="text-zinc-500">No movies saved yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((movie: UserMedia) => {
                const meta = movie.metadata as { title: string; poster_path: string | null };
                return (
                  <div key={movie.id} className="bg-zinc-900 rounded-lg overflow-hidden group relative">
                    {meta.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${meta.poster_path}`}
                        alt={meta.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-zinc-800 flex items-center justify-center text-zinc-500">
                        No Image
                      </div>
                    )}
                    <div className="p-2">
                      <h3 className="font-medium text-sm truncate">{meta.title}</h3>
                    </div>
                    <DeleteButton id={movie.id} />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Music ({music.length})</h2>
          {music.length === 0 ? (
            <p className="text-zinc-500">No music saved yet</p>
          ) : (
            <div className="space-y-2">
              {music.map((track: UserMedia) => {
                const meta = track.metadata as { name: string; artist: string; image_url: string | null };
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 bg-zinc-900 rounded-lg p-3 group"
                  >
                    {meta.image_url ? (
                      <Image
                        src={meta.image_url}
                        alt={meta.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                        ♪
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{meta.name}</h3>
                      <p className="text-sm text-zinc-400 truncate">{meta.artist}</p>
                    </div>
                    <DeleteButton id={track.id} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
