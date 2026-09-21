import React, { useMemo } from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { BENCHMARK_TESTS } from "@/content/benchmarkTests";
import { TEST_LABELS, summarizeBenchmark } from "@/lib/scoring";
import { useAppStore } from "@/store/useAppStore";

export default function BenchmarkResultsScreen() {
  const results = useAppStore((s) => s.latestBenchmarkResults());
  const generateProgram = useAppStore((s) => s.generateProgramFromLatestBenchmark);

  const summary = useMemo(() => summarizeBenchmark(results), [results]);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Build my program"
          onPress={() => {
            generateProgram();
            router.replace("/(tabs)/today");
          }}
        />
      }
    >
      <BodyText size="title" bold>
        Here's what we learned
      </BodyText>
      <BodyText style={{ marginTop: 16, marginBottom: 24 }}>{summary.paragraph}</BodyText>

      {summary.weakestTestKeys.length > 0 && (
        <>
          <BodyText size="bodyLarge" bold style={{ marginBottom: 8 }}>
            We'll start by focusing on:
          </BodyText>
          {summary.weakestTestKeys.map((key) => (
            <BodyText key={key} style={{ marginBottom: 6 }}>
              • {TEST_LABELS[key]}
            </BodyText>
          ))}
        </>
      )}

      {summary.unscoredTestKeys.length > 0 && (
        <>
          <BodyText size="bodyLarge" bold style={{ marginTop: 24, marginBottom: 8 }}>
            Your starting numbers
          </BodyText>
          {summary.unscoredTestKeys.map((key) => {
            const result = results.find((r) => r.testKey === key);
            const test = BENCHMARK_TESTS.find((t) => t.key === key);
            const unit =
              test?.inputUnit === "reps" && Math.abs(result?.rawValue ?? 0) === 1
                ? "rep"
                : test?.inputUnit;
            return (
              <BodyText key={key} style={{ marginBottom: 6 }}>
                • {TEST_LABELS[key]}: {result?.rawValue}
                {unit ? ` ${unit}` : ""}
              </BodyText>
            );
          })}
        </>
      )}
    </ScreenContainer>
  );
}
