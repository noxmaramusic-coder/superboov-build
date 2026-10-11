import { create } from "zustand";

export type Lane = "Sing" | "Rap" | "Feels" | "Dance";
export type Boost = 25 | 100 | 250;
export type PingSource = "tiktok" | "sponsor" | "entry";

export type Contestant = {
  id: string;
  name: string;
  handle: string;
  city: string;
  lane: Lane;
  votes: number;
  sponsors: string[];
  queue: number;
};

export type Ping = {
  id: string;
  voter: string;
  contestantId: string;
  amount: number;
  source: PingSource;
};

export const LANES: Lane[] = ["Sing", "Rap", "Feels", "Dance"];

export const BOOSTS: { amount: Boost; label: string; note: string }[] = [
  { amount: 25, label: "Shout-out", note: "A name-drop from the chair" },
  { amount: 100, label: "Stage light", note: "A real push up the board" },
  { amount: 250, label: "Crown", note: "Sponsor the night" },
];

export const WHEEL_VOTES = 10;
export const TIKTOK_SEARCH = "https://www.tiktok.com/search?q=SuperBoov";
export const ON_AIR_SITE = "https://superboov.whozfire.com";

const STORAGE_KEY = "kof-feels-board-v1";

const SEED: Contestant[] = [
  {
    id: "pp",
    name: "PP_7mw",
    handle: "@pp_7mw",
    city: "On the live",
    lane: "Rap",
    votes: 952,
    sponsors: ["Night shift"],
    queue: 1,
  },
  {
    id: "jacob",
    name: "Jacob Hord",
    handle: "@jacobhord",
    city: "On the live",
    lane: "Sing",
    votes: 919,
    sponsors: [],
    queue: 2,
  },
  {
    id: "kandi",
    name: "kandi_kaneee",
    handle: "@kandi_kaneee",
    city: "On the live",
    lane: "Feels",
    votes: 651,
    sponsors: ["Kandi camp"],
    queue: 3,
  },
  {
    id: "squirtz",
    name: "OG Squirtz",
    handle: "@ogsquirtz",
    city: "On the live",
    lane: "Rap",
    votes: 353,
    sponsors: [],
    queue: 4,
  },
  {
    id: "honey",
    name: "HoneyBliss",
    handle: "@honeybliss",
    city: "On the live",
    lane: "Sing",
    votes: 320,
    sponsors: [],
    queue: 5,
  },
  {
    id: "travis",
    name: "travis",
    handle: "@travis",
    city: "On the live",
    lane: "Dance",
    votes: 177,
    sponsors: ["ATL"],
    queue: 6,
  },
  {
    id: "atl",
    name: "ATL Beatz",
    handle: "@atlbeatz",
    city: "Atlanta",
    lane: "Rap",
    votes: 76,
    sponsors: [],
    queue: 7,
  },
  {
    id: "yapi",
    name: "Yapi",
    handle: "@yapi",
    city: "On the live",
    lane: "Feels",
    votes: 54,
    sponsors: [],
    queue: 8,
  },
];

const SEED_PINGS: Ping[] = [
  { id: "p1", voter: "@goldchain", contestantId: "pp", amount: 8, source: "tiktok" },
  { id: "p2", voter: "@feelsgang", contestantId: "jacob", amount: 3, source: "tiktok" },
  { id: "p3", voter: "@violetroom", contestantId: "kandi", amount: 5, source: "tiktok" },
  { id: "p4", voter: "@miccheck", contestantId: "honey", amount: 2, source: "tiktok" },
];

const VOTERS = [
  "@goldchain",
  "@feelsgang",
  "@violetroom",
  "@miccheck",
  "@atlafterdark",
  "@crownseat",
  "@latepass",
  "@studio2am",
  "@goodvibes",
  "@nightowl",
  "@queuekid",
  "@twofree",
];

type Persisted = {
  contestants: Contestant[];
  pings: Ping[];
  liveUrl: string;
  simulating: boolean;
};

export type EnterInput = {
  name: string;
  handle: string;
  city: string;
  lane: Lane;
  sponsor: string;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

type BoardState = Persisted & {
  highlightId: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setLiveUrl: (url: string) => void;
  setSimulating: (on: boolean) => void;
  enter: (input: EnterInput) => Result<string>;
  boost: (id: string, sponsor: string, amount: Boost) => Result<string>;
  tick: () => void;
  reset: () => void;
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function readPersisted(): Persisted | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Persisted;
    if (!Array.isArray(data.contestants) || !Array.isArray(data.pings)) return null;
    return data;
  } catch {
    return null;
  }
}

function writePersisted(data: Persisted) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        contestants: data.contestants,
        pings: data.pings,
        liveUrl: data.liveUrl,
        simulating: data.simulating,
      }),
    );
  } catch {
    /* private mode / quota — the desk still works for this visit */
  }
}

