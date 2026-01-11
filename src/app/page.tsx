import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">CineTune</h1>
        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-zinc-400">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button className="text-zinc-400 hover:text-white transition-colors">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-4">
            Share your taste in music & movies
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Discover, save, and share your favorite music and movies with friends.
          </p>
        </div>
      </main>
    </div>
  );
}
