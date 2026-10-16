import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ExerciseDemo } from "@/components/ExerciseDemo";
import { ScreenContainer } from "@/components/ScreenContainer";
import { getExerciseById } from "@/data/exerciseRepo";
import { space, tapTarget } from "@/theme/tokens";

function applyGloss(text: string, gloss: Record<string, string> | undefined): string {
  if (!gloss) return text;
  let result = text;
  for (const [term, definition] of Object.entries(gloss)) {
    if (result.toLowerCase().includes(term.toLowerCase())) {
      result += ` (${definition})`;
    }
  }
  return result;
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = id ? getExerciseById(id) : undefined;

  if (!exercise) {
    return (
      <ScreenContainer>
        <BodyText>Exercise not found.</BodyText>
      </ScreenContainer>
    );
  }

  const substitutes = exercise.substituteIds
    .map((sid) => getExerciseById(sid))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const seatedSub = substitutes.find((s) => s.isSeated);
  // A bodyweight seated variant satisfies both criteria; keep the two buttons
  // distinct so they never offer the same exercise twice.
  const noEquipmentSub = substitutes.find(
    (s) => s.equipmentRequired.every((e) => e === "none") && s.id !== exercise.id && s.id !== seatedSub?.id
  );

  return (
    <ScreenContainer
      footer={<BigButton label="Back to today" onPress={() => router.back()} />}
    >
      <BodyText size="title" bold>
        {exercise.name}
      </BodyText>

      <ExerciseDemo exerciseId={exercise.id} />

      <BodyText size="bodyLarge" bold style={{ marginBottom: space.xs }}>
        How to do it
      </BodyText>
      {exercise.cues.map((cue, i) => (
        <BodyText key={i} style={{ marginBottom: 10 }}>
          • {applyGloss(cue, exercise.jargonGloss)}
        </BodyText>
      ))}

      <BodyText size="bodyLarge" bold style={{ marginTop: space.md, marginBottom: space.xs }}>
        Common mistake
      </BodyText>
      <BodyText style={{ marginBottom: space.md }}>{exercise.commonMistake}</BodyText>

      {(noEquipmentSub || seatedSub) && (
        <View style={{ marginTop: space.sm }}>
          <BodyText size="bodyLarge" bold style={{ marginBottom: space.xs }}>
            Need a different version?
          </BodyText>
          {noEquipmentSub && noEquipmentSub.id !== exercise.id && (
            <View style={{ minHeight: tapTarget.minHeight, justifyContent: "center" }}>
              <BigButton
                label={`No-equipment version: ${noEquipmentSub.name}`}
                variant="secondary"
                onPress={() => router.replace(`/exercise/${noEquipmentSub.id}`)}
              />
            </View>
          )}
          {seatedSub && (
            <View style={{ minHeight: tapTarget.minHeight, justifyContent: "center" }}>
              <BigButton
                label={`Seated version: ${seatedSub.name}`}
                variant="secondary"
                onPress={() => router.replace(`/exercise/${seatedSub.id}`)}
              />
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
