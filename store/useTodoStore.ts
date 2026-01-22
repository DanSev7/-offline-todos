import { desc, eq } from "drizzle-orm";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { db, initializeDb } from "../db/client";
import { todos } from "../db/schema";

interface TodoState {
  todos: (typeof todos.$inferSelect)[];
  init: () => Promise<void>;
  loadTodos: () => Promise<void>;
  addTodo: (text: string, dueDate?: Date) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  updateTodo: (id: number, text: string) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  deleteCompleted: () => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  init: async () => {
    try {
      initializeDb();
      await get().loadTodos();
    } catch (e) {
      console.error("Failed to init DB", e);
    }
  },
  loadTodos: async () => {
    try {
      const data = await db.select().from(todos).orderBy(desc(todos.createdAt));
      set({ todos: data });
    } catch (e) {
      console.error("Failed to load todos", e);
    }
  },
  addTodo: async (text: string, dueDate?: Date) => {
    try {
      await db.insert(todos).values({
        text,
        createdAt: new Date(),
        isCompleted: false,
        dueDate: dueDate ?? null,
      });

      // Schedule Notification if due date is in the future
      if (dueDate && dueDate > new Date()) {
        const seconds = Math.floor((dueDate.getTime() - Date.now()) / 1000);
        if (seconds > 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Task Reminder ⏰",
              body: text,
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: seconds,
              repeats: false,
            },
          });
        }
      }

      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
  toggleTodo: async (id: number) => {
    try {
      const todo = get().todos.find((t) => t.id === id);
      if (!todo) return;

      const newStatus = !todo.isCompleted;

      await db
        .update(todos)
        .set({ isCompleted: newStatus })
        .where(eq(todos.id, id));

      await get().loadTodos();

      // Removed 100% completion logic as per request
    } catch (e) {
      console.error(e);
    }
  },
  updateTodo: async (id: number, text: string) => {
    try {
      await db.update(todos).set({ text }).where(eq(todos.id, id));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
  deleteTodo: async (id: number) => {
    try {
      await db.delete(todos).where(eq(todos.id, id));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
  deleteCompleted: async () => {
    try {
      await db.delete(todos).where(eq(todos.isCompleted, true));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
}));
