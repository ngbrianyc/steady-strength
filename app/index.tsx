import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const profile = useAppStore((s) => s.profile);
  const activeProgram = useAppStore((s) => s.activeProgram);
  const latestResults = useAppStore((s) => s.latestBenchmarkResults());

  if (!profile) {
    return <Redirect href="/onboarding/age" />;
  }
  if (latestResults.length < 5) {
    return <Redirect href="/benchmark/intro" />;
  }
  if (!activeProgram) {
    return <Redirect href="/benchmark/results" />;
  }
  return <Redirect href="/(tabs)/today" />;
}
