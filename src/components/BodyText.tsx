import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { color, font } from "@/theme/tokens";

interface Props extends TextProps {
  size?: "body" | "bodyLarge" | "title" | "display";
  muted?: boolean;
  bold?: boolean;
  center?: boolean;
  style?: TextStyle;
}

export function BodyText({
  size = "body",
  muted = false,
  bold = false,
  center = false,
  style,
  children,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontSize: font[size],
          color: muted ? color.textMuted : color.text,
          fontWeight: bold ? "700" : "400",
          textAlign: center ? "center" : "left",
          lineHeight: font[size] * 1.4,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
