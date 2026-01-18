"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  userLabel: string | null;
  isAuthed: boolean;
};

const links = [
  { href: "/search/movies", label: "Movies" },
  { href: "/search/music", label: "Music" },
  { href: "/library", label: "Library" },
  { href: "/discover", label: "Discover" },
  { href: "/messages", label: "Messages" },
  { href: "/settings", label: "Settings" },
];

export default function Nav({ userLabel, isAuthed }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/messages") {
      return pathname.startsWith("/messages");
    }
    return pathname === href;
  };

  return (
    <nav className="flex items-center gap-4 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={
            isActive(link.href)
              ? "text-white"
              : "text-zinc-300 hover:text-white"
          }
        >
          {link.label}
        </Link>
      ))}
      {isAuthed ? (
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">{userLabel}</span>
          <form action="/auth/signout" method="post">
            <button className="text-zinc-300 hover:text-white">Sign out</button>
          </form>
        </div>
      ) : (
        <Link href="/login" className="text-zinc-300 hover:text-white">
          Sign in
        </Link>
      )}
    </nav>
  );
}
