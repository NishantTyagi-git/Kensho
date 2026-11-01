"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Paper, ProcessedPaper } from "@/lib/types";
import { api, library, useLibrary } from "@/lib/library";
import { AvailabilityBadge, PaperCover } from "@/components/ui/PaperCover";
import { Character } from "@/components/manga/characters";
import { Spinner } from "@/components/ui/chrome";
import { Quiz } from "@/components/Quiz";

const STAGES = [
  { key: "acquiring", jp: "取得", label: "Retrieve the paper", note: "TinyFish Fetch, with a browser agent if needed" },
  { key: "analyzing", jp: "読解", label: "Understand the research", note: "Claims, quotes, terms, prerequisites" },
  { key: "drawing", jp: "作画", label: "Draw the chapters", note: "Storyboard, panels, diagrams" },
] as const;

export function PaperView({ id }: { id: string }) {
  const [state, setState] = useState<ProcessedPaper | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const lib = useLibrary();

  const load = useCallback(() => {
    api<ProcessedPaper>(`/api/papers/${id}`)
      .then((s) => {
        setState(s);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

  const busy = !!state?.job && !["done", "error"].includes(state.job.stage);
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(load, 1800);
    return () => clearInterval(t);
  }, [busy, load]);

  const start = async (restart = false) => {
    setStarting(true);
    try {
      await api(`/api/papers/${id}/process`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restart }) });
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setStarting(false);
    }
  };

  if (error && !state)
    return (
      <main className="mx-auto max-w-[900px] px-4 py-20 text-center">
        <div className="w-32 mx-auto">
          <Character id="kai" expression="confused" />
        </div>
        <h1 className="font-display text-2xl mt-4">{error}</h1>
        <Link href="/search" className="btn-ink mt-6">
          SEARCH PAPERS
        </Link>
      </main>
    );
  if (!state)
    return (
      <main className="mx-auto max-w-[1280px] px-6 py-24">
        <Spinner label="Opening the paper…" />
      </main>
    );

  const { paper, analysis, story, acquisition, job } = state;
  const chapters = story?.chapters ?? [];
  const readyChapters = chapters.filter(Boolean).length;
  const progress = lib.progress[id];
  const pages = chapters.reduce((n, c) => n + (c?.pages.length ?? 0), 0);
  const saved = !!lib.bookmarks[id];

  return (
    <main className="pb-10">
      {/* ── header band ── */}
      <section className="border-b-[3px] border-ink relative overflow-hidden">
        <div className="absolute inset-0 tone-fade opacity-[0.06] pointer-events-none" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-10 grid md:grid-cols-[300px_1fr] gap-8 lg:gap-14">
          <div className="max-w-[300px] w-full mx-auto md:mx-0">
            <PaperCover paper={paper} size="lg" className="ink-shadow rotate-[-1deg]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <AvailabilityBadge paper={paper} confirmed={!!acquisition} />
              {paper.venue && <span className="text-xs font-bold border-2 border-ink px-1.5 py-0.5 bg-white">{paper.venue}</span>}
              {paper.year && <span className="text-xs font-bold border-2 border-ink px-1.5 py-0.5 bg-white">{paper.year}</span>}
              {paper.citedBy != null && <span className="font-mono text-xs text-ink-3">{paper.citedBy.toLocaleString()} citations</span>}
            </div>
            <h1 className="font-display text-[clamp(28px,4vw,52px)] leading-[1.02] mt-4" style={{ textWrap: "balance" }}>
              {paper.title}
            </h1>
            <p className="mt-3 text-ink-2 font-medium">{paper.authors.length ? paper.authors.slice(0, 10).join(", ") + (paper.authors.length > 10 ? ", et al." : "") : "Authors not listed by the source"}</p>

            {analysis && <p className="mt-6 text-xl leading-snug font-bold max-w-[60ch] border-l-[5px] border-red pl-4">{analysis.oneLiner}</p>}

            <div className="mt-7 flex flex-wrap gap-3 items-center">
              {readyChapters > 0 ? (
                <Link href={`/read/${id}${progress ? `?ch=${progress.chapter}&p=${progress.page}` : ""}`} className="btn-ink text-lg">
                  {progress ? `CONTINUE · CH.${progress.chapter} P.${progress.page}` : "START READING"} ▸
                </Link>
              ) : !busy ? (
                <button onClick={() => start(job?.stage === "error" ? false : false)} disabled={starting} className="btn-ink text-lg">
                  {starting ? "STARTING…" : job?.stage === "error" ? "RESUME DRAWING ▸" : "TURN INTO MANGA ▸"}
                </button>
              ) : null}
              <button onClick={() => library.toggleBookmark(paper)} className="btn-line" aria-pressed={saved}>
                {saved ? "★ Bookmarked" : "☆ Bookmark"}
              </button>
              <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn-line">
                Original paper ↗
              </a>
              {paper.pdfUrl && (
                <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-line">
                  PDF ↗
                </a>
              )}
            </div>
            {error && <p className="mt-4 text-red font-bold">{error}</p>}

            {analysis && (
              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[720px]">
                <Stat label="Difficulty">
                  <span className="flex gap-1 mt-1" aria-label={`${analysis.difficulty} of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`w-4 h-4 rounded-full border-2 border-ink ${n <= analysis.difficulty ? "bg-ink" : "bg-white"}`} />
                    ))}
                  </span>
                </Stat>
                <Stat label="Reading time">{pages ? `~${Math.max(3, Math.round(pages * 1.3))} min` : `~${analysis.chapterPlan.length * 4} min`}</Stat>
                <Stat label="Chapters">
                  {readyChapters}/{analysis.chapterPlan.length}
                </Stat>
                <Stat label="Source">{acquisition?.mode === "full_text" ? "Full text" : "Abstract only"}</Stat>
              </dl>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 grid lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 pt-10">
        <div className="min-w-0 space-y-12">
          {/* ── processing ── */}
          {job && job.stage !== "done" && <Progress state={state} onRetry={() => start(false)} onRestart={() => start(true)} />}

          {!analysis && !job && (
            <section>
              <Heading jp="概要" title="Abstract" />
              <p className="mt-4 text-[17px] leading-relaxed max-w-[70ch]">
                {paper.abstractIsSnippet && <span className="font-mono text-xs uppercase mr-2 bg-paper-2 px-1">search snippet</span>}
                {paper.abstract ?? "No abstract was provided by the source."}
              </p>
              <div className="mt-8 ink-frame p-6 grid sm:grid-cols-[110px_1fr] gap-5 items-center">
                <Character id="hoshi" expression="happy" pose="explain" />
                <div>
                  <div className="font-display text-lg">What happens when you turn this into manga</div>
                  <p className="mt-2 text-ink-2 leading-relaxed">
                    TinyFish retrieves the openly available text (a browser agent steps in if a simple fetch isn’t enough, and never bypasses paywalls). Kenshō then
                    extracts the problem, method, results and limits — each tied to a quote — and draws chapters you can read in a few minutes.
                  </p>
                </div>
              </div>
            </section>
          )}

          {analysis && (
            <>
              <section>
                <Heading jp="問題" title="The problem" />
                <p className="mt-4 text-[17px] leading-relaxed max-w-[70ch]">{analysis.problem}</p>
              </section>
              <section>
                <Heading jp="貢献" title="Main contribution" />
                <p className="mt-4 text-[17px] leading-relaxed max-w-[70ch]">{analysis.contribution}</p>
              </section>
              <section>
                <Heading jp="目次" title="Chapters" />
                <ol className="mt-5 grid gap-3">
                  {analysis.chapterPlan.map((plan, i) => {
                    const ch = chapters[i];
                    return (
                      <li key={plan.number}>
                        <ChapterRow id={id} n={plan.number} title={ch?.title ?? plan.title} kicker={ch?.kicker} summary={ch?.summary || plan.focus} ready={!!ch} pages={ch?.pages.length} current={progress?.chapter === plan.number} drawing={busy} />
                      </li>
                    );
                  })}
                </ol>
              </section>
              {analysis.quiz.length > 0 && readyChapters > 0 && (
                <section id="quiz">
                  <Heading jp="確認" title="Test your understanding" />
                  <p className="mt-2 text-ink-3 text-sm">Every answer is backed by a claim from the paper.</p>
                  <div className="mt-5">
                    <Quiz paperId={id} questions={analysis.quiz} claims={analysis.claims} onClaim={(c) => (window.location.href = `/read/${id}?claim=${c}`)} />
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 self-start">
          {analysis && analysis.prerequisites.length > 0 && (
            <div>
              <h3 className="font-display text-sm tracking-widest border-b-[3px] border-ink pb-2">BEFORE YOU READ</h3>
              <ul className="mt-3 space-y-3">
                {analysis.prerequisites.map((p) => (
                  <li key={p.concept} className="border-2 border-ink bg-white p-3">
                    <div className="font-bold">{p.concept}</div>
                    <div className="text-sm text-ink-2 mt-1 leading-snug">{p.why}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {acquisition && (
            <div>
              <h3 className="font-display text-sm tracking-widest border-b-[3px] border-ink pb-2">SOURCE TRAIL</h3>
              <ul className="mt-3 space-y-1.5 font-mono text-xs text-ink-2">
                <li>
                  Read from:{" "}
                  <a className="underline break-all" href={acquisition.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {acquisition.sourceUrl}
                  </a>
                </li>
                <li>Steps: {acquisition.via.join(" → ")}</li>
                <li>
                  {acquisition.sections.length} sections · {Math.round(acquisition.chars / 1000)}k chars
                </li>
                {analysis && (
                  <li>
                    {analysis.claims.filter((c) => c.verified).length}/{analysis.claims.length} quotes verified
                  </li>
                )}
                {acquisition.notes.map((n, i) => (
                  <li key={i} className="text-ink-3">
                    · {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Related id={id} />
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-ink bg-white px-3 py-2">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-3">{label}</dt>
      <dd className="font-bold mt-0.5">{children}</dd>
    </div>
  );
}

function Heading({ jp, title }: { jp: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b-[3px] border-ink pb-2">
      <span className="font-display text-red text-xs tracking-[0.3em]">{jp}</span>
      <h2 className="font-display text-2xl">{title}</h2>
    </div>
  );
}

function ChapterRow(p: { id: string; n: number; title: string; kicker?: string; summary: string; ready: boolean; pages?: number; current: boolean; drawing: boolean }) {
  const inner = (
    <div className={`flex items-center gap-4 border-[3px] border-ink p-4 transition-all ${p.ready ? "bg-white hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)]" : "bg-paper-2 border-dashed"}`}>
      <span className={`font-display text-2xl w-12 h-12 grid place-items-center shrink-0 ${p.ready ? "bg-ink text-white" : "bg-white text-ink-3 border-2 border-ink/40"}`}>{p.n}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {p.kicker && <span className="font-display text-red text-xs">{p.kicker}</span>}
          <span className="font-display text-lg leading-tight">{p.title}</span>
        </div>
        <p className="text-sm text-ink-2 mt-0.5 line-clamp-2">{p.summary}</p>
      </div>
      <span className="font-mono text-xs text-ink-3 shrink-0 text-right">
        {p.ready ? `${p.pages} pages` : p.drawing ? <Spinner label="inking" /> : "not drawn"}
        {p.current && <span className="block text-red font-bold">reading</span>}
      </span>
    </div>
  );
  return p.ready ? <Link href={`/read/${p.id}?ch=${p.n}`}>{inner}</Link> : inner;
}

function Progress({ state, onRetry, onRestart }: { state: ProcessedPaper; onRetry: () => void; onRestart: () => void }) {
  const job = state.job!;
  const failed = job.stage === "error";
  const order = ["queued", "acquiring", "analyzing", "drawing", "done"];
  const at = order.indexOf(job.stage);
  const doneUpTo = failed ? (state.analysis ? 2 : state.acquisition ? 1 : 0) : at - 1;
  return (
    <section aria-live="polite">
      <div className="ink-frame ink-shadow p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] w-36 opacity-95 hidden sm:block">
          <Character id={failed ? "kai" : job.stage === "acquiring" ? "sumi" : "hoshi"} expression={failed ? "worried" : job.stage === "drawing" ? "excited" : "thinking"} pose={failed ? "shock" : "think"} />
        </div>
        <div className="font-display text-red text-xs tracking-[0.3em]">{failed ? "中断" : "制作中"}</div>
        <h2 className="font-display text-2xl mt-1">{failed ? "Drawing paused" : job.message}</h2>
        <ol className="mt-5 grid sm:grid-cols-3 gap-3 sm:pr-36">
          {STAGES.map((s, i) => {
            const done = i < doneUpTo || job.stage === "done";
            const active = !failed && order[at] === s.key;
            return (
              <li key={s.key} className={`border-2 p-3 ${active ? "border-ink bg-ink text-white" : done ? "border-ink bg-white" : "border-ink/30 bg-white text-ink-3"}`}>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm">{s.jp}</span>
                  {done && <span className="ml-auto font-black">✓</span>}
                  {active && <span className="ml-auto w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="font-bold text-sm mt-1">{s.label}</div>
                <div className={`text-xs mt-0.5 ${active ? "text-white/75" : "text-ink-3"}`}>
                  {s.key === "drawing" && job.chaptersTotal ? `${job.chaptersDone}/${job.chaptersTotal} chapters` : s.note}
                </div>
              </li>
            );
          })}
        </ol>
        <ul className="mt-5 font-mono text-xs space-y-1 max-h-44 overflow-auto sm:pr-36">
          {job.log.slice(-8).map((l, i, arr) => (
            <li key={i} className={i === arr.length - 1 ? "text-ink" : "text-ink-3"}>
              <span className="opacity-60">{new Date(l.at).toLocaleTimeString()}</span> {l.text}
            </li>
          ))}
        </ul>
        {failed && (
          <div className="mt-5 sm:pr-36">
            <p className="text-red font-bold text-sm">{job.error}</p>
            <div className="flex gap-3 mt-4">
              <button className="btn-ink" onClick={onRetry}>
                RESUME ▸
              </button>
              <button className="btn-line" onClick={onRestart}>
                Start over
              </button>
            </div>
          </div>
        )}
        {!failed && state.story && state.story.chapters[0] && (
          <Link href={`/read/${state.paper.id}?ch=1`} className="btn-ink mt-5">
            READ CHAPTER 1 NOW ▸
          </Link>
        )}
      </div>
    </section>
  );
}

function Related({ id }: { id: string }) {
  const [papers, setPapers] = useState<Paper[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api<{ papers: Paper[] }>(`/api/papers/${id}/related`)
      .then((r) => setPapers(r.papers))
      .catch(() => setErr(true));
  }, [id]);
  return (
    <div>
      <h3 className="font-display text-sm tracking-widest border-b-[3px] border-ink pb-2 flex items-center">
        RELATED RESEARCH <span className="ml-auto font-mono text-[10px] text-ink-3 tracking-normal">via TinyFish</span>
      </h3>
      {!papers && !err && (
        <div className="mt-3">
          <Spinner label="Searching related papers…" />
        </div>
      )}
      {err && <p className="mt-3 text-sm text-ink-3">Related papers couldn’t be loaded right now.</p>}
      {papers && papers.length === 0 && <p className="mt-3 text-sm text-ink-3">No closely related papers found.</p>}
      <ul className="mt-3 space-y-3">
        {papers?.map((p) => (
          <li key={p.id}>
            <Link href={`/paper/${p.id}`} className="flex gap-3 group">
              <div className="w-14 shrink-0">
                <PaperCover paper={p} size="sm" className="!border-2" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm leading-snug group-hover:underline line-clamp-3">{p.title}</div>
                <div className="text-xs text-ink-3 mt-0.5">
                  {p.authors[0] ?? ""}
                  {p.year ? ` · ${p.year}` : ""}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
