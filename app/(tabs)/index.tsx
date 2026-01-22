import { AddTodo } from "@/components/AddTodo";
import { ProgressRing } from "@/components/ProgressRing";
import { TodoItem } from "@/components/TodoItem";
import { useTodoStore } from "@/store/useTodoStore";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TasksScreen() {
  const { todos, toggleTodo, deleteTodo, updateTodo, addTodo } = useTodoStore();

  // Filter for ACTIVE tasks
  const activeTodos = todos.filter((t) => !t.isCompleted);
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black" edges={["top"]}>
      <StatusBar style="auto" />
      <View className="flex-1 px-4 pt-4">
        <View className="mb-6 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold text-zinc-900 dark:text-white">
              To-Do
            </Text>
            <Text className="text-zinc-500 text-sm mt-1">
              {activeTodos.length} tasks needing attention
            </Text>
          </View>
          <View>
            <ProgressRing progress={progress} size={60} strokeWidth={6} />
          </View>
        </View>

        <FlatList
          data={activeTodos}
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
                No active tasks. Great job!
              </Text>
            </View>
          }
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="absolute bottom-0 left-0 right-0"
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <AddTodo onAdd={addTodo} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
