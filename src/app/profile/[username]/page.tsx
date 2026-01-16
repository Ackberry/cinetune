import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { UserMedia } from "@/types/database";
import MessageButton from "./message-button";
import Image from "next/image";


type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: media } = await supabase
    .from("user_media")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const movies = (media || []).filter((m: UserMedia) => m.media_type === "movie");
  const music = (media || []).filter((m: UserMedia) => m.media_type === "music");

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name || username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
              {(profile.display_name || username)[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.display_name || username}</h1>
            <p className="text-zinc-400">@{username}</p>
          </div>
          <MessageButton targetUserId={profile.id} />
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Movies ({movies.length})</h2>
          {movies.length === 0 ? (
            <p className="text-zinc-500">No movies saved yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies.map((movie: UserMedia) => {
                const meta = movie.metadata as { title: string; poster_path: string | null };
                return (
                  <div key={movie.id} className="bg-zinc-900 rounded-lg overflow-hidden">
                    {meta.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${meta.poster_path}`}
                        alt={meta.title}
                        width={300}
                        height={450}
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
                    className="flex items-center gap-4 bg-zinc-900 rounded-lg p-3"
                  >
                    {meta.image_url ? (
                      <Image
                        src={meta.image_url}
                        alt={meta.name}
                        width={48}
                        height={48}
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
