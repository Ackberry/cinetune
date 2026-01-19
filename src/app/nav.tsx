"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("top");

  const isActive = (href: string) => {
    if (href === "/messages") {
      return pathname.startsWith("/messages");
    }
    return pathname === href;
  };

  useEffect(() => {
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
    </div>
  );
}
