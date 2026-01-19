import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import HeaderSearch from "./header-search";
import Nav from "./nav";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single()
    : { data: null };
  const userLabel = profile?.username || user?.email || "";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-black text-white">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center gap-6">
              <HeaderSearch />
              <Link href="/" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    CineTune
                  </span>
                  <Sparkles className="h-4 w-4 text-purple-300" />
                </div>
              </Link>

              <div className="ml-auto">
                <Nav userLabel={userLabel || null} isAuthed={!!user} />
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
