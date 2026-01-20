"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, ScaleFade } from "@chakra-ui/react";

type Props = {
  userLabel: string | null;
  isAuthed: boolean;
};

const links = [
  { href: "/search/movies", label: "Movies" },
  { href: "/search/music", label: "Music" },
  { href: "/library", label: "Library" },
  { href: "/messages", label: "Messages" },
  { href: "/settings", label: "Settings" },
];

export default function Nav({ userLabel, isAuthed }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/messages") {
      return pathname.startsWith("/messages");
    }
    return pathname === href;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center gap-4 text-sm">
      {isAuthed ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer inline-flex items-center gap-1"
          >
            {userLabel || "Profile"}
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <ScaleFade in={menuOpen} initialScale={0.95} unmountOnExit>
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-xl">
              <div className="p-2">
                {links.map((link) => (
                  <Box
                    key={link.href}
                    as={Link}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      isActive(link.href)
                        ? "text-white bg-white/10"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setMenuOpen(false)}
                    transition="transform 0.15s ease"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    {link.label}
                  </Box>
                ))}
              </div>
              <div className="border-t border-white/10 p-2">
                <form action="/auth/signout" method="post">
                  <Box
                    as="button"
                    type="submit"
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    transition="transform 0.15s ease"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    Sign out
                  </Box>
                </form>
              </div>
            </div>
          </ScaleFade>
        </div>
      ) : (
        <Link href="/login" className="text-zinc-300 hover:text-white">
          Sign in
        </Link>
      )}
    </nav>
  );
}