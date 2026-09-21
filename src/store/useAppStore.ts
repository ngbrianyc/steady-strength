import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { generateId } from "@/lib/id";
import { nextPrescription } from "@/lib/overload";
import { buildProgramExercises } from "@/lib/programGenerator";
import { scoreBenchmark, summarizeBenchmark } from "@/lib/scoring";
import type {
  ActivityLevel,
  BenchmarkResult,
  Equipment,
  Profile,
  Program,
  ProgramExercise,
  ReadinessFlag,
  SessionLog,
  SetLogEntry,
  Sex,
  TestKey,
} from "@/types/models";

interface OnboardingDraft {
  age: number | null;
  sex: Sex | null;
  activityLevel: ActivityLevel | null;
  equipment: Equipment[];
  readinessFlags: ReadinessFlag[];
}

interface AppState {
  onboardingDraft: OnboardingDraft;
  profile: Profile | null;
  benchmarkResults: BenchmarkResult[];
  activeProgram: Program | null;
  programExercises: ProgramExercise[];
  sessionLogs: SessionLog[];
  currentSessionDraft: Record<string, SetLogEntry[]>; // programExerciseId -> sets logged so far, not yet committed
  sessionsCompletedForActiveProgram: number;
  lastSessionCompletedAt: string | null;

  // onboarding
  setOnboardingField: <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => void;
  toggleOnboardingEquipment: (item: Equipment) => void;
  toggleOnboardingReadinessFlag: (flag: ReadinessFlag) => void;
  completeOnboarding: () => Profile;

  // benchmark
  recordBenchmarkResult: (testKey: TestKey, rawValue: number) => BenchmarkResult | null;
  latestBenchmarkResults: () => BenchmarkResult[];
  generateProgramFromLatestBenchmark: () => Program;

  // today / session logging
  todaysDayIndex: () => 0 | 1;
  hasCompletedSessionToday: () => boolean;
  todaysProgramExercises: () => ProgramExercise[];
  logSet: (programExerciseId: string, entry: SetLogEntry) => void;
  draftSetsFor: (programExerciseId: string) => SetLogEntry[];
  completeExerciseForToday: (programExerciseId: string) => void;
  completeSession: () => void;
  lastTwoSessionsFor: (programExerciseId: string) => [SetLogEntry[], SetLogEntry[]];

  resetAll: () => void;
}

