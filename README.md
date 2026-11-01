# Kenshō 見性 — research, read like manga

Search a topic → Kenshō finds real papers on the web with **TinyFish** → pick one → it reads the paper and redraws it as grounded, cited manga chapters.

## Run it

```bash
cp .env.example .env    # add TINYFISH_API_KEY and GEMINI_API_KEY
npm install
npm run dev             # http://localhost:3000
```

Node 22.5+ is required (uses the built-in `node:sqlite`). Data lives in `./data/kensho.db`.

## How it works

```
src/server/          research pipeline (server-only, no React)
  tinyfish.ts        REST client: Search, Fetch, Agent (/v1/automation/run-sse)
  discovery.ts       topic → papers: 3 parallel TinyFish searches, normalise, dedupe, arXiv metadata enrichment
  acquire.ts         paper → text: TinyFish Fetch over all candidates; TinyFish Agent fallback finds an
                     *open* full-text link (never logs in / bypasses paywalls); sectioning; abstract-only mode
  analyze.ts         Gemini extracts problem, method, results, limits, glossary, quiz, chapter plan;
                     every claim carries a verbatim quote that is checked against the fetched text
  storyboard.ts      Gemini writes each chapter as semantic panels; output is validated
                     (unknown refs dropped, chart numbers must appear in a verified quote)
  llm.ts             Gemini generateContent with JSON-schema output (fallbacks if a schema is rejected)
  pipeline.ts        background job: stage-by-stage persistence, parallel chapters, resume on failure
src/components/manga/  renderer (independent of the pipeline)
  characters.tsx     reusable SVG cast — Prof. Hoshi, Kai, Sumi — 9 expressions × 6 poses
  scenes.tsx         14 backgrounds/effects (classroom, lab, speed lines, focus burst, …)
  layout.ts          page templates with slanted gutters, chosen per page from panel weight + content
  lettering.tsx      speech / thought / shout / whisper bubbles, analogy tags, citation chips, glossary terms
  diagrams.tsx       interactive flow, layers, compare, steps, bars, cycle, network, equation, sequence
src/components/mascot/Sumi.tsx   Sumi the ink-fish: page-mascot (cursor-tracking, pokeable) for interactive
                     spots; scripted loops over the same sprite sheets for loading states
src/components/opening/          first-visit title card (skippable, remembered, sound off by default)
src/components/ui/motion.tsx     Reveal / Ribbon / Episode — shared, reduced-motion-aware motion
scripts/build-mascot.mjs         renders Sumi's 3×3 sprite sheets into public/mascots (node scripts/build-mascot.mjs)
src/app/             landing, /search, /paper/[id], /read/[id], /library, API routes
```

**Flow.** Open → Discover (`/search`, live TinyFish progress streamed from `/api/search?stream=1`) →
Paper (`/paper/[id]`, one action) → Read (`/read/[id]` prepares the manga in place, then opens chapter one).
Replay the opening with `/?intro=1`.

**Grounding rules.** Research statements cite claim IDs; each claim shows its verbatim excerpt and a
verified/unverified stamp. Analogies are visibly marked. Full text never leaves the server — the client
only receives section headings and short quotes, and every page links to the original source.

**TinyFish usage.** Search and Fetch are free; the Agent fallback is metered and only runs when Fetch
can't reach open full text. Set `TINYFISH_AGENT_FALLBACK=off` to disable it.

Reader state (bookmarks, progress, saved concepts, quiz scores) is stored per browser in `localStorage`.
