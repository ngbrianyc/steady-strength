import React, { useMemo } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { getExerciseById } from "@/data/exerciseRepo";
import {
  computeStreak,
  countSessions,
  progressMessageForStreak,
  shouldPromptRebenchmark,
} from "@/lib/progress";
import { useAppStore } from "@/store/useAppStore";
import { color, space, tapTarget } from "@/theme/tokens";

export default function ProgressScreen() {
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const activeProgram = useAppStore((s) => s.activeProgram);
  const benchmarkResults = useAppStore((s) => s.benchmarkResults);
  const programExercises = useAppStore((s) => s.programExercises);

  const streak = useMemo(() => computeStreak(sessionLogs), [sessionLogs]);
  const message = useMemo(() => progressMessageForStreak(streak, sessionLogs), [streak, sessionLogs]);
  const promptRebenchmark = activeProgram
    ? shouldPromptRebenchmark(activeProgram, benchmarkResults)
    : false;

  const loadByExercise = useMemo(() => {
    const map = new Map<string, { name: string; latestLoad: number | null; sessions: number }>();
    for (const pe of programExercises) {
      const exercise = getExerciseById(pe.exerciseId);
      if (!exercise) continue;
      const logsForRow = sessionLogs.filter((l) => l.programExerciseId === pe.id);
      if (logsForRow.length === 0) continue;
      const existing = map.get(exercise.id);
      map.set(exercise.id, {
        name: exercise.name,
        latestLoad: pe.targetLoad,
        sessions: (existing?.sessions ?? 0) + logsForRow.length,
      });
    }
    return Array.from(map.values());
  }, [programExercises, sessionLogs]);

  return (
    <ScreenContainer>
      <BodyText size="title" bold>
        Your progress
      </BodyText>

      <View style={{ flexDirection: "row", gap: space.md, marginTop: space.md, marginBottom: space.md }}>
        <StatCard label="Sessions completed" value={String(countSessions(sessionLogs))} />
        <StatCard label="Current streak" value={String(streak)} />
      </View>

      <BodyText style={{ marginBottom: space.md }}>{message}</BodyText>

      {loadByExercise.length > 0 && (
        <>
          <BodyText size="bodyLarge" bold style={{ marginBottom: space.xs }}>
            Where you're loading up
          </BodyText>
          {loadByExercise.map((row) => (
            <View key={row.name} style={{ marginBottom: 10 }}>
              <BodyText>
                {row.name}: {row.latestLoad !== null ? `${row.latestLoad} lb` : "bodyweight"} ·{" "}
                {row.sessions} session{row.sessions === 1 ? "" : "s"} logged
              </BodyText>
            </View>
          ))}
        </>
      )}

      {promptRebenchmark && (
        <View
          style={{
            backgroundColor: "#EAF2EE",
            borderRadius: 16,
            padding: space.md,
            marginTop: space.lg,
          }}
        >
          <BodyText bold style={{ marginBottom: space.sm }}>
            It's been about 8 weeks — want to re-check your starting numbers?
          </BodyText>
          <View style={{ minHeight: tapTarget.minHeight, justifyContent: "center" }}>
            <BigButton
              label="Re-run my benchmark"
              onPress={() => router.push("/benchmark/intro")}
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: color.surface,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: color.border,
        padding: space.md,
        alignItems: "center",
      }}
    >
      <BodyText size="display" bold>
        {value}
      </BodyText>
      <BodyText muted center>
        {label}
      </BodyText>
    </View>
  );
}
