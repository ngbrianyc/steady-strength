import React, { useState } from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Stepper } from "@/components/Stepper";
import { useAppStore } from "@/store/useAppStore";

export default function AgeScreen() {
  const setField = useAppStore((s) => s.setOnboardingField);
  const draftAge = useAppStore((s) => s.onboardingDraft.age);
  const [age, setAge] = useState(draftAge ?? 65);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Continue"
          onPress={() => {
            setField("age", age);
            router.push("/onboarding/sex");
          }}
        />
      }
    >
      <BodyText size="title" bold>
        How old are you?
      </BodyText>
      <BodyText muted style={{ marginTop: 8 }}>
        This helps us compare your results to people your age, fairly.
      </BodyText>
      <Stepper value={age} onChange={setAge} min={18} max={110} />
    </ScreenContainer>
  );
}
