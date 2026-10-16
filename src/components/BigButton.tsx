import React, { useCallback, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { color, font, space, tapTarget } from "@/theme/tokens";

/**
 * Tremor and unsteady hands make an unintended second tap common in this age
 * group, and every consequential action in the app runs through this button:
 * a double tap would log a duplicate set or push the same screen twice.
 */
export const DOUBLE_TAP_GUARD_MS = 500;

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function BigButton({ label, onPress, variant = "primary", disabled = false }: Props) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  const lastPressAt = useRef(0);

  const handlePress = useCallback(() => {
    const now = Date.now();
    if (now - lastPressAt.current < DOUBLE_TAP_GUARD_MS) return;
    lastPressAt.current = now;
    onPress();
  }, [onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        isDanger && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary && styles.primaryLabel,
          variant === "secondary" && styles.secondaryLabel,
          isDanger && styles.dangerLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapTarget.minHeight + 8,
    borderRadius: tapTarget.radius,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  primary: {
    backgroundColor: color.primary,
  },
  secondary: {
    backgroundColor: color.surface,
    borderWidth: 2,
    borderColor: color.primary,
  },
  danger: {
    backgroundColor: color.surface,
    borderWidth: 2,
    borderColor: color.danger,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: font.bodyLarge,
    fontWeight: "700",
  },
  primaryLabel: {
    color: color.onPrimary,
  },
  secondaryLabel: {
    color: color.primary,
  },
  dangerLabel: {
    color: color.danger,
  },
});
