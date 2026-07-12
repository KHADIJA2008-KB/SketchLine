# Sketchline

A practice-first design & sketching app. Every lesson ends on a live whiteboard — read the technique, then place the shapes, colors, or linework yourself, and get feedback in seconds.

**Live app:** _add your Netlify URL here_

---

## What it does

Sketchline is built around one idea: design and drawing skill comes from deliberate practice, not just watching tutorials. It has four core tools:

### 🎨 Whiteboard (Lesson + Sketch pages)
A real drawing canvas with:
- **Four instruments** — Pen, Pencil (textured), Highlighter (translucent, blends with layers underneath), Brush (pressure-sensitive, thickens/thins with stroke speed)
- **Canva-style color palette** — 9 presets plus a custom color picker that adds any color you pick to your palette
- **Shape tools** — Rectangle, Line
- **Fullscreen mode** for distraction-free sketching
- Two boards: the **Lesson** board runs structured, constraint-based exercises (e.g. "fix the hierarchy using spacing alone — no color or size changes"); the **Sketch** board is open, unconstrained practice space

### 👁 Eye Training
Diagnostic drills that train perception before production — "which of these two has better hierarchy/contrast/spacing/alignment?" — across 7 design niches (Layout, Typography, Color, Composition, Iconography, UI/UX, Motion), with subtle, expert-level distinctions rather than obvious ones.

### 📚 Learn (lesson library)
A searchable library of sketching subjects (still life, figurative & mannequin drawing, fashion croquis, portraiture) and shading techniques (cross-hatching, stippling, blending) — each paired with a real, specific YouTube tutorial from a well-known channel (Proko, Alphonso Dunn, Marco Bucci, Zoe Hong, Love Life Drawing) that you can open with one click, then jump straight to the Sketch board to practice.

### 📈 Progress
Tracks are (Layout & Grid, Color Theory, Typography, Hierarchy, Iconography, Motion Basics), badges, day streak, and total exercises completed — all backed by a real database once connected, updating live as you practice.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no build step, no framework |
| Hosting | Netlify (static file host) |
| Backend | [Supabase](https://supabase.com) — Postgres database + Auth |
| Auth | Supabase Auth (email + password) |
| Data storage | Stroke arrays stored as JSON (`jsonb`) — not pixel images, so sketches replay perfectly at any resolution |

No server code to deploy — Supabase is the backend, and it's already hosted the moment you create a project.

---

## Project structure

```
sketchline/
├── index.html            # the entire app — UI, whiteboard engine, all views, Supabase calls
├── schema.sql             # run once in Supabase's SQL Editor to create all tables + RLS policies
├── supabase-client.js      # reference module of reusable Supabase helper functions (not currently imported by index.html — see note below)
└── README.md               # this file
```

> **Note:** `index.html` currently calls Supabase directly from its own inline `<script>` rather than importing `supabase-client.js`. The helper file is kept as a clean reference / starting point if you ever split the code into multiple files.

---

## Database schema

Five tables, all with Row Level Security so a user can only ever read/write their own rows:

- **`profiles`** — auto-created on signup (display name, linked to `auth.users`)
- **`track_progress`** — `(user_id, track_id) → pct` — one row per skill track per user
- **`sketches`** — `strokes` (jsonb), `brief_id`, `week_number`, `title` — used for both free Sketch-board saves and the "same brief, evolving skill" comparisons
- **`eye_training_attempts`** — one row per question answered (`category`, `principle`, `correct`)
- **`badges`** — `(user_id, badge_id)` — earned achievements

Full DDL is in `schema.sql`.

---

## Local setup (from scratch)

### 1. Backend (Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste in `schema.sql`, run it.
3. Grab your **Project URL** and **anon public key** from **Project Settings → API**.
4. For public/production use: **Authentication → Settings → turn ON "Confirm email"**, and set **Authentication → URL Configuration → Site URL** to your deployed URL once you have one.

### 2. Frontend
1. Open `index.html` directly in a browser — no build step needed.
2. Go to the **Sketch** tab → paste your Supabase Project URL + anon key into the **"Connect backend"** bar → **Connect backend**.
3. Sign up with any email/password to test.

### 3. Deploy
- Drag `index.html` onto [app.netlify.com/drop](https://app.netlify.com/drop) for instant static hosting (rename it to `index.html` first if it isn't already).
- Or connect this GitHub repo to Netlify directly for auto-deploys on every push.

---

## How progress currently updates

Track completion (`track_progress`) isn't just displayed — it actively increments from real activity, while signed in:

| Action | Effect |
|---|---|
| Click "Get feedback" on the Lesson whiteboard exercise | Layout & Grid +8% |
| Answer an Eye Training question correctly | matching track +3% (Layout, Typography, Color, Composition→Hierarchy, Iconography, Motion) |
| Layout & Grid reaches 100% | "Grid Master" badge auto-awarded |
| Color Theory reaches 100% | "Color Eye" badge auto-awarded |
| Save your first sketch | "First Sketch" badge auto-awarded |
| 7 consecutive days with a saved sketch | "7-Day Streak" badge auto-awarded |

The Eye Training **`ui`** category doesn't yet map to a track — that's a known gap, see below.

---

## Known limitations / roadmap

- **`ui` Eye Training category has no matching skill track** — needs either a new track added or a remap to an existing one.
- **Client-side progress writes** — track progress and badge awards currently happen via direct client calls protected only by RLS. Fine for a practice app with no monetary stakes, but if you ever gate paid content or certificates behind track completion, move that logic into a Postgres function or Supabase Edge Function so it can't be manipulated from the browser.
- **No password reset flow wired in the UI yet** — Supabase supports it, just not hooked up to a "Forgot password?" link.
- **No custom domain configured yet** — quick to add in Netlify's site settings whenever you want one.
- **`supabase-client.js` isn't imported** — see note in Project Structure above.

---

## License / credits

Recommended tutorials link to their original creators' YouTube channels — Proko, Alphonso Dunn, Marco Bucci, Zoe Hong, and Love Life Drawing. This app doesn't host or rehost any of their video content, only links out to it.
