import React from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppStore } from "@/store/useAppStore";

export default function ReadinessGateScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Continue anyway"
          onPress={() => {
            completeOnboarding();
            router.push("/benchmark/intro");
          }}
        />
      }
    >
      <BodyText size="title" bold>
        Worth a quick check with your doctor
      </BodyText>
      <BodyText style={{ marginTop: 16 }}>
        Based on your answers, it's a good idea to clear this program with your doctor before you
        start. That's not because anything is necessarily wrong — it's just a sensible step given
        what you told us.
      </BodyText>
      <BodyText style={{ marginTop: 16 }} muted>
        If you'd rather continue now, we'll favor seated and supported exercises for you. You can
        always adjust this later.
      </BodyText>
    </ScreenContainer>
  );
}
