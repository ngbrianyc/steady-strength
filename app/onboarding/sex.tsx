import React, { useState } from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { OptionCard } from "@/components/OptionCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppStore } from "@/store/useAppStore";
import type { Sex } from "@/types/models";

export default function SexScreen() {
  const setField = useAppStore((s) => s.setOnboardingField);
  const draft = useAppStore((s) => s.onboardingDraft.sex);
  const [sex, setSex] = useState<Sex | null>(draft);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Continue"
          disabled={sex === null}
          onPress={() => {
            if (!sex) return;
            setField("sex", sex);
            router.push("/onboarding/activity");
          }}
        />
      }
    >
      <BodyText size="title" bold>
        What sex were you assigned at birth?
      </BodyText>
      <BodyText muted style={{ marginTop: 8, marginBottom: 16 }}>
        Fitness norms differ by sex, so this keeps your results accurate.
      </BodyText>
      <OptionCard label="Female" selected={sex === "female"} onPress={() => setSex("female")} />
      <OptionCard label="Male" selected={sex === "male"} onPress={() => setSex("male")} />
    </ScreenContainer>
  );
}
