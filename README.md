# Sketchline backend — Supabase setup

## 1. Create the project
1. Go to [supabase.com](https://supabase.com) → New project.
2. Wait ~2 min for it to provision.

## 2. Run the schema
1. In your project, open **SQL Editor** → **New query**.
2. Paste the contents of `schema.sql` and click **Run**.
   This creates: `profiles`, `track_progress`, `sketches`, `eye_training_attempts`, `badges` — all with Row Level Security so users can only ever read/write their own rows.

## 3. Get your API keys
Go to **Settings → API**. You need two values:
- **Project URL** (e.g. `https://abcxyz.supabase.co`)
- **anon public key** (safe to use in browser code — RLS protects the data, not the key)

## 4. Enable email auth
**Authentication → Providers → Email** is on by default. For quick local testing you can turn off "Confirm email" under **Authentication → Settings** so signup logs you straight in without checking an inbox.

## 5. Wire it into the app
Drop these two lines before your closing `</body>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-client.js"></script>
```
Then paste your Project URL and anon key into the top of `supabase-client.js`:
```js
const SUPABASE_URL = 'https://abcxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
```

## 6. What's already wired vs. what's stubbed
The prototype's **Sketch page** now has real Sign in / Sign up + Save/Load using these functions.

`supabase-client.js` also ships ready-to-call functions for **Progress** (`getTrackProgress`, `updateTrackProgress`), **Eye Training** (`logEyeAttempt`, `getEyeTrainingStats`), and **Badges** (`awardBadge`, `getBadges`) — the Progress and Eye Training pages still show the original demo/hardcoded data. To make those live too: call `getTrackProgress()` / `getEyeTrainingStats()` when those views load, and call `logEyeAttempt(...)` inside the existing eye-training click handler instead of only updating the in-memory `eyeScore` variable. Happy to wire those up next if you want the whole app running on real data.

## Local dev note
`sketches.strokes` stores the same stroke array your canvas already builds in memory — no image upload needed. To redraw a saved sketch, feed the stored array straight back into the canvas's existing `strokes` variable and call `redraw()`.
