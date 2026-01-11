export type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyArtist = {
  id: string;
  name: string;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  images: SpotifyImage[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
};

export type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
  };
};
