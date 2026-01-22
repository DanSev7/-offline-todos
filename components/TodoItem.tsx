import { Todo } from "@/db/schema";
import clsx from "clsx";
import * as Haptics from "expo-haptics";
import { Check, Trash2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate?: (id: number, text: string) => void;
}

export const TodoItem = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isEditing) {
      // small delay to let UI render input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isEditing]);

  const handleToggle = () => {
    if (isEditing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(todo.id);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete(todo.id);
  };

  const handleLongPress = () => {
    if (todo.isCompleted) return; // Don't edit completed tasks
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const submitEdit = () => {
    if (editText.trim() && editText !== todo.text && onUpdate) {
      onUpdate(todo.id, editText.trim());
    } else {
      setEditText(todo.text); // reset if empty or no change
    }
    setIsEditing(false);
  };

  return (
    <View className="flex-row items-center justify-between p-4 bg-white dark:bg-zinc-900 mb-2 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
      <TouchableOpacity
        onPress={handleToggle}
        onLongPress={handleLongPress}
        className="flex-row items-center flex-1 gap-3"
        activeOpacity={0.7}
      >
        <View
          className={clsx(
            "w-6 h-6 rounded-full items-center justify-center border",
            todo.isCompleted
              ? "bg-green-500 border-green-500"
              : "border-zinc-300 dark:border-zinc-600",
          )}
        >
          {todo.isCompleted && (
            <Check size={14} color="white" strokeWidth={3} />
          )}
        </View>

        {isEditing ? (
          <TextInput
            ref={inputRef}
            className="flex-1 text-base text-zinc-900 dark:text-white p-0"
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={submitEdit}
            onBlur={submitEdit}
            returnKeyType="done"
          />
        ) : (
          <Text
            className={clsx(
              "text-base font-medium flex-1",
              todo.isCompleted
                ? "text-zinc-400 line-through dark:text-zinc-500"
                : "text-zinc-900 dark:text-white",
            )}
          >
            {todo.text}
          </Text>
        )}
      </TouchableOpacity>

      {!isEditing && (
        <TouchableOpacity
          onPress={handleDelete}
          className="p-2 opacity-60 active:opacity-100"
        >
          <Trash2 size={20} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};
