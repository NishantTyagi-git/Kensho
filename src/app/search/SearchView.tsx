"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Paper, SearchResponse } from "@/lib/types";
import { api, library, useLibrary } from "@/lib/library";
import { SearchBar } from "@/components/ui/chrome";
import { AvailabilityBadge, PaperCover } from "@/components/ui/PaperCover";
import { Character } from "@/components/manga/characters";

const SCOUT_LINES = [
  "Sumi is diving into research indexes…",
  "Checking open repositories with TinyFish…",
  "Comparing titles to remove duplicates…",
  "Pulling abstracts from arXiv metadata…",
];

type Sort = "relevance" | "cited" | "newest";
type Access = "any" | "full_text";
type Since = "any" | "2020" | "2015";

export function SearchView({ q }: { q: string }) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!q);
  const [tick, setTick] = useState(0);
  const [sort, setSort] = useState<Sort>("relevance");
  const [access, setAccess] = useState<Access>("any");
  const [since, setSince] = useState<Since>("any");
  const lib = useLibrary();

  const run = (fresh = false) => {
    if (!q) return;
    setLoading(true);
    setError(null);
    api<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}${fresh ? "&fresh=1" : ""}`)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setTick((n) => n + 1), 1600);
    return () => clearInterval(t);
  }, [loading]);

  const papers = useMemo(() => {
    if (!data) return [];
    let list = data.papers.map((p, i) => ({ p, i }));
    if (access === "full_text") list = list.filter(({ p }) => p.availability === "full_text");
    if (since !== "any") list = list.filter(({ p }) => (p.year ?? 0) >= Number(since));
    if (sort === "cited") list.sort((a, b) => (b.p.citedBy ?? -1) - (a.p.citedBy ?? -1));
    if (sort === "newest") list.sort((a, b) => (b.p.year ?? 0) - (a.p.year ?? 0));
    return list.map(({ p }) => p);
  }, [data, sort, access, since]);

  return (
    <main className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-24">
      <div className="pt-8 sm:pt-10 grid gap-6">
        <div className="max-w-[760px]">
          <SearchBar initial={q} size="md" />
        </div>

        {!q && (
          <div className="ink-frame p-8 flex items-center gap-6 mt-4">
            <div className="w-24 shrink-0 swim">
              <Character id="sumi" expression="excited" />
            </div>
            <p className="text-lg">Tell Sumi what you’re curious about — a field, a question, or a paper title — and TinyFish will search the research web.</p>
          </div>
        )}

        {q && (
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3 border-b-[3px] border-ink pb-3">
            <div>
              <div className="font-display text-red text-xs tracking-[0.3em]">発見 · DISCOVERY</div>
              <h1 className="font-display text-2xl sm:text-4xl leading-tight mt-1 max-w-[30ch]" style={{ textWrap: "balance" }}>
                {q}
              </h1>
            </div>
            {data && !loading && (
              <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
                <Select label="Sort" value={sort} onChange={(v) => setSort(v as Sort)} options={[["relevance", "Relevance"], ["cited", "Most cited"], ["newest", "Newest"]]} />
                <Select label="Access" value={access} onChange={(v) => setAccess(v as Access)} options={[["any", "Any access"], ["full_text", "Open full text"]]} />
                <Select label="Year" value={since} onChange={(v) => setSince(v as Since)} options={[["any", "Any year"], ["2020", "2020 +"], ["2015", "2015 +"]]} />
              </div>
            )}
          </div>
        )}

        {q && data && !loading && (
          <SourceStrip data={data} shown={papers.length} onRefresh={() => run(true)} />
        )}
      </div>

      {loading && (
        <div className="mt-10 grid sm:grid-cols-[180px_1fr] gap-8 items-center" role="status" aria-live="polite">
          <div className="w-40 swim mx-auto">
            <Character id="sumi" expression={tick % 2 ? "thinking" : "excited"} />
          </div>
          <div>
            <div className="font-display text-2xl">Searching the research web…</div>
            <p className="mt-2 font-mono text-sm text-ink-3">{SCOUT_LINES[tick % SCOUT_LINES.length]}</p>
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="aspect-[3/4.2] border-[3px] border-ink bg-white relative overflow-hidden">
                  <div className="absolute inset-0 tone-dots opacity-20 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-10 ink-frame p-8 grid sm:grid-cols-[120px_1fr] gap-6 items-center">
          <Character id="kai" expression="worried" pose="shock" />
          <div>
            <div className="font-display text-xl">The search came back empty-handed.</div>
            <p className="mt-2 text-ink-2">{error}</p>
            <button className="btn-ink mt-5" onClick={() => run(true)}>
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {data && !loading && papers.length === 0 && (
        <div className="mt-10 ink-frame p-8">
          <div className="font-display text-xl">No papers match these filters.</div>
          <p className="mt-2 text-ink-2">
            {data.papers.length ? "Loosen the filters above to see all " + data.papers.length + " results." : "Try a broader phrasing or a different topic."}
          </p>
        </div>
      )}

      {data && !loading && papers.length > 0 && (
        <ol className="mt-8 grid gap-x-5 gap-y-10 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {papers.map((p, i) => (
            <PaperCard key={p.id} paper={p} index={i} saved={!!lib.bookmarks[p.id]} />
          ))}
        </ol>
      )}
    </main>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="inline-flex items-center border-2 border-ink bg-white">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent font-bold text-sm px-2 py-1.5 outline-none cursor-pointer">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function SourceStrip({ data, shown, onRefresh }: { data: SearchResponse; shown: number; onRefresh: () => void }) {
  const failed = data.sources.filter((s) => !s.ok);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-ink-3">
      <span className="bg-ink text-white px-1.5 py-0.5 font-sans font-black tracking-wider">TINYFISH</span>
      {data.sources.map((s) => (
        <span key={s.label} className={s.ok ? "" : "text-red line-through"} title={s.error}>
          {s.label}: {s.ok ? s.count : "failed"}
        </span>
      ))}
      <span>
        {data.dedupedFrom} results → {data.papers.length} unique · showing {shown}
      </span>
      {data.cached && (
        <button onClick={onRefresh} className="underline hover:text-ink">
          cached · refresh
        </button>
      )}
      {failed.length > 0 && <span className="text-red">Some sources failed; results may be incomplete.</span>}
    </div>
  );
}

function PaperCard({ paper, index, saved }: { paper: Paper; index: number; saved: boolean }) {
  return (
    <li className="ink-in flex flex-col" style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}>
      <Link href={`/paper/${paper.id}`} className="group block" aria-label={`Open ${paper.title}`}>
        <PaperCover paper={paper} className="transition-all duration-200 group-hover:-translate-y-1.5 group-hover:shadow-[8px_8px_0_var(--ink)]" />
      </Link>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <AvailabilityBadge paper={paper} />
        {paper.citedBy != null && <span className="font-mono text-[11px] text-ink-3">{paper.citedBy.toLocaleString()} cites</span>}
        <button
          onClick={() => library.toggleBookmark(paper)}
          className={`ml-auto w-8 h-8 grid place-items-center border-2 border-ink transition-colors ${saved ? "bg-ink text-white" : "bg-white hover:bg-paper-2"}`}
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark paper"}
        >
          <svg width="12" height="15" viewBox="0 0 12 15" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M1 1 H11 V14 L6 10 L1 14 Z" />
          </svg>
        </button>
      </div>
      <Link href={`/paper/${paper.id}`} className="mt-2 font-bold leading-snug hover:underline decoration-2 underline-offset-2">
        {paper.title}
      </Link>
      <div className="mt-1 text-sm text-ink-3 line-clamp-1">
        {paper.authors.slice(0, 3).join(", ") || "Authors not listed"}
        {paper.authors.length > 3 ? " et al." : ""}
        {paper.year ? ` · ${paper.year}` : ""}
      </div>
      {paper.abstract && (
        <p className="mt-2 text-sm leading-relaxed text-ink-2 line-clamp-4">
          {paper.abstractIsSnippet && <span className="font-mono text-[10px] uppercase mr-1 text-ink-3">snippet</span>}
          {paper.abstract}
        </p>
      )}
    </li>
  );
}
