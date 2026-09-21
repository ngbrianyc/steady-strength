import React, { useState } from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { OptionCard } from "@/components/OptionCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppStore } from "@/store/useAppStore";
import type { ActivityLevel } from "@/types/models";

const OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "rarely_active", label: "Rarely active", description: "Mostly sitting, little regular movement" },
  { value: "some_walking", label: "Some walking", description: "Regular walks or light chores" },
  { value: "regularly_active", label: "Regularly active", description: "Frequent walks, sports, or other exercise" },
];

export default function ActivityScreen() {
  const setField = useAppStore((s) => s.setOnboardingField);
  const draft = useAppStore((s) => s.onboardingDraft.activityLevel);
  const [level, setLevel] = useState<ActivityLevel | null>(draft);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Continue"
          disabled={level === null}
          onPress={() => {
            if (!level) return;
            setField("activityLevel", level);
            router.push("/onboarding/equipment");
          }}
        />
      }
    >
      <BodyText size="title" bold>
        How active are you currently?
      </BodyText>
      <BodyText muted style={{ marginTop: 8, marginBottom: 16 }}>
        There's no wrong answer here — this just sets your starting point.
      </BodyText>
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          description={opt.description}
          selected={level === opt.value}
          onPress={() => setLevel(opt.value)}
        />
      ))}
    </ScreenContainer>
  );
}
