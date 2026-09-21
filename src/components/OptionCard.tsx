import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { color, font, space, tapTarget } from "@/theme/tokens";

interface Props {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, description, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected ? <View style={styles.checkboxDot} /> : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: tapTarget.minHeight + 16,
    borderRadius: tapTarget.radius,
    borderWidth: 2,
    borderColor: color.border,
    backgroundColor: color.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginBottom: space.sm,
  },
  selected: {
    borderColor: color.primary,
    backgroundColor: "#EAF2EE",
  },
  pressed: {
    opacity: 0.85,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: color.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: space.sm,
  },
  checkboxSelected: {
    borderColor: color.primary,
  },
  checkboxDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: color.primary,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: font.bodyLarge,
    color: color.text,
    fontWeight: "600",
  },
  labelSelected: {
    color: color.primary,
  },
  description: {
    fontSize: font.body,
    color: color.textMuted,
    marginTop: 2,
  },
});
