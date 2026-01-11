import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query) {
    return NextResponse.json({ tracks: { items: [] } });
  }

  const token = await getSpotifyToken();
  if (!token) {
    return NextResponse.json(
      { error: "Failed to authenticate with Spotify" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to search Spotify" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
