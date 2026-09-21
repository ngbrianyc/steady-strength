import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { color, font, space, tapTarget } from "@/theme/tokens";

interface Props {
  question: string;
  answer: boolean | null;
  onAnswer: (value: boolean) => void;
}

export function ReadinessQuestionCard({ question, answer, onAnswer }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: answer === true }}
          onPress={() => onAnswer(true)}
          style={({ pressed }) => [
            styles.choice,
            answer === true && styles.choiceSelectedYes,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.choiceLabel, answer === true && styles.choiceLabelSelected]}>Yes</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: answer === false }}
          onPress={() => onAnswer(false)}
          style={({ pressed }) => [
            styles.choice,
            answer === false && styles.choiceSelectedNo,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.choiceLabel, answer === false && styles.choiceLabelSelected]}>No</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: tapTarget.radius,
    borderWidth: 2,
    borderColor: color.border,
    padding: space.md,
    marginBottom: space.md,
  },
  question: {
    fontSize: font.bodyLarge,
    color: color.text,
    marginBottom: space.sm,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: space.sm,
  },
  choice: {
    flex: 1,
    minHeight: tapTarget.minHeight,
    borderRadius: tapTarget.radius,
    borderWidth: 2,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceSelectedYes: {
    borderColor: color.warning,
    backgroundColor: "#FBF1DF",
  },
  choiceSelectedNo: {
    borderColor: color.primary,
    backgroundColor: "#EAF2EE",
  },
  pressed: {
    opacity: 0.85,
  },
  choiceLabel: {
    fontSize: font.bodyLarge,
    fontWeight: "700",
    color: color.text,
  },
  choiceLabelSelected: {
    color: color.text,
  },
});
