import clsx from "clsx";
import * as Haptics from "expo-haptics";
import { Plus } from "lucide-react-native";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface AddTodoProps {
  onAdd: (text: string) => void;
}

export const AddTodo = ({ onAdd }: AddTodoProps) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAdd(text.trim());
      setText("");
    }
  };

  return (
    <View className="p-4 bg-transparent">
      <View className="flex-row items-center gap-3">
        <View className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-row items-center px-4 h-14">
          <TextInput
            className="flex-1 text-base text-zinc-900 dark:text-white h-full"
            placeholder="Add a new task..."
            placeholderTextColor="#a1a1aa"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
        </View>

        <TouchableOpacity
          onPress={handleAdd}
          disabled={!text.trim()}
          className={clsx(
            "w-14 h-14 rounded-2xl items-center justify-center shadow-md",
            text.trim()
              ? "bg-black dark:bg-white"
              : "bg-zinc-200 dark:bg-zinc-800",
          )}
        >
          <Plus
            size={24}
            color={text.trim() ? "white" : "#a1a1aa"}
            className="dark:text-black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
