# Norm data provenance

Replaces the earlier placeholder file. Every row in `norms.json` now traces to
published normative data. **Two of the five benchmark tests have no norm rows at
all** — that is deliberate, not an omission (see below).

## What is scored against norms

| Test | Source | Ages | Unit |
|---|---|---|---|
| `sit_to_stand` | Rikli & Jones, Senior Fitness Test (30-second chair stand) | 60–94 | reps |
| `sit_and_reach` | Rikli & Jones / Jones & Rikli, chair sit-and-reach | 60–94 | inches |

### Band structure

The freely published SFT tables give a **three-band** split — below / within /
above the "normal range", where the normal range is the 25th–75th percentile.
They do not publish finer percentile cutoffs. `percentileBands` therefore uses
three bands (0–24, 25–75, 76–100), and scoring reports the band midpoint.

The 2nd edition of the Senior Fitness Test Manual (Rikli & Jones, 2013) models
full P5–P95 curves. If you obtain it, the band structure here can be refined
without touching any code — `src/lib/scoring.ts` is a pure lookup over whatever
rows are seeded.

### Sources consulted

- https://www.topendsports.com/testing/tests/chair-stand.htm (chair stand, both sexes)
- https://www.topendsports.com/testing/tests/sit-and-reach-chair.htm (chair sit-and-reach, both sexes)
- https://fitnessnorms.com/references/rikli-jones-sft/ (sample description, n≈7,183, ages 60–94, 267 sites / 21 US states)

Note: secondary sources differ slightly in rounding (one gives women 60–64
sit-and-reach as −0.6 to +4.8 in, another −0.5 to +5.0 in). The values here use
the half-inch table. **Verify against the primary manual before release.**

## What is NOT scored, and why

| Test | Why no norms |
|---|---|
| `timed_carry` | The protocol (loaded bag, ~20 steps) was invented for this app. No population data exists for it — it is not a validated field test. |
| `push_up` | ACSM push-up norms assume a fixed, standardized protocol. Allowing "wall or counter, whichever feels manageable" makes results non-comparable to any table: a wall push-up and a floor push-up are different exercises. |
| `single_leg_balance` | Real norms do exist — Springer et al. (2007), *J Geriatr Phys Ther* 30(1):8–15 — but the table is paywalled and was not obtainable. Values were **not** guessed. Add a norm row here if you get the paper; nothing else needs to change. The study reports performance is age-dependent but **not** sex-dependent, so one set of bands can serve both sexes. |

These three are recorded as raw values and tracked against the user's own
baseline at the 8-week re-benchmark, rather than against a population.

## Age coverage

The Senior Fitness Test has **no data below age 60**, but the app's target
persona starts at 55. Under-60 users get raw results with no population
comparison — `findNorm` simply finds no row and scoring returns `null`. Do not
fill this gap by stretching the 60–64 bracket downward; norms decline with age,
so it would flatter a 56-year-old and hide real weaknesses.

## Licensing

The SFT manual and its materials are copyrighted. The normative values
themselves are facts rather than creative expression, but if this ships
commercially, confirm terms for distributing the tables and for using the
Senior Fitness Test name.
