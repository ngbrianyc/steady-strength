import { Stack } from "expo-router";

export default function BenchmarkLayout() {
  return <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />;
}
