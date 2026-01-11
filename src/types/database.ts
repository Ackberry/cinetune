export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type MediaType = "movie" | "music";

export type UserMedia = {
  id: string;
  user_id: string;
  media_type: MediaType;
  external_id: string;
  metadata: MovieMetadata | MusicMetadata;
  created_at: string;
};

export type MovieMetadata = {
  title: string;
  poster_path: string | null;
  release_date: string | null;
  overview: string | null;
};

export type MusicMetadata = {
  name: string;
  artist: string;
  album: string | null;
  image_url: string | null;
};
