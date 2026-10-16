# Steady Strength — Resistance Training App (MVP)

A phone-first Expo app that benchmarks a sedentary older adult's current ability,
builds a simple 2x/week progressive resistance program, and walks them through
sessions with form cues and seated/no-equipment substitutions for every exercise.

**Status:** runs end-to-end. Verified by driving the full flow (onboarding →
readiness soft gate → 5-test benchmark → program generation → session logging →
progress → learn) in the browser via `npm run web`. 46 unit tests pass and
`tsc --noEmit` is clean.

Not yet verified on a real iOS/Android device — the flow above was exercised on
Expo's web target, so native-only behavior (AsyncStorage on device, safe-area
insets, real touch targets) still needs a pass on a phone.

## What's implemented

- Onboarding (age, sex, activity level, equipment, readiness screen with soft gate)
- Five-test benchmark, scored against seeded percentile-band norms, with a
  plain-language summary (never a raw percentile, never "below average")
- Program generation: picks one exercise per required movement pattern, biased
  toward your two weakest benchmark areas and toward seated/supported variants
  if you flagged anything on the readiness screen
- A pure, unit-tested progressive-overload function (`src/lib/overload.ts`)
- Today tab: one exercise at a time, large set-logging control, auto-advance
- Rest-day spacing: at least one full rest day between sessions, shown as
  guidance with an "I'd like to train today anyway" override rather than a
  block (`src/lib/schedule.ts`)
- Exercise detail screen with cues, a common mistake, and substitution buttons
  (no-equipment / seated) — every exercise resolves to a seated option
- Progress tab: session count, streak (with neutral, non-guilt messaging for a
  missed week), per-exercise load, and an 8-week re-benchmark prompt
- Learn tab: age-bracketed benefits content with real citations
- 18pt+ text and 44pt+ tap targets enforced via `src/theme/tokens.ts`

## What's stubbed or simplified for this MVP

- **Persistence is local-only** (Zustand + AsyncStorage on-device), not Supabase.
  `supabase/schema.sql`, `src/lib/supabase.ts`, and `scripts/seed.ts` are ready
  for when you want synced, multi-device storage — see "Moving to Supabase" below.
- **Only two of the five tests are scored against norms.** `sit_to_stand` and
  `sit_and_reach` use published Rikli & Jones Senior Fitness Test values
  (ages 60–94). The timed carry, push-up and single-leg balance have no
  applicable published norms and are recorded as raw values tracked against the
  user's own baseline. Nobody under 60 gets a population comparison, because the
  SFT has no data below 60. Full reasoning and sources in
  `src/data/NORMS_SOURCE.md` — read it before changing any of this.
- **Balance is programmed for everyone, by design.** Because the balance test
  has no norms to detect weakness with, and supported balance work is low-risk
  while falls are high-cost, `balance` is a required movement pattern rather
  than a bonus. The hold target is scaled from the user's own measured stance
  time (`balanceHoldTarget` in `src/lib/programGenerator.ts`).
- **Form demos cover 7 of 22 exercises.** Photos come from the National
  Institute on Aging's older-adult exercise materials — real older adults doing
  the actual movements, several already laid out as start/middle/end panels.
  Exercises without a demo show their cues alone rather than a stand-in image.
  Open gym datasets were rejected on content, not licensing; the reasoning and
  the outstanding provenance question are in `assets/demos/CREDITS.md`, which
  should be read before any commercial release.
- **No demo exists for the hinge pattern or the carries.** The hip hinge is the
  most jargon-heavy movement in the app and has no NIA equivalent, so it is the
  biggest remaining gap.
- **No app icon/splash image** — Expo will use its own default icon until you
  add one (needed before a real TestFlight build).

## Setup

You'll need Node.js (LTS) and either the Expo Go app on your phone or a
simulator.

```bash
npm install
```

```bash
npm run start
```

To run it in a browser instead (fastest way to click through the whole flow):

```bash
npm run web
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to run it on
a real phone — recommended, since the one-handed/no-reading-glasses design
constraints are hard to judge on a laptop screen.

## Testing

The progressive-overload rule, the benchmark scoring/percentile logic, and the
program-generation selection logic are pure functions with unit tests:

```bash
npm test
```

```bash
npm run typecheck
```

## Moving to Supabase

The app runs single-profile-per-device out of the box. To move to a synced
backend:

1. Create a Supabase project, then run `supabase/schema.sql` in its SQL editor.
2. Copy `.env.example` to `.env` and fill in your project URL and anon key.
3. Run `npm run seed` to push `src/data/exercises.json` and `src/data/norms.json`
   into the `exercise` and `norm` tables.
4. Replace the repository calls inside `src/store/useAppStore.ts` with calls to
   the `supabase` client from `src/lib/supabase.ts`, and add row-level security
   scoped to an authenticated user (the current schema has none — see the note
   at the bottom of `supabase/schema.sql`).

## Project layout

```
app/                  expo-router screens (onboarding, benchmark, tabs, exercise detail)
src/lib/              pure logic: scoring, overload, program generation, progress
src/store/            Zustand store (local persistence)
src/data/             seed exercise + norm JSON, typed accessors
src/content/          benchmark test protocols, readiness questions, learn content
src/components/       shared UI (BigButton, OptionCard, Stepper, etc.)
supabase/schema.sql   DB schema, ready for when you move off local storage
scripts/seed.ts       pushes seed JSON into Supabase
__tests__/            unit tests for the pure logic
```
