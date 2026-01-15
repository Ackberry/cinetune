import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineTune",
  description: "Share and discover music and movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-zinc-950 text-white">
          <header className="border-b border-zinc-900">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                CineTune
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/search/movies" className="text-zinc-300 hover:text-white">
                  Movies
                </Link>
                <Link href="/search/music" className="text-zinc-300 hover:text-white">
                  Music
                </Link>
                <Link href="/library" className="text-zinc-300 hover:text-white">
                  Library
                </Link>
                <Link href="/messages" className="text-zinc-300 hover:text-white">
                  Messages
                </Link>
                <Link href="/settings" className="text-zinc-300 hover:text-white">
                  Settings
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