const emptyDraft: OnboardingDraft = {
  age: null,
  sex: null,
  activityLevel: null,
  equipment: [],
  readinessFlags: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      onboardingDraft: emptyDraft,
      profile: null,
      benchmarkResults: [],
      activeProgram: null,
      programExercises: [],
      sessionLogs: [],
      currentSessionDraft: {},
      sessionsCompletedForActiveProgram: 0,
      lastSessionCompletedAt: null,

      setOnboardingField: (key, value) =>
        set((state) => ({ onboardingDraft: { ...state.onboardingDraft, [key]: value } })),

      toggleOnboardingEquipment: (item) =>
        set((state) => {
          const current = state.onboardingDraft.equipment;
          const next = current.includes(item)
            ? current.filter((e) => e !== item)
            : [...current, item];
          return { onboardingDraft: { ...state.onboardingDraft, equipment: next } };
        }),

      toggleOnboardingReadinessFlag: (flag) =>
        set((state) => {
          const current = state.onboardingDraft.readinessFlags;
          const next = current.includes(flag)
            ? current.filter((f) => f !== flag)
            : [...current, flag];
          return { onboardingDraft: { ...state.onboardingDraft, readinessFlags: next } };
        }),

      completeOnboarding: () => {
        const draft = get().onboardingDraft;
        if (draft.age === null || draft.sex === null || draft.activityLevel === null) {
          throw new Error("Onboarding is incomplete");
        }
        const profile: Profile = {
          id: generateId(),
          age: draft.age,
          sex: draft.sex,
          activityLevel: draft.activityLevel,
          equipment: draft.equipment.length > 0 ? draft.equipment : ["none"],
          readinessFlags: draft.readinessFlags,
          createdAt: new Date().toISOString(),
        };
        set({ profile });
        return profile;
      },

      recordBenchmarkResult: (testKey, rawValue) => {
        const profile = get().profile;
        if (!profile) return null;
        // A missing norm is normal, not a failure: three of the five tests have
        // no validated population data, and nobody under 60 is covered by the
        // Senior Fitness Test. Record the raw value either way.
        const scored = scoreBenchmark(testKey, profile.sex, profile.age, rawValue);
        const result: BenchmarkResult = {
          id: generateId(),
          profileId: profile.id,
          testKey,
          rawValue,
          percentile: scored ? scored.percentile : null,
          takenAt: new Date().toISOString(),
        };
        // Full history is kept (not just the latest per test) so re-benchmark
        // prompts can tell whether a retest has happened since the 8-week mark.
        set((state) => ({ benchmarkResults: [...state.benchmarkResults, result] }));
        return result;
      },

      latestBenchmarkResults: () => {
        const all = get().benchmarkResults;
        const byTest = new Map<TestKey, BenchmarkResult>();
        for (const r of [...all].sort((a, b) => a.takenAt.localeCompare(b.takenAt))) {
          byTest.set(r.testKey, r);
        }
        return Array.from(byTest.values());
      },

      generateProgramFromLatestBenchmark: () => {
        const profile = get().profile;
        if (!profile) throw new Error("No profile yet");
        const results = get().latestBenchmarkResults();
        const { weakestTestKeys } = summarizeBenchmark(results);
        // Raw values matter even for tests with no norm — they set starting
        // targets (notably the balance hold) from measured ability.
        const rawResults: Partial<Record<TestKey, number>> = {};
        for (const r of results) rawResults[r.testKey] = r.rawValue;

        const program: Program = {
          id: generateId(),
          profileId: profile.id,
          generatedAt: new Date().toISOString(),
          active: true,
        };
        const rows = buildProgramExercises(program.id, profile, weakestTestKeys, rawResults);
        const programExercises: ProgramExercise[] = rows.map((r) => ({ ...r, id: generateId() }));

        set({
          activeProgram: program,
          programExercises,
          sessionsCompletedForActiveProgram: 0,
          lastSessionCompletedAt: null,
          currentSessionDraft: {},
        });
        return program;
      },

      todaysDayIndex: () => {
        return (get().sessionsCompletedForActiveProgram % 2) as 0 | 1;
      },

      hasCompletedSessionToday: () => {
        const last = get().lastSessionCompletedAt;
        if (!last) return false;
        const lastDate = new Date(last);
        const now = new Date();
        return (
          lastDate.getFullYear() === now.getFullYear() &&
          lastDate.getMonth() === now.getMonth() &&
          lastDate.getDate() === now.getDate()
        );
      },

      todaysProgramExercises: () => {
        const dayIndex = get().todaysDayIndex();
        return get()
          .programExercises.filter((pe) => pe.dayIndex === dayIndex);
      },

      draftSetsFor: (programExerciseId) => get().currentSessionDraft[programExerciseId] ?? [],

      logSet: (programExerciseId, entry) =>
        set((state) => {
          const existing = state.currentSessionDraft[programExerciseId] ?? [];
          return {
            currentSessionDraft: {
              ...state.currentSessionDraft,
              [programExerciseId]: [...existing, entry],
            },
          };
        }),

      lastTwoSessionsFor: (programExerciseId) => {
        const logs = get()
          .sessionLogs.filter((l) => l.programExerciseId === programExerciseId)
          .sort((a, b) => b.performedAt.localeCompare(a.performedAt));
        return [logs[0]?.sets ?? [], logs[1]?.sets ?? []];
      },

      completeExerciseForToday: (programExerciseId) => {
        const state = get();
        const sets = state.currentSessionDraft[programExerciseId] ?? [];
        if (sets.length === 0) return;

        const log: SessionLog = {
          id: generateId(),
          profileId: state.profile!.id,
          programExerciseId,
          performedAt: new Date().toISOString(),
          sets,
        };

        const programExercise = state.programExercises.find((pe) => pe.id === programExerciseId);
        let updatedProgramExercises = state.programExercises;
        if (programExercise) {
          // sessionLogs doesn't include today's `sets` yet (that happens in the
          // set() below), so index 0 here is the most recently *completed* prior
          // session — the one immediately before today's, i.e. "consecutive".
          const [mostRecentPriorSets] = state.lastTwoSessionsFor(programExerciseId);
          const updated = nextPrescription(
            {
              targetSets: programExercise.targetSets,
              targetRepMin: programExercise.targetRepMin,
              targetRepMax: programExercise.targetRepMax,
              targetLoad: programExercise.targetLoad,
              loadIncrement: programExercise.loadIncrement,
            },
            sets,
            mostRecentPriorSets
          );
          updatedProgramExercises = state.programExercises.map((pe) =>
            pe.id === programExerciseId ? { ...pe, ...updated } : pe
          );
        }

        set({
          sessionLogs: [...state.sessionLogs, log],
          programExercises: updatedProgramExercises,
          currentSessionDraft: Object.fromEntries(
            Object.entries(state.currentSessionDraft).filter(([id]) => id !== programExerciseId)
          ),
        });
      },

      completeSession: () => {
        set((state) => ({
          sessionsCompletedForActiveProgram: state.sessionsCompletedForActiveProgram + 1,
          lastSessionCompletedAt: new Date().toISOString(),
          currentSessionDraft: {},
        }));
      },

      resetAll: () =>
        set({
          onboardingDraft: emptyDraft,
          profile: null,
          benchmarkResults: [],
          activeProgram: null,
          programExercises: [],
          sessionLogs: [],
          currentSessionDraft: {},
          sessionsCompletedForActiveProgram: 0,
          lastSessionCompletedAt: null,
        }),
    }),
    {
      name: "resistance-training-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => {
        const { onboardingDraft: _unused, currentSessionDraft: _unused2, ...rest } = state;
        return rest as AppState;
      },
    }
  )
);
