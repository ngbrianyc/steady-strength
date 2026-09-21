import type { Exercise } from "@/types/models";
import exercisesData from "@/data/exercises.json";

export const EXERCISES = exercisesData as Exercise[];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
