import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import {
  ON_AIR_SITE,
  formatVotes,
  ranked,
  useBoard,
  watchUrl,
  WHEEL_VOTES,
} from "@/lib/board-store";
import { Field, GhostButton, GoldButton, Panel, fieldClass } from "@/components/show/bits";
import { EntryDesk } from "@/components/show/entry-desk";
import { FeelsWheel } from "@/components/show/feels-wheel";
import { MiniBoard, Scoreboard } from "@/components/show/scoreboard";

const NAV = [
  { href: "#board", label: "Board" },
  { href: "#enter", label: "Enter" },
  { href: "#wheel", label: "Wheel" },
  { href: "#live", label: "Live" },
];

const NOW_PLAYING = ["Kandi Kane", "PP_7mw", "Jacob Hord", "HoneyBliss"];

const PILLARS = ["Music", "Games", "People", "Good vibes"];
const RISE = ["Sing", "Play", "Compete", "Rise"];

export function Portal() {
  const hydrate = useBoard((s) => s.hydrate);
  const tick = useBoard((s) => s.tick);

  useEffect(() => {
    hydrate();
    const id = window.setInterval(() => tick(), 2800);
    return () => window.clearInterval(id);
  }, [hydrate, tick]);

  return (
    <div className="min-h-screen overflow-x-hidden text-fg">
      <TopBar />
      <PreviewStrip />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:gap-10 sm:py-10">
        <Hero />
        <NowPlaying />
        <Scoreboard />
        <EntryDesk />
        <FeelsWheel />
        <HowItWorks />
      </main>
      <RiseBand />
      <Footer />
    </div>
  );
}

