/**
 * Design tokens enforcing the app's non-negotiables:
 * - minimum 18pt body text
 * - minimum 44pt tap targets
 * - high contrast, large touch-friendly spacing for one-handed use without reading glasses
 */

export const color = {
  background: "#F7F5F2",
  surface: "#FFFFFF",
  surfaceMuted: "#EFEBE4",
  text: "#1E1B16",
  textMuted: "#5C574E",
  primary: "#2F5D50",
  primaryPressed: "#244A40",
  onPrimary: "#FFFFFF",
  accent: "#C97B3D",
  success: "#2F6D3B",
  warning: "#8A5A00",
  danger: "#9A3B2E",
  border: "#DFD9CD",
} as const;

export const font = {
  // pt sizes; 18 is the floor for any body text per spec.
  body: 18,
  bodyLarge: 20,
  label: 18,
  title: 26,
  display: 32,
  caption: 18, // spec disallows small print; captions are still full body size
} as const;

export const space = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 28,
  xl: 40,
} as const;

export const tapTarget = {
  minHeight: 56, // comfortably above the 44pt floor for gloved/dumbbell-holding hands
  minWidth: 56,
  radius: 16,
} as const;

export const layout = {
  screenPadding: space.md,
  maxContentWidth: 480,
} as const;
