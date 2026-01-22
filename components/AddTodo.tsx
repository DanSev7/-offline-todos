import DateTimePicker from "@react-native-community/datetimepicker";
import clsx from "clsx";
import * as Haptics from "expo-haptics";
import { Clock, Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AddTodoProps {
  onAdd: (text: string, dueDate?: Date) => void;
}

export const AddTodo = ({ onAdd }: AddTodoProps) => {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleAdd = () => {
    if (text.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onAdd(text.trim(), dueDate);
      setText("");
      setDueDate(undefined);
      setShowPresets(false);
    }
  };

  const handleClockPress = () => {
    // Keyboard.dismiss();
    setShowPresets(!showPresets);
    setShowPicker(false);
  };

  const setPreset = (minutes: number) => {
    const now = new Date();
    if (minutes === -1) {
      // Tomorrow Morning 9am
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
      setDueDate(now);
    } else {
      setDueDate(new Date(now.getTime() + minutes * 60000));
    }
    setShowPresets(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <View className="p-4 bg-transparent gap-3">
      {/* Reminder Presets */}
      {showPresets && (
        <View className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-2 shadow-sm">
          <Text className="text-xs font-semibold text-zinc-500 mb-2 uppercase">
            Quick Reminders
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="gap-2"
          >
            {[
              { l: "5m", v: 5 },
              { l: "15m", v: 15 },
              { l: "30m", v: 30 },
              { l: "1h", v: 60 },
              { l: "3h", v: 180 },
              { l: "Tomorrow", v: -1 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.l}
                onPress={() => setPreset(opt.v)}
                className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg"
              >
                <Text className="text-zinc-900 dark:text-white font-medium">
                  {opt.l}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => {
                setShowPresets(false);
                setShowPicker(true);
              }}
              className="bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800"
            >
              <Text className="text-blue-600 dark:text-blue-400 font-medium">
                Custom...
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Date Display / Preview */}
      {dueDate && (
        <View className="flex-row items-center gap-2 px-2">
          <Clock size={14} color="#2563eb" />
          <Text className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Remind me:{" "}
            {dueDate.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <TouchableOpacity onPress={() => setDueDate(undefined)}>
            <X size={14} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

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
          <TouchableOpacity onPress={handleClockPress} className="p-2">
            <Clock
              size={20}
              color={dueDate || showPresets ? "#2563eb" : "#a1a1aa"}
            />
          </TouchableOpacity>
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
            color={text.trim() ? "black" : "#a1a1aa"}
            className="dark:text-black"
          />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="datetime"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};
