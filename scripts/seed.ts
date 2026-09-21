// One-time seed script: pushes src/data/exercises.json and src/data/norms.json
// into a Supabase project's `exercise` and `norm` tables (see supabase/schema.sql).
// Run with `npm run seed` after setting EXPO_PUBLIC_SUPABASE_URL and
// EXPO_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for a script
// that bypasses RLS) in your environment.

import { createClient } from "@supabase/supabase-js";
import exercises from "../src/data/exercises.json";
import norms from "../src/data/norms.json";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "Missing EXPO_PUBLIC_SUPABASE_URL and/or a key (SUPABASE_SERVICE_ROLE_KEY preferred, falls back to EXPO_PUBLIC_SUPABASE_ANON_KEY)."
  );
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const exerciseRows = exercises.map((ex: any) => ({
    id: ex.id,
    name: ex.name,
    pattern: ex.pattern,
    equipment_required: ex.equipmentRequired,
    is_seated: ex.isSeated,
    is_supported: ex.isSupported,
    video_url: ex.videoUrl,
    cues: ex.cues,
    common_mistake: ex.commonMistake,
    substitute_ids: ex.substituteIds,
    contraindicated_flags: ex.contraindicatedFlags,
    jargon_gloss: ex.jargonGloss ?? {},
  }));

  const normRows = norms.map((n: any) => ({
    id: n.id,
    test_key: n.testKey,
    sex: n.sex,
    age_min: n.ageMin,
    age_max: n.ageMax,
    unit: n.unit,
    higher_is_better: n.higherIsBetter,
    percentile_bands: n.percentileBands,
  }));

  const { error: exerciseError } = await supabase.from("exercise").upsert(exerciseRows);
  if (exerciseError) throw exerciseError;
  console.log(`Seeded ${exerciseRows.length} exercises.`);

  const { error: normError } = await supabase.from("norm").upsert(normRows);
  if (normError) throw normError;
  console.log(`Seeded ${normRows.length} norm rows.`);
  console.log(
    "Reminder: norms.json is placeholder data — see src/data/NORMS_SOURCE.md before using this with real users."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
