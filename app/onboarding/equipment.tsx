import React from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { OptionCard } from "@/components/OptionCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppStore } from "@/store/useAppStore";
import type { Equipment } from "@/types/models";

const OPTIONS: { value: Equipment; label: string }[] = [
  { value: "none", label: "None — bodyweight only" },
  { value: "bands", label: "Resistance bands" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "full_gym", label: "Full gym access" },
];

export default function EquipmentScreen() {
  const equipment = useAppStore((s) => s.onboardingDraft.equipment);
  const toggle = useAppStore((s) => s.toggleOnboardingEquipment);

  return (
    <ScreenContainer
      footer={
        <BigButton
          label="Continue"
          disabled={equipment.length === 0}
          onPress={() => router.push("/onboarding/readiness")}
        />
      }
    >
      <BodyText size="title" bold>
        What equipment do you have?
      </BodyText>
      <BodyText muted style={{ marginTop: 8, marginBottom: 16 }}>
        Pick everything that applies. Every exercise also has a no-equipment version.
      </BodyText>
      {OPTIONS.map((opt) => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          selected={equipment.includes(opt.value)}
          onPress={() => toggle(opt.value)}
        />
      ))}
    </ScreenContainer>
  );
}
