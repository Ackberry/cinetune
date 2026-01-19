"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@chakra-ui/icons";
import { useOutsideClick } from "@chakra-ui/react";

export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  useOutsideClick({
    ref: wrapperRef,
    handler: () => setOpen(false),
  });

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

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
    <form onSubmit={handleSubmit} className="flex items-center">
      <div
        ref={wrapperRef}
        className={`flex items-center rounded-full border border-white/10 bg-white/5 transition-all duration-300 ${
          open ? "w-52 px-3" : "w-10 px-0"
        }`}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="h-10 w-10 flex items-center justify-center transition rounded-full cursor-pointer"
          aria-label="Search"
        >
          <SearchIcon className="h-4 w-4 text-white/80" />
        </button>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search movies and music"
          className={`bg-transparent text-sm text-white placeholder:text-gray-400 focus-visible:outline-none ${
            open ? "flex-1 opacity-100" : "w-0 opacity-0"
          } transition-all duration-300`}
        />
      </div>
    </form>
  );
}
