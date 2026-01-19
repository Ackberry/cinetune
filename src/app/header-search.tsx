"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@chakra-ui/icons";

export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputRef.current?.value?.trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search/movies?query=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
        aria-label="Search"
      >
        <SearchIcon className="h-4 w-4 text-white/80" />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "w-44 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          type="search"
          placeholder="Search movies, music, vibes..."
          onBlur={() => {
            if (!inputRef.current?.value) setOpen(false);
          }}
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 px-4 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/80"
        />
      </div>
    </form>
  );
}
