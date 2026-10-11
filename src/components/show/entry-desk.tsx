import { useEffect, useState, type FormEvent } from "react";
import { BOOSTS, LANES, cleanHandle, ranked, useBoard, type Boost, type Lane } from "@/lib/board-store";
import { Field, GoldButton, Panel, fieldClass } from "@/components/show/bits";

export function EntryDesk() {
  return (
    <div id="enter" className="grid gap-4 lg:grid-cols-2">
      <EnterCard />
      <SponsorCard />
    </div>
  );
}

function EnterCard() {
  const enter = useBoard((s) => s.enter);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [lane, setLane] = useState<Lane>("Sing");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = enter({ name, handle, city, lane, sponsor });
    if (!result.ok) {
      setDone("");
      setError(result.error);
      return;
    }
    setError("");
    setDone(`${name.trim()} is in the queue${sponsor.trim() ? `, sponsored by ${sponsor.trim()}` : ""}.`);
    setName("");
    setHandle("");
    setCity("");
    setSponsor("");
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="spray text-2xl text-primary">Enter</p>
          <h2 className="spray text-3xl text-primary sm:text-4xl">Put a name on the show</h2>
          <p className="mt-2 text-sm leading-normal text-muted sm:text-base">
            Yourself, or somebody you’re sponsoring in. They land on the board at zero and start catching votes.
          </p>
        </div>
        <Field label="Stage name">
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={32} required />
        </Field>
        <Field label="TikTok handle">
          <input
            className={fieldClass}
            value={handle}
            placeholder="@name"
            onChange={(e) => setHandle(e.target.value)}
            maxLength={24}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" hint="Optional">
            <input className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} maxLength={24} />
          </Field>
          <Field label="Sponsored by" hint="Leave blank if it’s you">
            <input className={fieldClass} value={sponsor} onChange={(e) => setSponsor(e.target.value)} maxLength={32} />
          </Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-muted">Lane</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LANES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLane(item)}
                className={`h-11 text-sm ${lane === item ? "tag" : "tag-line text-muted"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>
        {error ? (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        ) : null}
        {done ? (
          <p role="status" className="text-sm text-fg">
            {done}{" "}
            <a href="#board" className="text-primary underline-offset-2 hover:underline">
              See the board
            </a>
          </p>
        ) : null}
        <GoldButton type="submit">Enter the queue</GoldButton>
      </form>
    </Panel>
  );
}

function SponsorCard() {
  const contestants = useBoard((s) => s.contestants);
  const boost = useBoard((s) => s.boost);
  const order = ranked(contestants);
  const [id, setId] = useState(order[0]?.id ?? "");
  const [sponsor, setSponsor] = useState("");
  const [amount, setAmount] = useState<Boost>(100);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    if (!order.some((c) => c.id === id)) setId(order[0]?.id ?? "");
  }, [order, id]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = boost(id, sponsor, amount);
    if (!result.ok) {
      setDone("");
      setError(result.error);
      return;
    }
    const who = order.find((c) => c.id === id);
    setError("");
    setDone(`${sponsor.trim()} sent a +${amount} boost${who ? ` to ${who.name}` : ""}.`);
    setSponsor("");
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="spray text-2xl text-primary">Sponsor</p>
          <h2 className="spray text-3xl text-primary sm:text-4xl">Boost somebody in</h2>
          <p className="mt-2 text-sm leading-normal text-muted sm:text-base">
            Sponsors don’t replace TikTok votes. They stack on top, with the sponsor’s name on the row.
          </p>
        </div>
        <Field label="Who">
          <select className={fieldClass} value={id} onChange={(e) => setId(e.target.value)}>
            {order.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} · {cleanHandle(c.handle)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Your name">
          <input className={fieldClass} value={sponsor} onChange={(e) => setSponsor(e.target.value)} maxLength={32} required />
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-muted">Boost</legend>
          <div className="grid gap-2">
            {BOOSTS.map((tier) => (
              <button
                key={tier.amount}
                type="button"
                onClick={() => setAmount(tier.amount)}
                className={`flex h-14 items-center justify-between px-4 text-left ${
                  amount === tier.amount ? "tag-line" : "graff"
                }`}
              >
                <span>
                  <span className="block font-semibold text-fg">{tier.label}</span>
                  <span className="block text-sm text-muted">{tier.note}</span>
                </span>
                <span className="font-display text-2xl text-primary tabular-nums">+{tier.amount}</span>
              </button>
            ))}
          </div>
        </fieldset>
        {error ? (
          <p role="alert" className="text-sm text-primary">
            {error}
          </p>
        ) : null}
        {done ? (
          <p role="status" className="text-sm text-fg">
            {done}
          </p>
        ) : null}
        <GoldButton type="submit">Send the boost</GoldButton>
      </form>
    </Panel>
  );
}
