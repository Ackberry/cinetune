"use client";

type WatchPlayerProps = {
  tmdbId: string;
};

const PLAYER_ORIGIN = "https://www.vidking.net";

export default function WatchPlayer({ tmdbId }: WatchPlayerProps) {
  const iframeSrc = `${PLAYER_ORIGIN}/embed/movie/${tmdbId}`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
      <iframe
        src={iframeSrc}
        title="Movie Player"
        width="100%"
        height="100%"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
