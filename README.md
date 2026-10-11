# King / Queen of the Feels

Entry portal for SuperBoov's live competition. People enter or sponsor a name, watch the scoreboard move, and jump to the TikTok live.

Presented by **SuperBoov**. Music, games, people, good vibes.

## What's on the desk

- **Scoreboard.** Ranked list with lanes (Sing, Rap, Feels, Dance), movement, and a live vote feed.
- **Enter.** Put a stage name on the board.
- **Sponsor.** Boost someone already up, or drop a new name in with a shout-out, stage light, or crown.
- **Feels wheel.** Names with 10 or more votes can land on the spin.
- **Watch the live.** Paste the TikTok live link once. It stays on this device. Blank opens a SuperBoov search.

The brick wall, gold spray boxes, and crowned octopus are the show's street look.

## Votes right now

TikTok is not wired in yet. **Preview votes** ticks the board so you can see it move. Entering a name, sponsoring, and spinning the wheel are real actions in the browser. The board is saved in `localStorage` (`kof-feels-board-v1`). Clear it with **Reset sample night** in the footer.

A later pass can drop real live counts into the same list.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080).

```bash
npm run typecheck
npm run build
```

Stack: TanStack Start, React, Tailwind, Zustand.
