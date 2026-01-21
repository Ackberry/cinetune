import Link from "next/link";
import WatchPlayer from "./watch-player";

type WatchMoviePageProps = {
  params: { tmdbId: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function WatchMoviePage({
  params,
  searchParams,
}: WatchMoviePageProps) {
  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/50">
              Now Watching
            </p>
            <h1 className="text-2xl font-semibold">Movie {params.tmdbId}</h1>
          </div>
          <Link href="/" className="text-sm text-purple-300 hover:text-purple-200">
            Back to Home
          </Link>
        </div>

        <WatchPlayer tmdbId={params.tmdbId} searchParams={searchParams} />
      </div>
    </div>
  );
}
