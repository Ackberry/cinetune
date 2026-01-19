"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

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

const homeSections = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#cta", label: "Get Started" },
];

export default function Nav({ userLabel, isAuthed }: Props) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.tsx:33',message:'Nav render',data:{userLabel,isAuthed},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/messages") {
      return pathname.startsWith("/messages");
    }
    return pathname === href;
  };

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.tsx:46',message:'Nav pathname effect',data:{pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (pathname !== "/") return;

    const sections = homeSections
      .map((section) => document.getElementById(section.href.replace("#", "")))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.5] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.tsx:74',message:'Outside click closes menu',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userMenu = (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition"
      >
        {userLabel || "Profile"}
      </button>
      {/* #region agent log */}
      {fetch('http://127.0.0.1:7242/ingest/f43f4436-0bd4-44e2-859b-c9a5c45048f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'nav.tsx:88',message:'User menu state',data:{menuOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{})}
      {/* #endregion */}
      {menuOpen ? (
        <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-xl">
          <div className="p-2">
            <Link
              href="/search/movies"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              href="/search/music"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Music
            </Link>
            <Link
              href="/library"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Library
            </Link>
            <Link
              href="/discover"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Discover
            </Link>
          </div>
          <div className="border-t border-white/10 p-2">
            <Link
              href="/messages"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Messages
            </Link>
            <Link
              href="/settings"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
          </div>
          <div className="border-t border-white/10 p-2">
            <Link
              href="/settings"
              className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );

  if (pathname === "/") {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/discover"
          className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white font-semibold shadow-lg shadow-purple-500/40 hover:scale-105 transition"
        >
          Get Started
        </Link>
        {isAuthed ? (
          userMenu
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <NavigationMenu>
        <NavigationMenuList>
          {(pathname === "/" ? homeSections : links).map((link) => {
            const isHomeSection =
              pathname === "/" && link.href.startsWith("#");
            const active = isHomeSection
              ? activeSection === link.href.replace("#", "")
              : isActive(link.href);

            return (
              <NavigationMenuItem key={link.href}>
                <Link
                  href={isHomeSection ? `/${link.href}` : link.href}
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink
                    className={
                      active
                        ? "text-white px-3 py-2 rounded-md bg-zinc-900"
                        : "text-zinc-300 hover:text-white px-3 py-2 rounded-md hover:bg-zinc-900"
                    }
                  >
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {isAuthed ? (
        userMenu
      ) : (
        <Link href="/login" className="text-zinc-300 hover:text-white">
          Sign in
        </Link>
      )}
    </div>
  );
}
