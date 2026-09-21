import type { TestKey } from "@/types/models";

export type BenchmarkInputType = "counter" | "timer_seconds";

export interface BenchmarkTestDef {
  key: TestKey;
  order: number;
  name: string;
  measures: string;
  protocol: string[];
  seatedFallback: string;
  inputType: BenchmarkInputType;
  inputLabel: string;
  inputMin: number;
  inputMax: number;
  inputStep: number;
  inputUnit?: string;
}

export const BENCHMARK_TESTS: BenchmarkTestDef[] = [
  {
    key: "sit_to_stand",
    order: 1,
    name: "30-Second Sit-to-Stand",
    measures: "Lower-body strength",
    protocol: [
      "Sit tall in a sturdy, armless chair with your feet flat on the floor.",
      "Cross your arms over your chest.",
      "When you start the timer, stand all the way up, then sit back down, as many times as you can in 30 seconds.",
    ],
    seatedFallback: "If standing isn't safe today, count partial rises or ask someone to spot you.",
    inputType: "counter",
    inputLabel: "How many full stands did you complete?",
    inputMin: 0,
    inputMax: 40,
    inputStep: 1,
    inputUnit: "reps",
  },
  {
    key: "timed_carry",
    order: 2,
    name: "Timed Carry",
    measures: "Grip and core strength",
    protocol: [
      "Pick a bag with some weight in it (books or canned food work well) and a clear, flat path.",
      "Hold the bag at your side, stand tall, and time how long it takes to walk about 20 steps.",
      "If seated, hold the bag on your lap and time 20 seconds of steady seated marching instead.",
    ],
    seatedFallback: "Seated variant: hold the bag on your lap while marching in place, seated.",
    inputType: "timer_seconds",
    inputLabel: "How many seconds did it take?",
    inputMin: 0,
    inputMax: 120,
    inputStep: 1,
    inputUnit: "sec",
  },
  {
    key: "single_leg_balance",
    order: 3,
    name: "Single-Leg Balance",
    measures: "Fall risk",
    protocol: [
      "Stand near a wall or sturdy counter for safety, but try not to hold on unless you need to.",
      "Lift one foot slightly off the ground and time how long you can hold it, up to 30 seconds.",
      "Stop the timer as soon as your foot touches down or you need to grab support.",
    ],
    seatedFallback: "If standing balance isn't safe today, skip this test and mark it for a later re-check with support nearby.",
    inputType: "timer_seconds",
    inputLabel: "How many seconds did you hold it?",
    inputMin: 0,
    inputMax: 30,
    inputStep: 1,
    inputUnit: "sec",
  },
  {
    key: "push_up",
    order: 4,
    name: "Push-Up",
    measures: "Upper-body push strength",
    protocol: [
      "Place your hands on a wall, sturdy counter, or the floor — whichever feels manageable.",
      "Keep your body in a straight line and bend your elbows to lower yourself, then push back up.",
      "Count as many good-form reps as you can.",
    ],
    seatedFallback: "Wall push-ups count fully — there's no less-than version here, just a different angle.",
    inputType: "counter",
    inputLabel: "How many reps did you complete?",
    inputMin: 0,
    inputMax: 60,
    inputStep: 1,
    inputUnit: "reps",
  },
  {
    key: "sit_and_reach",
    order: 5,
    name: "Sit-and-Reach",
    measures: "Posterior chain flexibility",
    protocol: [
      "Sit on the floor or the edge of a chair with one leg extended straight in front of you.",
      "Reach both hands slowly toward your toes, keeping your knee as straight as is comfortable.",
      "Have someone measure the distance between your fingertips and your toes (negative if you don't reach them, positive if you reach past).",
    ],
    seatedFallback: "The seated-in-a-chair version is the standard version here — no floor sitting required.",
    inputType: "counter",
    // Inches at half-inch resolution, matching the published chair sit-and-reach
    // table this is scored against (see data/NORMS_SOURCE.md).
    inputLabel: "Distance from fingertips to toes, in inches (negative if short of your toes)",
    inputMin: -12,
    inputMax: 12,
    inputStep: 0.5,
    inputUnit: "in",
  },
];

export function nextTest(currentKey: TestKey): BenchmarkTestDef | null {
  const idx = BENCHMARK_TESTS.findIndex((t) => t.key === currentKey);
  return BENCHMARK_TESTS[idx + 1] ?? null;
}
