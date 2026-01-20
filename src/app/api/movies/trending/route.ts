import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const timeWindow = request.nextUrl.searchParams.get("time") || "week";

  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/${timeWindow}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch trending movies" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
