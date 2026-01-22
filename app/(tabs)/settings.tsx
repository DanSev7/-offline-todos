import { useTodoStore } from "@/store/useTodoStore";
import * as FileSystem from "expo-file-system";
import { Database, Info, Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { deleteCompleted, todos } = useTodoStore();

  // Basic info about storage location (simplified for display)
  const dbPath =
    Platform.OS === "android"
      ? `${FileSystem.documentDirectory}SQLite/todos.db`
      : `${FileSystem.documentDirectory}SQLite/todos.db`;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black" edges={["top"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-bold text-zinc-900 dark:text-white">
            Settings
          </Text>
        </View>

        <View className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 mb-6">
          <View className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex-row items-center gap-3">
            <Database size={20} className="text-zinc-500" />
            <View>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Database Location
              </Text>
              <Text className="text-xs text-zinc-500 mt-1 pr-4" selectable>
                {dbPath}
              </Text>
            </View>
          </View>
          <View className="p-4 flex-row items-center gap-3">
            <Info size={20} className="text-zinc-500" />
            <View>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                App Version
              </Text>
              <Text className="text-xs text-zinc-500 mt-1">
                1.0.0 (Expo SQLite + Drizzle)
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50"
          onPress={() =>
            Alert.alert(
              "Reset Data?",
              "This handles mainly just completed items for now via the store.",
              [{ text: "OK" }],
            )
          }
        >
          <Trash2 size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold">
            Delete All Data (Coming Soon)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
