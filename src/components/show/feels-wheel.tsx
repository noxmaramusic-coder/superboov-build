import { useState } from "react";
import { RotateCw } from "lucide-react";
import { WHEEL_VOTES, ranked, useBoard, type Contestant } from "@/lib/board-store";
import { GoldButton, Panel } from "@/components/show/bits";

export function FeelsWheel() {
  const contestants = useBoard((s) => s.contestants);
  const qualified = ranked(contestants).filter((c) => c.votes >= WHEEL_VOTES);
  const [locked, setLocked] = useState<Contestant[] | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const reel = locked ?? qualified;

  const gradient =
    reel.length === 0
      ? "var(--color-surface-2)"
      : `conic-gradient(${reel
          .map((_, index) => {
            const color = index % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)";
            const start = (index / reel.length) * 100;
            const end = ((index + 1) / reel.length) * 100;
            return `${color} ${start}% ${end}%`;
          })
          .join(", ")})`;

  function spin() {
    if (spinning || qualified.length === 0) return;
    const snapshot = qualified;
    const index = Math.floor(Math.random() * snapshot.length);
    const segment = 360 / snapshot.length;
    const center = index * segment + segment / 2;
    const desired = (360 - center) % 360;
    const allowMotion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLocked(snapshot);
    setWinner(null);
    setAnimate(allowMotion);
    if (!allowMotion) {
      setRotation(desired);
      setWinner(snapshot[index]?.name ?? null);
      return;
    }
    setSpinning(true);
    setRotation((prev) => {
      const current = ((prev % 360) + 360) % 360;
      const delta = (desired - current + 360) % 360;
      return prev + 360 * 6 + delta;
    });
    window.setTimeout(() => {
      setWinner(snapshot[index]?.name ?? null);
      setSpinning(false);
    }, 4200);
  }

  return (
    <Panel id="wheel">
      <div className="grid items-center gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[16rem_1fr]">
        <div className="relative mx-auto h-64 w-64">
          <div className="absolute -top-1 left-1/2 z-10 h-4 w-4 -translate-x-1/2 rotate-45 bg-primary" aria-hidden />
          <div
            className="h-full w-full rounded-full border-4 border-primary/80"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: animate ? "transform 4s cubic-bezier(0.12, 0.7, 0.08, 1)" : "none",
            }}
          />
          <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-4 border-bg bg-bg">
            <img src="/art/mascot.jpg" alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <p className="spray text-2xl text-primary">Freaky Friday energy</p>
          <h2 className="spray text-4xl text-primary sm:text-5xl">10 votes gets you on the wheel</h2>
          <p className="mt-3 max-w-xl text-sm leading-normal text-muted sm:text-base">
            Same rule as the cash wheel on the live. TikTok votes and sponsor boosts both count. This spin is a desk preview — the real wheel still belongs on stream.
          </p>

          {qualified.length === 0 ? (
            <p className="mt-4 text-muted">Nobody has {WHEEL_VOTES} votes yet.</p>
          ) : (
            <ul className="mt-4 flex max-h-40 flex-wrap gap-2 overflow-auto">
              {qualified.map((c) => (
                <li key={c.id} className="tag-line px-3 py-2 text-sm text-fg">
                  {c.name}
                  <span className="text-muted"> · {c.votes}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <GoldButton type="button" onClick={spin} disabled={spinning || qualified.length === 0}>
              <RotateCw className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
              {spinning ? "Spinning" : "Spin the feels wheel"}
            </GoldButton>
            {winner ? (
              <p role="status" className="font-display text-2xl tracking-wide text-primary">
                Lands on {winner}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}
