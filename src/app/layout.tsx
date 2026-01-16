import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
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
              <Nav
                userLabel={profile?.username || user?.email || null}
                isAuthed={!!user}
              />
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
