import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { color, layout } from "@/theme/tokens";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = true, footer, style }: Props) {
  const Content = scroll ? ScrollView : View;
  const contentProps = scroll
    ? { contentContainerStyle: styles.scrollContent, keyboardShouldPersistTaps: "handled" as const }
    : { style: styles.scrollContent };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Content {...(contentProps as any)}>
        <View style={[styles.inner, style]}>{children}</View>
      </Content>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: color.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    padding: layout.screenPadding,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
  footer: {
    padding: layout.screenPadding,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
});
