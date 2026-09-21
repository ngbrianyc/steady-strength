import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { color, font, space, tapTarget } from "@/theme/tokens";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function Stepper({ value, onChange, min = 0, max = 120, step = 1, suffix }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>−</Text>
      </Pressable>
      <Text style={styles.value}>
        {value}
        {suffix ? ` ${suffix}` : ""}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: space.lg,
  },
  button: {
    width: tapTarget.minHeight + 16,
    height: tapTarget.minHeight + 16,
    borderRadius: (tapTarget.minHeight + 16) / 2,
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    color: color.onPrimary,
    fontSize: 34,
    fontWeight: "700",
    marginTop: -2,
  },
  value: {
    fontSize: font.display,
    fontWeight: "700",
    color: color.text,
    minWidth: 120,
    textAlign: "center",
  },
});
