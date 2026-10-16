import type { ImageSourcePropType } from "react-native";

/**
 * Exercise demo photos, keyed by exercise id.
 *
 * Static requires are deliberate — Metro resolves these at build time, so the
 * map cannot be generated from a string at runtime.
 *
 * Source and licensing: assets/demos/CREDITS.md. Only exercises with a demo
 * that genuinely matches the movement appear here; the rest intentionally fall
 * back to cues (see ExerciseDemo).
 */
export const DEMO_ASSETS: Record<string, ImageSourcePropType> = {
  chair_squat: require("../../assets/demos/chair_squat.jpg"),
  wall_push_up: require("../../assets/demos/wall_push_up.jpg"),
  supported_single_leg_stance: require("../../assets/demos/supported_single_leg_stance.jpg"),
  tandem_stance_supported: require("../../assets/demos/tandem_stance_supported.jpg"),
  seated_row_band: require("../../assets/demos/seated_row_band.jpg"),
  seated_knee_extension: require("../../assets/demos/seated_knee_extension.jpg"),
  dumbbell_seated_overhead_press: require("../../assets/demos/dumbbell_seated_overhead_press.jpg"),
};
