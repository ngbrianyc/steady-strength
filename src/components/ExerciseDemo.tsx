import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { HipHingeAnimation } from "@/components/HipHingeAnimation";
import { DEMO_ASSETS } from "@/data/demoAssets";
import { color, space, tapTarget } from "@/theme/tokens";

/**
 * Hinges have no photo demo in any source (see assets/demos/CREDITS.md), so
 * they get a drawn one. Seated and standing hinges use matching figures — a
 * seated drawing on a standing exercise would be the same mismatch the photo
 * sourcing was careful to avoid.
 */
const ANIMATED_DEMOS: Record<string, React.ReactElement> = {
  seated_hip_hinge_chair: <HipHingeAnimation variant="seated" />,
  seated_hip_hinge_band: <HipHingeAnimation variant="seated" />,
  standing_hip_hinge: <HipHingeAnimation variant="standing" />,
  dumbbell_romanian_deadlift: <HipHingeAnimation variant="standing" />,
};

interface Props {
  exerciseId: string;
}

/**
 * Demo images show the start and end position side by side in a single frame.
 * When an exercise has no demo, the cues stand on their own — a stand-in image
 * of the wrong movement or the wrong person is worse than none for this
 * audience, so nothing is substituted.
 */
export function ExerciseDemo({ exerciseId }: Props) {
  const animated = ANIMATED_DEMOS[exerciseId];
  if (animated) return animated;

  const asset = DEMO_ASSETS[exerciseId];

  if (!asset) {
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
      <Image
        source={asset}
        style={styles.image}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel="Photo showing the start and end position of this exercise"
      />
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
  image: {
    width: "100%",
    height: 220,
    borderRadius: tapTarget.radius,
    backgroundColor: color.surfaceMuted,
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
