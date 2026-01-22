# Project Summary: Modern Offline Todo App

## 1. Technology Stack & Libraries

We built a production-grade, offline-first mobile application using the modern **Expo** ecosystem.

- **Core Framework**: [React Native](https://reactnative.dev/) via [Expo SDK 54](https://expo.dev/).
- **Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) + [drizzle-orm](https://orm.drizzle.team/).
- **State Management**: [Zustand](https://github.com/pmndrs/zustand).
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS).
- **Reminders**: [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker).
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/).
- **Tools**: `expo-drizzle-studio-plugin` (DB Inspector), `expo-notifications`.

## 2. Architecture Overview

The app follows a **Unidirectional Data Flow** with a persistent local database.

1.  **UI Component** triggers an Action (e.g., `addTodo` with a Due Date).
2.  **Zustand Store** schedules a notification and writes to **SQLite**.
3.  **Database** ensures persistence offline.
4.  **UI** re-renders automatically to reflect the new state and deadlines.

## 3. detailed Code Walkthrough

### Database Layer (`/db`)

- **`schema.ts`**: Blueprint for the `todos` table, including `id`, `text`, `isCompleted`, `createdAt`, and `dueDate`.
- **`client.ts`**: Initialization and **Migrations**. It handles adding the `due_date` column to existing databases automatically.

### State Management (`/store`)

- **`useTodoStore.ts`**: The central brain.
  - **`addTodo(text, dueDate)`**: Inserts the task and calculates a `timeInterval` trigger for `expo-notifications`.
  - **`toggleTodo(id)`**: Updates completion status. Reminders are handled at the time of creation.
  - **`loadTodos()`**: Re-fetches all data to keep the UI "Source of Truth" coming from the database.

### User Interface (`/app` & `/components`)

- **`_layout.tsx`**: Sets up the **Android Notification Channel** (required for Android 13+) and Drizzle Studio.
- **`(tabs)/index.tsx`**: Main screen with **Progress Ring** and task list.
- **`settings.tsx`**: Provides system info and a **Test Notification** button to verify system health.
- **Components**:
  - **`AddTodo.tsx`**: Features **Smart Presets** (5m, 1h, Tomorrow) for rapid scheduling.
  - **`TodoItem.tsx`**: Displays haptic feedback on interaction and shows clear deadlines.
  - **`ProgressRing.tsx`**: Animates your daily goal progress.

## 4. Build & Deployment

- **Standalone APK** (`npx eas build --profile preview --platform android`): Generates a 30MB offline-capable APK by bundling the JS. This does NOT require a computer to run.
- **Development Build**: Larger file (~200MB) used for debugging and hot-reloading via Metro.

## 5. Next Steps

- **Test Reminders**: Use the "Quick Reminder" chips to set a 5m alert.
- **Production**: Run the production build for the Play Store (.aab).
