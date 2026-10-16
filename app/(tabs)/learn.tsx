import React, { useMemo } from "react";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { ScreenContainer } from "@/components/ScreenContainer";
import { learnContentFor } from "@/content/learnContent";
import { useAppStore } from "@/store/useAppStore";
import { ageBracketFor } from "@/types/models";
import { color, space, tapTarget } from "@/theme/tokens";

const TOPIC_LABELS: Record<string, string> = {
  mortality: "Living longer",
  cognition: "Thinking and memory",
  bone_density: "Bone strength",
  fall_risk: "Fall prevention",
};

export default function LearnScreen() {
  const profile = useAppStore((s) => s.profile);
  const entries = useMemo(
    () => learnContentFor(ageBracketFor(profile?.age ?? 60)),
    [profile?.age]
  );

  return (
    <ScreenContainer>
      <BodyText size="title" bold>
        Why this works
      </BodyText>
      <BodyText muted style={{ marginTop: 8, marginBottom: space.md }}>
        Real research, in plain language. No hype.
      </BodyText>

      {entries.map((entry) => (
        <View
          key={entry.id}
          style={{
            backgroundColor: color.surface,
            borderRadius: tapTarget.radius,
            borderWidth: 2,
            borderColor: color.border,
            padding: space.md,
            marginBottom: space.md,
          }}
        >
          <BodyText muted style={{ marginBottom: 4 }}>
            {TOPIC_LABELS[entry.topic] ?? entry.topic}
          </BodyText>
          <BodyText size="bodyLarge" bold style={{ marginBottom: space.xs }}>
            {entry.title}
          </BodyText>
          <BodyText style={{ marginBottom: space.xs }}>{entry.plainLanguageFinding}</BodyText>
          <BodyText muted>{entry.citation}</BodyText>
        </View>
      ))}

      {/* NIA's reuse policy asks that reproduced material credit NIA as the
          originator. See assets/demos/CREDITS.md. */}
      <BodyText muted style={{ marginBottom: space.lg }}>
        Exercise demonstration photos courtesy of the National Institute on Aging at NIH
        (nia.nih.gov).
      </BodyText>
    </ScreenContainer>
  );
}
