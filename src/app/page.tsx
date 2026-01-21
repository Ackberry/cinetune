"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  Flame,
  Heart,
  ListMusic,
  Music,
  Play,
  Star,
  TrendingUp,
  Film,
} from "lucide-react";
import Link from "next/link";

type MediaItem = {
  id: number;
  tmdbId?: number;
  title: string;
  subtitle: string;
  image: string;
  rating?: number;
  type: "movie" | "music";
  gradient: string;
};

type TrendingMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
};

type SpotifyTrackItem = {
  track?: {
    id: string;
    name: string;
    artists: { name: string }[];
    album?: { images?: { url: string }[] };
  };
};

const stats = [
  {
    label: "Movies Watched",
    value: 247,
    gradient: "from-purple-600 to-purple-800",
    icon: <Film className="h-6 w-6 text-white/80" />,
  },
  {
    label: "Hours Listened",
    value: "1.2K",
    gradient: "from-pink-600 to-pink-800",
    icon: <Music className="h-6 w-6 text-white/80" />,
  },
  {
    label: "Favorites",
    value: 89,
    gradient: "from-cyan-600 to-cyan-800",
    icon: <Heart className="h-6 w-6 text-white/80" />,
  },
  {
    label: "Playlists",
    value: 32,
    gradient: "from-orange-600 to-orange-800",
    icon: <ListMusic className="h-6 w-6 text-white/80" />,
  },
];

const mediaItems: MediaItem[] = [
  {
    id: 693134,
    tmdbId: 693134,
    title: "Dune: Part Two",
    subtitle: "Denis Villeneuve • 2024",
    image: "https://images.unsplash.com/photo-1519356627567-4ce7d70b448b?w=800",
    rating: 4.8,
    type: "movie",
    gradient: "from-orange-500/40 to-purple-900/60",
  },
  {
    id: 2,
    title: "Interstellar OST",
    subtitle: "Hans Zimmer",
    image: "https://images.unsplash.com/photo-1659456690967-bad366de0000?w=800",
    type: "music",
    gradient: "from-blue-500/40 to-purple-900/60",
  },
  {
    id: 872585,
    tmdbId: 872585,
    title: "Oppenheimer",
    subtitle: "Christopher Nolan • 2023",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    rating: 4.7,
    type: "movie",
    gradient: "from-orange-500/40 to-red-900/60",
  },
  {
    id: 335984,
    tmdbId: 335984,
    title: "Blade Runner 2049",
    subtitle: "Denis Villeneuve • 2017",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800",
    rating: 4.6,
    type: "movie",
    gradient: "from-cyan-500/40 to-purple-900/60",
  },
  {
    id: 5,
    title: "The Batman OST",
    subtitle: "Michael Giacchino",
    image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800",
    type: "music",
    gradient: "from-red-500/40 to-black/70",
  },
  {
    id: 792307,
    tmdbId: 792307,
    title: "Poor Things",
    subtitle: "Yorgos Lanthimos • 2023",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
    rating: 4.5,
    type: "movie",
    gradient: "from-pink-500/40 to-purple-900/60",
  },
];

const trendingGradients = [
  "from-orange-500/40 to-purple-900/60",
  "from-blue-500/40 to-purple-900/60",
  "from-cyan-500/40 to-purple-900/60",
  "from-pink-500/40 to-purple-900/60",
];

const activityItems = [
  {
    id: 1,
    title: "Watched Dune: Part Two",
    timestamp: "Rated 5/5 • 2 hours ago",
    badge: "Movie",
  },
  {
    id: 2,
    title: "Saved Interstellar OST",
    timestamp: "Added to playlist • 4 hours ago",
    badge: "Music",
  },
  {
    id: 3,
    title: "Rewatched Blade Runner 2049",
    timestamp: "Rated 4.5/5 • Yesterday",
    badge: "Movie",
  },
];

