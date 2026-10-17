import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { HipHingeAnimation } from "@/components/HipHingeAnimation";
import { DEMO_ASSETS } from "@/data/demoAssets";
import { useAppStore } from "@/store/useAppStore";
import { color, space, tapTarget } from "@/theme/tokens";

/**
 * Hinges have no photo demo in any source (see assets/demos/CREDITS.md), so
 * they get a drawn one. Seated and standing hinges use matching figures — a
 * seated drawing on a standing exercise would be the same mismatch the photo
 * sourcing was careful to avoid.
 */
const ANIMATED_HINGES: Record<string, "seated" | "standing"> = {
  seated_hip_hinge_chair: "seated",
  seated_hip_hinge_band: "seated",
  standing_hip_hinge: "standing",
  dumbbell_romanian_deadlift: "standing",
};

interface Props {
  exerciseId: string;
}

/**
 * Demo photos show the positions of the movement in sequence. When an exercise
 * has neither a photo nor a drawn figure, the cues stand on their own — a
 * stand-in image of the wrong movement is worse than none for this audience,
 * so nothing is substituted.
 */
export function ExerciseDemo({ exerciseId }: Props) {
  const sex = useAppStore((s) => s.profile?.sex);

  const hinge = ANIMATED_HINGES[exerciseId];
  if (hinge) {
    return <HipHingeAnimation variant={hinge} figure={sex === "male" ? "male" : "female"} />;
  }

  const frames = DEMO_ASSETS[exerciseId];
  if (!frames || frames.length === 0) {
    return (
      <View style={styles.placeholder}>
        <BodyText muted center>
          No demo photo for this one yet — follow the steps below.
        </BodyText>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.frameRow}>
        {frames.map((frame, i) => (
          <Image
            key={i}
            source={frame}
            style={[styles.image, frames.length > 1 && styles.imageInRow]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
            accessibilityLabel={
              frames.length > 1
                ? `Position ${i + 1} of ${frames.length} for this exercise`
                : "Photo showing the positions of this exercise"
            }
          />
        ))}
      </View>
      <BodyText muted style={styles.caption}>
        Follow the positions from left to right.
      </BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: space.md,
    marginBottom: space.md,
  },
  frameRow: {
    flexDirection: "row",
    gap: space.xs,
  },
  image: {
    flex: 1,
    height: 200,
    borderRadius: tapTarget.radius,
    backgroundColor: color.surfaceMuted,
  },
  imageInRow: {
    height: 150,
  },
  caption: {
    marginTop: space.xs,
  },
  placeholder: {
    backgroundColor: color.surfaceMuted,
    borderRadius: tapTarget.radius,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
    marginTop: space.md,
    marginBottom: space.md,
  },
});
