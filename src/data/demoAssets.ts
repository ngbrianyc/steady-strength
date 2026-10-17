import type { ImageSourcePropType } from "react-native";

/**
 * Exercise demo photos, keyed by exercise id. Values are frame sequences:
 * the NIA photographs already contain their panels in one image, so most are
 * a single frame, while the open-dataset entries supply separate start and
 * end frames.
 *
 * Static requires are deliberate — Metro resolves these at build time, so the
 * map cannot be generated from a string at runtime.
 *
 * Sources and licensing: assets/demos/CREDITS.md. Only exercises whose demo
 * genuinely matches the movement appear here; the rest get a drawn figure
 * (see ExerciseDemo) or fall back to cues.
 */
export const DEMO_ASSETS: Record<string, ImageSourcePropType[]> = {
  // National Institute on Aging — older adults, movement-accurate
  chair_squat: [require("../../assets/demos/chair_squat.jpg")],
  wall_push_up: [require("../../assets/demos/wall_push_up.jpg")],
  supported_single_leg_stance: [require("../../assets/demos/supported_single_leg_stance.jpg")],
  tandem_stance_supported: [require("../../assets/demos/tandem_stance_supported.jpg")],
  seated_row_band: [require("../../assets/demos/seated_row_band.jpg")],
  seated_knee_extension: [require("../../assets/demos/seated_knee_extension.jpg")],
  seated_leg_extension_band: [require("../../assets/demos/seated_leg_extension_band.jpg")],
  dumbbell_seated_overhead_press: [require("../../assets/demos/dumbbell_seated_overhead_press.jpg")],

  // free-exercise-db (The Unlicense) — gym setting, but the movement is right
  dumbbell_goblet_squat: [
    require("../../assets/demos/dumbbell_goblet_squat_0.jpg"),
    require("../../assets/demos/dumbbell_goblet_squat_1.jpg"),
  ],
  incline_push_up: [
    require("../../assets/demos/incline_push_up_0.jpg"),
    require("../../assets/demos/incline_push_up_1.jpg"),
  ],
};
