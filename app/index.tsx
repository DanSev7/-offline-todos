import { AddTodo } from "../components/AddTodo";
import { TodoItem } from "../components/TodoItem";
import { useTodoStore } from "../store/useTodoStore";
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

export default function Index() {
  const { todos, toggleTodo, deleteTodo, addTodo } = useTodoStore();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-black">
      <StatusBar style="auto" />
      <View className="flex-1 px-4 pt-4">
        <View className="mb-6 mt-2">
          <Text className="text-3xl font-bold text-zinc-900 dark:text-white">
            To-Do
          </Text>
          <Text className="text-zinc-500 text-sm mt-1">
            {todos.filter((t) => !t.isCompleted).length} tasks remaining
          </Text>
        </View>

        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TodoItem todo={item} onToggle={toggleTodo} onDelete={deleteTodo} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 opacity-50">
              <Text className="text-zinc-400 text-base">No tasks yet.</Text>
            </View>
          }
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="absolute bottom-0 left-0 right-0"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <AddTodo onAdd={addTodo} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