const tabs = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "popular", label: "Popular", icon: TrendingUp },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("trending");
  const [trendingMix, setTrendingMix] = useState<MediaItem[] | null>(null);
  const scrollItems = useMemo(
    () => [...mediaItems, ...mediaItems, ...mediaItems],
    []
  );

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const [moviesResponse, tracksResponse] = await Promise.all([
          fetch("/api/movies/trending?time=week"),
          fetch("/api/music/top-tracks"),
        ]);

        if (!moviesResponse.ok || !tracksResponse.ok) return;

        const moviesData = await moviesResponse.json();
        const tracksData = await tracksResponse.json();

        const movieItems: TrendingMovie[] = moviesData.results || [];
        const mappedMovies = movieItems.slice(0, 4).map((movie, index) => {
          const year = movie.release_date?.split("-")[0];
          const rating =
            typeof movie.vote_average === "number"
              ? Math.round((movie.vote_average / 2) * 10) / 10
              : undefined;
          const posterPath = movie.poster_path || movie.backdrop_path;

          return {
            id: movie.id,
            tmdbId: movie.id,
            title: movie.title,
            subtitle: year ? `Trending • ${year}` : "Trending",
            image: posterPath
              ? `https://image.tmdb.org/t/p/w780${posterPath}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
            rating,
            type: "movie",
            gradient: trendingGradients[index % trendingGradients.length],
          } satisfies MediaItem;
        });

        const trackItems: SpotifyTrackItem[] = tracksData.items || [];
        const mappedTracks = trackItems
          .filter((item) => item.track?.id)
          .slice(0, 4)
          .map((item, index) => {
            const track = item.track!;
            const artists = track.artists?.map((a) => a.name).join(", ");
            return {
              id: Number.parseInt(track.id, 36),
              title: track.name,
              subtitle: artists || "Trending",
              image:
                track.album?.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
              type: "music",
              gradient: trendingGradients[index % trendingGradients.length],
            } satisfies MediaItem;
          });

        const mixed = [...mappedMovies, ...mappedTracks];
        for (let i = mixed.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
        }

        if (mixed.length >= 6) {
          setTrendingMix(mixed);
        }
      } catch (error) {
        console.error("Failed to load trending mix", error);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <div className="relative h-[400px] rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 p-10 flex flex-col justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 text-purple-200 text-sm px-4 py-2 backdrop-blur-md w-fit mb-4">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Featured This Week
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300">
                Where Cinema Meets Sound
              </h1>
              <p className="text-white/80 max-w-2xl mb-6">
                Discover the perfect harmony between visual storytelling and
                musical masterpieces.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold shadow-2xl shadow-purple-500/50 transition hover:scale-105"
              >
                Explore CineTune
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {stats.map((stat) => (
              <StatsCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(trendingMix || mediaItems.slice(0, 4)).map((item) => (
            <MediaCard key={item.id} {...item} />
          ))}
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Vibes</h2>
            <Link href="/library" className="text-purple-400 hover:text-purple-300 text-sm">
              See All
            </Link>
          </div>

          <div className="overflow-hidden -mx-4 md:-mx-6 lg:-mx-8">
            <motion.div
              className="flex gap-4 px-4 md:px-6 lg:px-8"
              animate={{ x: [0, -1800] }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              {scrollItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="w-[200px] flex-shrink-0">
                  <MediaCard {...item} />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activityItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500" />
                <div className="flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-white/60">{item.timestamp}</p>
                </div>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

type StatsCardProps = {
  label: string;
  value: string | number;
  gradient: string;
  icon?: React.ReactNode;
};

function StatsCard({ label, value, gradient, icon }: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
      <div className="relative flex flex-col gap-4">
        {icon}
        <div>
          <div className="text-4xl font-bold">{value}</div>
          <div className="text-sm text-white/80">{label}</div>
        </div>
      </div>
    </div>
  );
}

type TabsProps = {
  activeTab: string;
  onChange: (tab: string) => void;
};

function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              isActive
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                : "bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function MediaCard({
  id,
  tmdbId,
  title,
  subtitle,
  image,
  rating,
  type,
  gradient,
}: MediaItem) {
  const isMovie = type === "movie";
  const watchId = tmdbId ?? id;
  const content = (
    <>
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-b ${gradient} transition duration-500 group-hover:opacity-70`}
        />
        <div
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full ${
            isMovie ? "bg-purple-500" : "bg-green-500"
          }`}
        >
          {isMovie ? (
            <Star className="h-4 w-4 text-white" fill="currentColor" />
          ) : (
            <Music className="h-4 w-4 text-white" />
          )}
        </div>
        {rating ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs text-yellow-400 backdrop-blur-md">
            {rating.toFixed(1)}
          </div>
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black transition group-hover:scale-105">
            <Play className="h-6 w-6" />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
    </>
  );

  if (isMovie) {
    return (
      <Link href={`/watch/movie/${watchId}`} className="group block">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
}
