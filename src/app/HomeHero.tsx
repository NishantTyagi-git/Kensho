"use client";

import Link from "next/link";
import type { MangaPage } from "@/lib/types";
import { MangaPageView } from "@/components/manga/MangaPage";
import { SearchBar } from "@/components/ui/chrome";
import { Character } from "@/components/manga/characters";
import { Scene } from "@/components/manga/scenes";

// The hero page is rendered by the same engine as the reader, so what you see here is
// exactly how chapters look. Its dialogue is product copy, not research content.
const HERO_PAGE: MangaPage = {
  panels: [
    {
      kind: "dialogue",
      size: "wide",
      refs: [],
      scene: "speed",
      sfx: "DOKI",
      cast: [
        { character: "kai", expression: "surprised", pose: "shock" },
        { character: "hoshi", expression: "smug", pose: "point" },
      ],
      lines: [
        { speaker: "kai", text: "Wait… I just read a 40-page research paper?!", style: "shout", basis: "aside", refs: [] },
        { speaker: "hoshi", text: "Every paper is a story. You only needed it drawn.", style: "speech", basis: "aside", refs: [] },
      ],
    },
    {
      kind: "dialogue",
      size: "medium",
      refs: [],
      scene: "circuit",
      cast: [{ character: "sumi", expression: "excited", pose: "idle" }],
      lines: [{ speaker: "sumi", text: "I swim the web with TinyFish and fetch the real papers!", style: "speech", basis: "aside", refs: [] }],
    },
    {
      kind: "dialogue",
      size: "medium",
      refs: [],
      scene: "focus",
      cast: [{ character: "hoshi", expression: "serious", pose: "explain" }],
      lines: [{ speaker: "hoshi", text: "Every claim stays tied to the exact words in the paper.", style: "speech", basis: "aside", refs: [] }],
    },
  ],
};

const TOPICS = ["How do large language models work?", "Quantum error correction", "CRISPR gene editing", "Diffusion models", "Black hole information paradox", "Zero-knowledge proofs"];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b-[3px] border-ink">
      <div className="absolute inset-0 tone-fade opacity-[0.07] pointer-events-none" />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 pt-10 sm:pt-16 pb-14 grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
        <div className="ink-in">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-display text-red text-sm tracking-[0.3em]">研究を、漫画で読む。</span>
            <span className="h-[3px] w-16 bg-ink" />
          </div>
          <h1 className="font-display leading-[0.92] tracking-[-0.01em] text-[clamp(44px,7.4vw,96px)]">
            RESEARCH,
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">READ LIKE</span>
              <span className="absolute left-0 right-0 bottom-[8%] h-[30%] tone-dots opacity-30 -z-0" />
            </span>
            <br />
            <span className="inline-block bg-ink text-white px-3 -rotate-[1.5deg] mt-2 shadow-[8px_8px_0_var(--red)]">MANGA.</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl leading-relaxed max-w-[34ch] text-ink-2">
            Type a topic. Kenshō finds real papers across the web, reads them, and redraws them as manga chapters — with every claim cited back to the source.
          </p>
          <div className="mt-8 max-w-[620px]">
            <SearchBar autoFocus />
          </div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Try a topic">
            {TOPICS.map((t) => (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(t)}`}
                className="text-sm font-bold border-2 border-ink bg-white px-2.5 py-1 hover:bg-ink hover:text-white transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-6 -right-4 w-40 h-40 tone-dots-lg opacity-20 rotate-12 pointer-events-none" />
          <div className="relative rotate-[1.2deg] border-[3px] border-ink shadow-[12px_12px_0_var(--ink)] bg-white max-w-[560px] mx-auto">
            <MangaPageView page={HERO_PAGE} pageNumber={1} chapterKicker="第一話 · how it feels" seedKey="hero-v3" />
          </div>
          <div className="absolute -left-6 bottom-10 hidden md:block w-28 swim pointer-events-none">
            <Character id="sumi" expression="happy" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      jp: "探す",
      title: "Ask anything",
      body: "TinyFish searches research indexes and open repositories — arXiv, OpenReview, PubMed Central and more — and returns real papers, de-duplicated, with their original links.",
      art: (
        <div className="relative h-full">
          <Scene id="circuit" seed={3} className="absolute inset-0 w-full h-full" />
          <div className="absolute left-[8%] top-[18%] w-[46%] swim">
            <Character id="sumi" expression="excited" />
          </div>
          <div className="absolute right-[6%] top-[14%] flex flex-col gap-1.5">
            {["arxiv.org", "openreview.net", "ncbi.nlm.nih.gov"].map((d, i) => (
              <span key={d} className="bg-white border-2 border-ink font-mono text-[10px] px-1.5 py-0.5 ink-in" style={{ animationDelay: `${i * 160}ms` }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      n: "02",
      jp: "読む",
      title: "Kenshō reads it",
      body: "The full text is fetched when it is openly available — a TinyFish browser agent looks for open links when plain fetching is not enough. Paywalls are respected; abstract-only papers are labelled.",
      art: (
        <div className="relative h-full bg-paper">
          <div className="absolute inset-0 tone-lines opacity-[0.08]" />
          <div className="absolute left-[10%] top-[14%] right-[30%] space-y-1.5">
            {[90, 76, 84, 60, 88, 70].map((w, i) => (
              <div key={i} className={`h-2 ${i === 2 ? "bg-red" : "bg-ink"}`} style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="absolute right-[-4%] bottom-0 w-[52%]">
            <Character id="hoshi" expression="thinking" pose="think" />
          </div>
        </div>
      ),
    },
    {
      n: "03",
      jp: "わかる",
      title: "Read it as manga",
      body: "Chapters with characters, diagrams and key terms. Simplified analogies are marked as analogies; every research claim links to a verbatim quote from the paper.",
      art: (
        <div className="relative h-full">
          <Scene id="focus" seed={9} className="absolute inset-0 w-full h-full" />
          <div className="absolute left-[-4%] bottom-0 w-[54%]">
            <Character id="kai" expression="excited" pose="cheer" />
          </div>
          <span className="absolute right-[10%] top-[18%] w-20 h-20 rounded-full border-[3px] border-red text-red grid place-items-center rotate-[-8deg] bg-white">
            <span className="text-center leading-none">
              <span className="block font-display text-lg">検証</span>
              <span className="block font-mono text-[8px] mt-0.5">VERIFIED</span>
            </span>
          </span>
        </div>
      ),
    },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-20">
      <SectionTitle jp="仕組み" title="How it works" />
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <article key={s.n} className="ink-frame flex flex-col" style={{ clipPath: i === 1 ? "polygon(3% 0, 100% 0, 97% 100%, 0 100%)" : undefined }}>
            <div className="relative h-48 border-b-[3px] border-ink overflow-hidden">{s.art}</div>
            <div className="p-5 flex-1">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl">{s.n}</span>
                <span className="font-display text-red text-sm tracking-widest">{s.jp}</span>
              </div>
              <h3 className="font-display text-xl mt-2">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SectionTitle({ jp, title, aside }: { jp: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-end gap-4 border-b-[3px] border-ink pb-3">
      <div>
        <div className="font-display text-red text-xs tracking-[0.3em]">{jp}</div>
        <h2 className="font-display text-3xl sm:text-4xl leading-none mt-1">{title}</h2>
      </div>
      {aside && <div className="ml-auto">{aside}</div>}
    </div>
  );
}
