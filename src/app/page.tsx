import Link from "next/link";
import { Footer, SearchBar, SiteHeader } from "@/components/ui/chrome";
import { PaperCover } from "@/components/ui/PaperCover";
import { Scene } from "@/components/manga/scenes";
import { Character } from "@/components/manga/characters";
import { recentSearches, recentlyDrawn } from "@/server/db";
import type { SceneId } from "@/lib/types";
import { HomeHero, HowItWorks, SectionTitle } from "./HomeHero";

export const dynamic = "force-dynamic";

const FEATURED: { topic: string; jp: string; scene: SceneId }[] = [
  { topic: "Large language models", jp: "言語モデル", scene: "circuit" },
  { topic: "Quantum computing", jp: "量子計算", scene: "space" },
  { topic: "CRISPR gene editing", jp: "遺伝子編集", scene: "cells" },
  { topic: "Neural networks", jp: "神経回路網", scene: "speed" },
  { topic: "Diffusion models for images", jp: "拡散モデル", scene: "sparkle" },
  { topic: "Adversarial attacks on machine learning", jp: "敵対的攻撃", scene: "storm" },
  { topic: "Proof assistants and formal verification", jp: "形式検証", scene: "grid" },
  { topic: "Behavioral economics nudges", jp: "行動経済学", scene: "city" },
];

export default function Home() {
  const searches = recentSearches(10);
  const drawn = recentlyDrawn(6);

  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero />
        <HowItWorks />

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-20">
          <SectionTitle jp="引用" title="Grounded, not made up" />
          <div className="mt-8 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
            <div className="space-y-4 text-[17px] leading-relaxed text-ink-2 max-w-[56ch]">
              <p>
                Kenshō separates <strong className="text-ink">what the paper says</strong> from <strong className="text-ink">how we explain it</strong>. Research claims
                carry citation chips that open the exact sentence from the paper. Analogies wear a <span className="font-black text-ink">喩 ANALOGY</span> tag so you
                always know when you are reading a simplification.
              </p>
              <p>
                Each quote is checked against the text we actually retrieved. Matches earn a red <span className="text-red font-black">検証</span> stamp; anything we
                couldn’t match is shown as unverified instead of being passed off as fact. Numbers in charts must appear in a verified quote, or the chart isn’t drawn.
              </p>
            </div>
            <figure className="relative">
              <div className="ink-frame ink-shadow p-6 bg-paper relative overflow-hidden">
                <div className="absolute inset-0 tone-lines opacity-[0.06]" />
                <div className="relative flex items-center gap-2">
                  <span className="bg-ink text-white font-display text-[10px] tracking-[0.2em] px-2 py-0.5">論文より · FROM THE PAPER</span>
                  <span className="font-mono text-[11px] text-ink-3">S2 · Abstract</span>
                </div>
                <blockquote className="relative mt-4 font-serif text-xl leading-snug pr-24">
                  <span className="font-display text-5xl leading-none absolute -left-1 -top-3">“</span>
                  <span className="pl-7 block">We propose a new simple network architecture, the Transformer, based solely on attention mechanisms…</span>
                </blockquote>
                <p className="relative mt-4 border-l-[3px] border-ink pl-3 text-[15px]">
                  <strong>In plain words:</strong> the authors replace recurrence entirely with attention.
                </p>
                <span className="absolute right-6 top-14 w-20 h-20 rounded-full border-[3px] border-red text-red grid place-items-center rotate-[-8deg]">
                  <span className="text-center leading-none">
                    <span className="block font-display text-lg">検証</span>
                    <span className="block font-mono text-[8px] mt-0.5">VERIFIED</span>
                  </span>
                </span>
              </div>
              <figcaption className="mt-3 font-mono text-xs text-ink-3">How a claim panel looks · quote from Vaswani et al., “Attention Is All You Need” (2017), arXiv:1706.03762</figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-20">
          <SectionTitle jp="特集" title="Start with a topic" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURED.map((f, i) => (
              <Link
                key={f.topic}
                href={`/search?q=${encodeURIComponent(f.topic)}`}
                className={`group relative overflow-hidden border-[3px] border-ink bg-white ${i === 0 || i === 5 ? "md:col-span-2" : ""} h-40 sm:h-44`}
              >
                <Scene id={f.scene} seed={i + 4} className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="font-display text-red text-[11px] tracking-[0.2em]">{f.jp}</div>
                  <div className="font-display text-lg leading-tight mt-0.5 group-hover:underline decoration-[3px] underline-offset-4">{f.topic}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-20">
          <SectionTitle jp="最近" title="Recently explored" aside={<span className="font-mono text-xs text-ink-3">from this Kenshō instance</span>} />
          {drawn.length === 0 && searches.length === 0 ? (
            <div className="mt-8 ink-frame p-8 flex items-center gap-6">
              <div className="w-24 shrink-0">
                <Character id="sumi" expression="thinking" />
              </div>
              <p className="text-lg text-ink-2">Nothing has been explored here yet. Search a topic above and your manga will appear on this shelf.</p>
            </div>
          ) : (
            <div className="mt-8 grid lg:grid-cols-[1fr_300px] gap-10">
              <div>
                {drawn.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {drawn.map(({ paper, chapters }) => (
                      <Link key={paper.id} href={`/paper/${paper.id}`} className="group">
                        <PaperCover paper={paper} size="sm" className="transition-transform group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_var(--ink)]" />
                        <div className="mt-2 font-mono text-[11px] text-ink-3">
                          {chapters} chapter{chapters === 1 ? "" : "s"} drawn
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-3">No manga drawn yet — pick a paper from a search to draw the first one.</p>
                )}
              </div>
              <div>
                <h3 className="font-display text-sm tracking-widest mb-3">RECENT SEARCHES</h3>
                <ul className="flex flex-col">
                  {searches.map((s) => (
                    <li key={s.query}>
                      <Link href={`/search?q=${encodeURIComponent(s.query)}`} className="flex items-baseline gap-2 py-2 border-b-2 border-ink/15 hover:border-ink group">
                        <span className="font-bold group-hover:underline">{s.query}</span>
                        <span className="ml-auto font-mono text-[11px] text-ink-3 shrink-0">{s.count} papers</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        <section className="mt-24 relative overflow-hidden bg-ink text-white border-y-[3px] border-ink">
          <Scene id="focus" seed={21} className="absolute inset-0 w-full h-full opacity-[0.12] invert" />
          <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-16 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="font-display text-red tracking-[0.3em] text-sm">次の話へ</div>
              <h2 className="font-display text-[clamp(32px,5vw,60px)] leading-[0.95] mt-2">
                YOUR FIRST CHAPTER IS
                <br />
                ONE SEARCH AWAY.
              </h2>
              <div className="mt-8 max-w-[620px] text-ink">
                <SearchBar size="md" />
              </div>
            </div>
            <div className="hidden md:block w-56">
              <Character id="kai" expression="excited" pose="cheer" className="invert" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
