"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`} aria-label="Kenshō home">
      <span className="grid place-items-center w-9 h-9 bg-ink text-white font-display text-[15px] leading-none group-hover:bg-red transition-colors">見</span>
      <span className="font-display text-[19px] tracking-[0.06em] leading-none">
        KENSHŌ<span className="text-red">.</span>
      </span>
    </Link>
  );
}

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`sticky top-0 z-40 border-b-[3px] ${dark ? "bg-ink text-white border-white/20" : "bg-paper/95 backdrop-blur border-ink"}`}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-16 flex items-center gap-6">
        <Logo />
        <nav className="ml-auto flex items-center gap-1 text-sm font-bold">
          <Link href="/search" className="px-3 py-2 hover:bg-ink hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/library" className="px-3 py-2 hover:bg-ink hover:text-white transition-colors">
            Library
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SearchBar({ initial = "", size = "lg", autoFocus = false }: { initial?: string; size?: "lg" | "md"; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v.length >= 2) router.push(`/search?q=${encodeURIComponent(v)}`);
  };
  const lg = size === "lg";
  return (
    <form onSubmit={submit} role="search" className={`relative flex items-stretch bg-white border-[3px] border-ink ${lg ? "ink-shadow" : "ink-shadow-sm"}`}>
      <label htmlFor="topic" className="sr-only">
        Research topic
      </label>
      <span aria-hidden className={`grid place-items-center pl-4 pr-1 ${lg ? "text-2xl" : "text-lg"}`}>
        <svg width={lg ? 24 : 18} height={lg ? 24 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="10" cy="10" r="6.5" />
          <path d="M15 15 L21 21" strokeLinecap="square" />
        </svg>
      </span>
      <input
        id="topic"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        maxLength={200}
        placeholder="How do large language models work?"
        className={`flex-1 min-w-0 bg-transparent outline-none px-3 placeholder:text-ink-3/70 font-medium ${lg ? "py-4 text-lg sm:text-xl" : "py-2.5 text-base"}`}
      />
      <button type="submit" className={`bg-ink text-white font-display tracking-wider hover:bg-red transition-colors ${lg ? "px-5 sm:px-8 text-base sm:text-lg" : "px-4 text-sm"}`}>
        SEARCH
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="border-t-[3px] border-ink mt-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 grid gap-6 sm:grid-cols-[1fr_auto] items-end">
        <div>
          <div className="font-display text-xl">KENSHŌ 見性</div>
          <p className="text-sm text-ink-3 mt-2 max-w-xl leading-relaxed">
            <em>Kenshō</em> means “seeing into the nature of things.” Papers are discovered on the open web with TinyFish; Kenshō reads only openly
            accessible text, quotes it briefly, and always links back to the original source. Manga panels simplify — the paper is the authority.
          </p>
        </div>
        <div className="font-mono text-xs text-ink-3">Search · Fetch · Agent by TinyFish</div>
      </div>
    </footer>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs" role="status">
      <span className="w-3 h-3 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      {label}
    </span>
  );
}
