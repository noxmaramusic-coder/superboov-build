import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Crown } from "lucide-react";
import {
  LANES,
  WHEEL_VOTES,
  formatVotes,
  initials,
  ranked,
  useBoard,
  type Contestant,
  type Lane,
} from "@/lib/board-store";
import { Panel } from "@/components/show/bits";

type Filter = "All" | "Sponsored" | Lane;

export function MiniBoard() {
  const contestants = useBoard((s) => s.contestants);
  const top = ranked(contestants).slice(0, 5);
  const max = top[0]?.votes || 1;
  return (
    <Panel>
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="spray text-2xl text-primary">Leaderboard</p>
          <a href="#board" className="text-sm font-semibold text-muted hover:text-fg">
            Full board
          </a>
        </div>
        <ol className="flex flex-col gap-2">
          {top.map((c, index) => (
            <MiniRow key={c.id} contestant={c} place={index + 1} max={max} />
          ))}
        </ol>
      </div>
    </Panel>
  );
}

function MiniRow({ contestant, place, max }: { contestant: Contestant; place: number; max: number }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`w-5 font-display text-xl tabular-nums ${place === 1 ? "text-primary" : "text-muted"}`}>
        {place}
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-xs font-semibold text-muted">
        {place === 1 ? <Crown className="h-3.5 w-3.5 text-primary" /> : initials(contestant.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{contestant.name}</span>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-bg">
          <span
            className={`block h-full rounded-full ${place === 1 ? "bg-primary" : "bg-accent"}`}
            style={{ width: `${Math.max(8, Math.round((contestant.votes / max) * 100))}%` }}
          />
        </span>
      </span>
      <span className="font-display text-2xl leading-none text-primary tabular-nums">
        {formatVotes(contestant.votes)}
      </span>
    </li>
  );
}

export function Scoreboard() {
  const contestants = useBoard((s) => s.contestants);
  const highlightId = useBoard((s) => s.highlightId);
  const [filter, setFilter] = useState<Filter>("All");
  const order = useMemo(() => ranked(contestants), [contestants]);
  const max = order[0]?.votes || 1;
  const orderRef = useRef(order);
  orderRef.current = order;
  const prevRanks = useRef<Record<string, number>>({});
  const [movement, setMovement] = useState<Record<string, number>>({});
  const signature = order.map((c) => `${c.id}:${c.votes}`).join("|");

  useEffect(() => {
    const next: Record<string, number> = {};
    const delta: Record<string, number> = {};
    orderRef.current.forEach((c, index) => {
      const previous = prevRanks.current[c.id];
      delta[c.id] = previous == null ? 0 : previous - index;
      next[c.id] = index;
    });
    prevRanks.current = next;
    setMovement(delta);
  }, [signature]);

  const shown = order.filter((c) => {
    if (filter === "All") return true;
    if (filter === "Sponsored") return c.sponsors.length > 0;
    return c.lane === filter;
  });

  const filters: Filter[] = ["All", "Sponsored", ...LANES];

  return (
    <Panel id="board">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="spray text-2xl text-primary">The board</p>
            <h2 className="spray text-4xl text-primary sm:text-5xl">Scoreboard</h2>
            <p className="mt-2 max-w-xl text-sm leading-normal text-muted sm:text-base">
              Sample names are from recent Groove nights so the shape is familiar. Enter a real one and it joins this same list.
            </p>
          </div>
          <p className="font-display text-2xl tracking-wide text-primary tabular-nums">
            {formatVotes(order.reduce((sum, c) => sum + c.votes, 0))} votes
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => {
            const on = item === filter;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`h-11 shrink-0 px-4 text-sm font-extrabold ${
                  on ? "tag" : "tag-line text-muted"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-muted">
            Nobody in this lane yet. The queue is open.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {shown.map((c) => {
              const place = order.findIndex((row) => row.id === c.id) + 1;
              const delta = movement[c.id] ?? 0;
              const share = Math.max(4, Math.round((c.votes / max) * 100));
              const hot = highlightId === c.id;
              return (
                <li
                  key={c.id}
                  className={`graff px-3 py-3 sm:px-4 ${hot ? "border-primary" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex w-10 shrink-0 flex-col items-center">
                      <span
                        className={`font-display text-2xl leading-none tabular-nums ${
                          place === 1 ? "text-primary" : "text-fg"
                        }`}
                      >
                        {place}
                      </span>
                      <Move delta={delta} />
                    </div>
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-semibold ${
                        place === 1 ? "border-primary text-primary" : "border-border text-muted"
                      }`}
                      aria-hidden
                    >
                      {place === 1 ? <Crown className="h-4 w-4" /> : initials(c.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="truncate font-semibold text-fg">{c.name}</p>
                        <p className="hidden truncate text-sm text-muted sm:block">{c.handle}</p>
                      </div>
                      <p className="truncate text-sm text-muted">
                        Q{c.queue} · {c.lane} · {c.city}
                        {c.sponsors.length > 0 ? ` · sponsored by ${c.sponsors[c.sponsors.length - 1]}` : ""}
                        {c.votes >= WHEEL_VOTES ? " · on the wheel" : ""}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg">
                        <div
                          className={`h-full rounded-full ${place === 1 ? "bg-primary" : "bg-accent"}`}
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="block font-display text-3xl leading-none text-primary tabular-nums">
                        {formatVotes(c.votes)}
                      </span>
                      <span className="text-xs text-muted">votes</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Panel>
  );
}

function Move({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center text-primary" aria-label={`Up ${delta}`}>
        <ArrowUp className="h-3 w-3" />
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center text-muted" aria-label={`Down ${Math.abs(delta)}`}>
        <ArrowDown className="h-3 w-3" />
      </span>
    );
  }
  return <span className="h-3" />;
}
