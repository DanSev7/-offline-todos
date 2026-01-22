# Codebase Deep Dive & Commentary

This document provides a detailed breakdown of the **Offline Todo App**. It explains not just _what_ the code does, but _why_ specific solutions were chosen.

## 1. Core Philosophy: "Offline First & Simple"

**The Goal**: A production-ready app that works without internet, feels native (fast), and is easy to maintain.

**The Solution Stack**:

- **Storage**: `expo-sqlite` (Raw power) + `drizzle-orm` (Safety).
- **State**: `zustand` (Less boilerplate than Redux, easier than Context).
- **UI**: `nativewind` (Tailwind CSS for React Native) for rapid styling.

---

## 2. Folder Structure Explained

```text
/app             -> The Navigation Router (File-based).
  (tabs)         -> Our Bottom Tab screens (Home, History, Settings).
  _layout.tsx    -> The Root Container (Providers, Global Config).
  global.css     -> Tailwind directives.
/components      -> Reusable UI blocks (Buttons, List Items).
/db              -> The Database Brain (Schema & Connection).
/store           -> The App Logic (Actions & State).
```

---

## 3. Deep Dive: Key Files & Functions

### A. The Database Layer (`/db`)

**Why SQLite?**
SharedPreferences/AsyncStorage are for _settings_, not _data_. SQLite is a robust SQL engine that lives on the phone. It handles thousands of rows easily.

#### `db/schema.ts`

We use **Drizzle ORM** to define our table in TypeScript. This prevents "magic string" errors (e.g., typing `is_complete` vs `is_completed`).

```typescript
export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }), // SQLite stores bools as 0/1, Drizzle converts them for us.
  createdAt: integer("created_at", { mode: "timestamp" }), // Stored as numbers (ms), converted to Date objects.
});
```

### B. The Logic Center (`/store/useTodoStore.ts`)

**Why Zustand?**
It allows us to access `state` and `actions` anywhere without wrapping components in `<Providers>`.

#### Code Walkthrough: `useTodoStore.ts`

This file is the **Logic Center** of the application. It handles all data state and business rules.

**Key Responsibilities:**
1.  **Initialize Database**: Checks for tables on startup.
2.  **CRUD Operations**: Create, Read, Update, Delete for Todos.
3.  **State Sync**: Ensures the in-memory `todos` array always matches the SQLite database.
4.  **Side Effects**: Triggers Notifications and Haptics (indirectly).

```typescript
import { desc, eq } from "drizzle-orm";
import { create } from "zustand";
import { db, initializeDb } from "../db/client";
import { todos } from "../db/schema";
import * as Notifications from "expo-notifications"; // Imported dynamically in logic

interface TodoState {
  todos: (typeof todos.$inferSelect)[];
  init: () => Promise<void>;
  loadTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  updateTodo: (id: number, text: string) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  deleteCompleted: () => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [], // Initial empty state

  // 1. INIT: Called by _layout.tsx when app starts
  init: async () => {
    try {
      initializeDb(); // Run raw SQL to create tables if missing
      await get().loadTodos(); // Fetch initial data
    } catch (e) {
      console.error("Failed to init DB", e);
    }
  },

  // 2. READ: Fetches data from SQLite and puts it in Zustand State
  loadTodos: async () => {
    try {
      // Drizzle Query: SELECT * FROM todos ORDER BY created_at DESC
      const data = await db.select().from(todos).orderBy(desc(todos.createdAt));
      set({ todos: data }); // Updates UI components automatically
    } catch (e) {
      console.error("Failed to load todos", e);
    }
  },

  // 3. CREATE
  addTodo: async (text: string) => {
    try {
      await db.insert(todos).values({
        text,
        createdAt: new Date(),
        isCompleted: false,
      });
      await get().loadTodos(); // Refresh state to show new item
    } catch (e) {
      console.error(e);
    }
  },

  // 4. UPDATE (Toggle Completion) + NOTIFICATION LOGIC
  toggleTodo: async (id: number) => {
    try {
      const todo = get().todos.find((t) => t.id === id);
      if (!todo) return;

      const newStatus = !todo.isCompleted;

      // Optimistic-like update: DB First
      await db
        .update(todos)
        .set({ isCompleted: newStatus })
        .where(eq(todos.id, id));

      await get().loadTodos(); // Sync State

      // Check if ALL tasks are now complete
      if (newStatus) {
        const currentTodos = get().todos;
        const activeCount = currentTodos.filter((t) => !t.isCompleted).length;

        // If 0 active tasks remain, celebrate!
        if (activeCount === 0 && currentTodos.length > 0) {
          import("expo-notifications").then(({ scheduleNotificationAsync }) => {
            scheduleNotificationAsync({
              content: {
                title: "All Tasks Completed! 🎉",
                body: "Great job! You've finished everything for now.",
              },
              trigger: null, // immediate
            });
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 5. UPDATE (Edit Text)
  updateTodo: async (id: number, text: string) => {
    try {
      await db.update(todos).set({ text }).where(eq(todos.id, id));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },

  // 6. DELETE (Single)
  deleteTodo: async (id: number) => {
    try {
      await db.delete(todos).where(eq(todos.id, id));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },

  // 7. DELETE (Batch - Clear History)
  deleteCompleted: async () => {
    try {
      await db.delete(todos).where(eq(todos.isCompleted, true));
      await get().loadTodos();
    } catch (e) {
      console.error(e);
    }
  },
}));
```

#### Key Function Breakdown: `toggleTodo(id)`

### C. UI & Visuals (`/components`)

#### `TodoItem.tsx`

**Why Haptics?**
Mobile apps should _feel_ physical. We added `Haptics.impactAsync()` on press.
**Interaction Design**:

- **Tap**: Toggle completion.
- **Long Press**: Enter "Edit Mode".
  - _How:_ We swap the `<Text>` component for a `<TextInput>` conditionally based on the `isEditing` state.
- **Delete**: Separate touch target (Trash icon).

#### `ProgressRing.tsx`

**Why SVG + Reanimated?**

- **SVG**: Draws sharp circles at any size.
- **Reanimated**: Runs animations on the _UI Thread_ (Native side), not the JS Thread. This ensures the progress ring fills up smoothly (60fps) even if the app is busy processing data.
- **Math**: We use `strokeDashoffset` to control how much of the circle's border is painted.
  - `circumference * (1 - progress)` -> If progress is 1 (100%), offset is 0 (Full Circle).

### D. Navigation (`/app`)

#### `_layout.tsx` (Root)

This is the entry point.

1.  **`useDrizzleStudio`**: Injects the code needed to view the DB in your web browser.
2.  **`Notifications.setNotificationHandler`**: Tells the OS "Yes, show the alert even if the app is open."
3.  **`useEffect(init)`**: Starts the Database/Zustand store immediately when the app launches.

#### `(tabs)/_layout.tsx`

Uses `expo-router`'s `<Tabs>`. It automatically creates the bottom tab bar. We customized the `tabBarIcon` to use `Lucide` icons for a consistent look.

---

## 4. Building for Production vs Development

**Why was the app 200MB?**

- **Dev Build**: Contains the "Metro Bundler" (a server inside your phone) to let you hot-reload code.
- **Production Build**: We ran `eas build --profile preview` to change `buildType` to `apk`.
  - This tells Expo: "Don't include the server. Bundle the JavaScript file inside the APK."
  - Result: A standalone file that runs offline and is much smaller (~30MB).
