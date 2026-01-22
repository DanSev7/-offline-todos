import { expoDb } from "@/db/client";
import { useTodoStore } from "@/store/useTodoStore";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "./global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const init = useTodoStore((state) => state.init);
  useDrizzleStudio(expoDb);

  useEffect(() => {
    init();
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
    }
    requestPermissions();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
