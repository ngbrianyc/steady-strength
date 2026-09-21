import React from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { BENCHMARK_TESTS } from "@/content/benchmarkTests";

export default function BenchmarkIntro() {
  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Start"
          onPress={() => router.push(`/benchmark/${BENCHMARK_TESTS[0].key}`)}
        />
      }
    >
      <BodyText size="title" bold>
        Let's see where you're starting from
      </BodyText>
      <BodyText style={{ marginTop: 12, marginBottom: 20 }}>
        Five short tests, each with a seated or supported option. There's no passing or failing —
        this just tells us where to focus your first few weeks.
      </BodyText>
      {BENCHMARK_TESTS.map((t) => (
        <View key={t.key} style={{ marginBottom: 16 }}>
          <BodyText size="bodyLarge" bold>
            {t.order}. {t.name}
          </BodyText>
          <BodyText muted>{t.measures}</BodyText>
        </View>
      ))}
    </ScreenContainer>
  );
}
