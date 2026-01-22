import { TodoItem } from "@/components/TodoItem";
import { useTodoStore } from "@/store/useTodoStore";
import { Trash2 } from "lucide-react-native";
import React from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompletedScreen() {
  const { todos, toggleTodo, deleteTodo, updateTodo, deleteCompleted } =
    useTodoStore();

  const completedTodos = todos.filter((t) => t.isCompleted);

  const confirmClear = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all completed tasks?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteCompleted },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black" edges={["top"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="mb-6 mt-2 flex-row justify-between items-start">
          <View>
            <Text className="text-3xl font-bold text-zinc-900 dark:text-white">
              History
            </Text>
            <Text className="text-zinc-500 text-sm mt-1">
              {completedTodos.length} tasks completed
            </Text>
          </View>
          {completedTodos.length > 0 && (
            <TouchableOpacity
              onPress={confirmClear}
              className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={completedTodos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 opacity-50">
              <Text className="text-zinc-400 text-base">
                No completed tasks yet.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
