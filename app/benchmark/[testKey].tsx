import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Stepper } from "@/components/Stepper";
import { BENCHMARK_TESTS, nextTest } from "@/content/benchmarkTests";
import { useAppStore } from "@/store/useAppStore";
import type { TestKey } from "@/types/models";

export default function BenchmarkTestScreen() {
  const { testKey } = useLocalSearchParams<{ testKey: string }>();
  const test = BENCHMARK_TESTS.find((t) => t.key === testKey);
  const recordBenchmarkResult = useAppStore((s) => s.recordBenchmarkResult);
  const [value, setValue] = useState(test ? Math.round((test.inputMin + test.inputMax) / 4) : 0);

  if (!test) {
    return (
      <ScreenContainer>
        <BodyText>Test not found.</BodyText>
      </ScreenContainer>
    );
  }

  function handleDone() {
    recordBenchmarkResult(test!.key as TestKey, value);
    const upcoming = nextTest(test!.key as TestKey);
    if (upcoming) {
      router.push(`/benchmark/${upcoming.key}`);
    } else {
      router.push("/benchmark/results");
    }
  }

  return (
    <ScreenContainer footer={<BigButton label="Done with this test" onPress={handleDone} />}>
      <BodyText muted>
        Test {test.order} of {BENCHMARK_TESTS.length}
      </BodyText>
      <BodyText size="title" bold style={{ marginTop: 4 }}>
        {test.name}
      </BodyText>
      <BodyText muted style={{ marginTop: 4, marginBottom: 16 }}>
        Measures: {test.measures}
      </BodyText>

      {test.protocol.map((step, i) => (
        <BodyText key={i} style={{ marginBottom: 10 }}>
          • {step}
        </BodyText>
      ))}

      <View
        style={{
          backgroundColor: "#EFEBE4",
          borderRadius: 16,
          padding: 16,
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <BodyText muted>Seated or supported option: {test.seatedFallback}</BodyText>
      </View>

      <BodyText size="bodyLarge" bold style={{ marginTop: 24, textAlign: "center" }}>
        {test.inputLabel}
      </BodyText>
      <Stepper
        value={value}
        onChange={setValue}
        min={test.inputMin}
        max={test.inputMax}
        step={test.inputStep}
        suffix={test.inputUnit}
      />
    </ScreenContainer>
  );
}
