import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { color } from "@/theme/tokens";

export default function TabsLayout() {
  const profile = useAppStore((s) => s.profile);

  // Reachable without a profile via a restored URL or deep link, which would
  // otherwise strand the user on an empty Today tab with no route to onboarding.
  if (!profile) {
    return <Redirect href="/onboarding/age" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.primary,
        tabBarInactiveTintColor: color.textMuted,
        tabBarStyle: { height: 84, paddingTop: 8, paddingBottom: 16 },
        tabBarLabelStyle: { fontSize: 15, fontWeight: "600" },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color: c, size }) => <Ionicons name="today" size={size + 6} color={c} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color: c, size }) => (
            <Ionicons name="trending-up" size={size + 6} color={c} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color: c, size }) => <Ionicons name="book" size={size + 6} color={c} />,
        }}
      />
    </Tabs>
  );
}