export function cleanHandle(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, "");
  if (!trimmed) return "";
  const withAt = trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
  return withAt.slice(0, 24);
}

function handleKey(handle: string) {
  return handle.replace(/^@/, "").toLowerCase();
}

export function ranked(list: Contestant[]) {
  return [...list].sort((a, b) => b.votes - a.votes || a.queue - b.queue);
}

export function watchUrl(liveUrl: string) {
  const trimmed = liveUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return TIKTOK_SEARCH;
}

export function formatVotes(n: number) {
  return n.toLocaleString("en-US");
}

export function initials(name: string) {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, "");
  return (cleaned.slice(0, 2) || "SB").toUpperCase();
}

export const useBoard = create<BoardState>((set, get) => ({
  contestants: SEED,
  pings: SEED_PINGS,
  liveUrl: "",
  simulating: true,
  highlightId: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const saved = readPersisted();
    if (saved) set({ ...saved, hydrated: true });
    else set({ hydrated: true });
  },

  setLiveUrl: (liveUrl) => {
    set({ liveUrl });
    writePersisted(get());
  },

  setSimulating: (simulating) => {
    set({ simulating });
    writePersisted(get());
  },

  enter: (input) => {
    const name = input.name.trim().slice(0, 32);
    const handle = cleanHandle(input.handle);
    const city = input.city.trim().slice(0, 24) || "On the live";
    const sponsor = input.sponsor.trim().slice(0, 32);
    if (name.length < 2) return { ok: false, error: "Need a stage name." };
    if (handle.length < 3) return { ok: false, error: "Need a TikTok handle." };
    const taken = get().contestants.some((c) => handleKey(c.handle) === handleKey(handle));
    if (taken) return { ok: false, error: "That handle is already on the board." };
    const queue = get().contestants.reduce((max, c) => Math.max(max, c.queue), 0) + 1;
    const id = uid("q");
    const contestant: Contestant = {
      id,
      name,
      handle,
      city,
      lane: input.lane,
      votes: 0,
      sponsors: sponsor ? [sponsor] : [],
      queue,
    };
    const ping: Ping = {
      id: uid("e"),
      voter: sponsor ? sponsor : handle,
      contestantId: id,
      amount: 0,
      source: "entry",
    };
    set({
      contestants: [...get().contestants, contestant],
      pings: [ping, ...get().pings].slice(0, 16),
      highlightId: id,
    });
    writePersisted(get());
    window.setTimeout(() => {
      if (get().highlightId === id) set({ highlightId: null });
    }, 4500);
    return { ok: true, value: id };
  },

  boost: (id, sponsorName, amount) => {
    const sponsor = sponsorName.trim().slice(0, 32);
    if (sponsor.length < 2) return { ok: false, error: "Who's sending the boost?" };
    const target = get().contestants.find((c) => c.id === id);
    if (!target) return { ok: false, error: "Pick someone on the board." };
    const contestants = get().contestants.map((c) =>
      c.id === id
        ? { ...c, votes: c.votes + amount, sponsors: [...c.sponsors, sponsor].slice(-3) }
        : c,
    );
    const ping: Ping = {
      id: uid("s"),
      voter: sponsor,
      contestantId: id,
      amount,
      source: "sponsor",
    };
    set({
      contestants,
      pings: [ping, ...get().pings].slice(0, 16),
      highlightId: id,
    });
    writePersisted(get());
    window.setTimeout(() => {
      if (get().highlightId === id) set({ highlightId: null });
    }, 4500);
    return { ok: true, value: id };
  },

  tick: () => {
    const { contestants, simulating } = get();
    if (!simulating || contestants.length === 0) return;
    const weights = contestants.map((c) => Math.sqrt(c.votes + 12));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    let picked = contestants[0];
    for (let i = 0; i < contestants.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        picked = contestants[i];
        break;
      }
    }
    const chance = Math.random();
    const amount = chance > 0.96 ? 10 : chance > 0.82 ? 5 : chance > 0.58 ? 3 : chance > 0.32 ? 2 : 1;
    const voter = VOTERS[Math.floor(Math.random() * VOTERS.length)] ?? "@live";
    const next = contestants.map((c) => (c.id === picked.id ? { ...c, votes: c.votes + amount } : c));
    const ping: Ping = { id: uid("v"), voter, contestantId: picked.id, amount, source: "tiktok" };
    set({ contestants: next, pings: [ping, ...get().pings].slice(0, 16) });
    writePersisted(get());
  },

  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({
      contestants: SEED,
      pings: SEED_PINGS,
      liveUrl: "",
      simulating: true,
      highlightId: null,
    });
  },
}));