function TopBar() {
  const simulating = useBoard((s) => s.simulating);
  return (
    <header className="sticky top-0 z-30 border-b-2 border-primary bg-black/60 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <img src="/art/mascot.jpg" alt="" className="h-10 w-10 shrink-0 border-2 border-primary object-cover" />
          <span className="min-w-0 leading-none">
            <span className="block text-xs font-bold tracking-widest text-fg uppercase">Presented by</span>
            <span className="wordmark block truncate text-2xl">
              <span className="text-accent">Super</span>
              <span className="text-primary">Boov</span>
            </span>
          </span>
        </a>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
            className="inline-flex h-11 items-center px-3 text-sm font-bold tracking-widest text-fg uppercase hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex">
            <span className={`h-2 w-2 rounded-full bg-live ${simulating ? "live-dot" : ""}`} />
            {simulating ? "Board live" : "Board paused"}
          </span>
          <a
            href="#enter"
            className="tag inline-flex h-11 items-center px-4 text-sm"
          >
            Enter
          </a>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="tag-line inline-flex h-10 shrink-0 items-center px-3 text-sm text-muted"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function PreviewStrip() {
  const simulating = useBoard((s) => s.simulating);
  const setSimulating = useBoard((s) => s.setSimulating);
  return (
    <div className="border-b border-primary/40 bg-black/45">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm leading-normal text-muted">
          Preview votes, so you can watch the board move. Real TikTok counts plug into this same list.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={simulating}
          onClick={() => setSimulating(!simulating)}
          className="tag-line inline-flex h-11 items-center gap-2 px-3 text-sm"
        >
          <span className={`h-6 w-10 rounded-full p-1 ${simulating ? "bg-primary" : "bg-border"}`}>
            <span
              className={`block h-4 w-4 rounded-full transition ${simulating ? "translate-x-4 bg-ink" : "bg-fg"}`}
            />
          </span>
          Preview votes
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const contestants = useBoard((s) => s.contestants);
  const liveUrl = useBoard((s) => s.liveUrl);
  const setLiveUrl = useBoard((s) => s.setLiveUrl);
  const order = ranked(contestants);
  const votes = order.reduce((sum, c) => sum + c.votes, 0);
  const onWheel = order.filter((c) => c.votes >= WHEEL_VOTES).length;
  const href = watchUrl(liveUrl);

  return (
    <section id="top" className="poster">
      <div className="grid items-start gap-8 p-4 sm:p-8 lg:grid-cols-2 lg:p-10">
        <div>
          <p className="spray text-2xl text-primary sm:text-3xl">Groove with Boov</p>
          <h1 className="spray gold-type mt-3 text-4xl sm:text-6xl lg:text-7xl">
            <span className="block">King</span>
            <span className="block">Queen</span>
            <span className="block">of the Feels</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-snug text-fg">
            Front door to the competition. Put a name on the wall, sponsor somebody in, and watch the live votes climb.
          </p>
          <p className="spray mt-4 text-2xl text-primary">Queue is open</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PILLARS.map((word) => (
              <span key={word} className="tag-line px-3 py-2 text-sm text-primary">
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:row-span-2">
          <img
            src="/art/mascot.jpg"
            alt="Graffiti purple octopus with a gold crown, chain, and microphone"
            className="w-full border-[3px] border-primary shadow-[0_0_0_1px_#6d28d9]"
          />
          <MiniBoard />
          <VoteFeed />
        </div>

        <div>
          <dl className="grid grid-cols-3 gap-3">
            <Stat label="On the board" value={String(order.length)} />
            <Stat label="Votes tonight" value={formatVotes(votes)} />
            <Stat label="On the wheel" value={String(onWheel)} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#enter" className="tag inline-flex h-12 items-center px-5">
              Enter or sponsor
            </a>
            <a href={href} target="_blank" rel="noreferrer" className="tag-line inline-flex h-12 items-center gap-2 px-5">
              Watch the live
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <form
            className="mt-5 max-w-lg"
            onSubmit={(event) => {
              event.preventDefault();
              window.open(href, "_blank", "noopener,noreferrer");
            }}
          >
            <Field
              label="His TikTok live link"
              hint="Paste it once. Watch the live keeps it on this device. Blank opens a SuperBoov search."
            >
              <input
                className={fieldClass}
                inputMode="url"
                placeholder="https://www.tiktok.com/@…"
                value={liveUrl}
                onChange={(event) => setLiveUrl(event.target.value)}
              />
            </Field>
          </form>
        </div>
      </div>
    </section>
  );
}

function VoteFeed() {
  const contestants = useBoard((s) => s.contestants);
  const pings = useBoard((s) => s.pings);
  return (
    <Panel>
      <div className="px-4 py-4">
        <p className="spray mb-3 text-2xl text-primary">Votes hitting</p>
        <ul className="flex flex-col gap-2" aria-live="polite">
          {pings.slice(0, 4).map((ping) => {
            const who = contestants.find((c) => c.id === ping.contestantId);
            const label =
              ping.source === "entry"
                ? `${ping.voter} joined the queue`
                : ping.source === "sponsor"
                  ? `${ping.voter} boosted ${who?.name ?? "a name"} +${ping.amount}`
                  : `+${ping.amount} TikTok · ${ping.voter} → ${who?.name ?? "the board"}`;
            return (
              <li key={ping.id} className="ping-in truncate text-sm text-fg">
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="poster px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-3xl leading-none text-primary tabular-nums">{value}</dd>
    </div>
  );
}

function NowPlaying() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((n) => (n + 1) % NOW_PLAYING.length), 7000);
    return () => window.clearInterval(id);
  }, []);
  const title = NOW_PLAYING[index] ?? "Kandi Kane";
  return (
    <div id="live" className="poster flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-5">
      <span className="spray inline-flex items-center gap-2 text-xl text-primary">
        <span className="live-dot h-2 w-2 rounded-full bg-live" />
        Now playing
      </span>
      <span className="font-semibold">{title}</span>
      <span className="text-sm text-muted">2 free submissions · queue is open</span>
      <a href={ON_AIR_SITE} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary sm:ml-auto">
        superboov.whozfire.com
      </a>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Enter or get sponsored",
      body: "A name hits the queue from this desk — the contestant, or someone putting them on.",
    },
    {
      n: "02",
      title: "The live reads the board",
      body: "Same ranking SuperBoov can pull up in the studio, next to the octopus and the crowns.",
    },
    {
      n: "03",
      title: "TikTok votes move rank",
      body: "Gifts and votes from the live are the score. Ten of them puts that name on the wheel.",
    },
  ];
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {steps.map((step) => (
        <Panel key={step.n}>
          <div className="px-5 py-5">
            <p className="font-display text-3xl text-primary">{step.n}</p>
            <h2 className="spray mt-2 text-3xl text-primary">{step.title}</h2>
            <p className="mt-2 text-sm leading-normal text-muted">{step.body}</p>
          </div>
        </Panel>
      ))}
    </section>
  );
}

function RiseBand() {
  return (
    <ul className="grid grid-cols-2 border-y-2 border-primary bg-black/55 md:grid-cols-4">
      {RISE.map((word) => (
        <li key={word} className="spray px-4 py-6 text-center text-3xl text-primary md:text-4xl">
          {word}
        </li>
      ))}
    </ul>
  );
}

function Footer() {
  const reset = useBoard((s) => s.reset);
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-4 bg-black/55 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        SuperBoov · King/Queen of the Feels
        <span className="block">Music brings us together.</span>
      </p>
      <div className="flex flex-wrap gap-3">
        <GhostButton type="button" onClick={reset}>
          Reset sample board
        </GhostButton>
        <GoldButton type="button" onClick={() => document.getElementById("enter")?.scrollIntoView({ behavior: "smooth" })}>
          Enter a name
        </GoldButton>
      </div>
    </footer>
  );
}
